using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    /// <summary>
    /// Single background service that owns the full leaderboard lifecycle.
    /// WeeklyPeriodResetService is DELETED — this handles everything.
    ///
    /// Responsibilities:
    ///   1. Startup  — prime Redis if cold (fixes blank leaderboard on fresh start)
    ///   2. Every 60 min — flush Redis pending set → Supabase DB
    ///   3. New week detected — carry reputation forward, clear Redis, reseed scores
    /// </summary>
    public class DatabaseSyncService : BackgroundService
    {
        private readonly ILogger<DatabaseSyncService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _syncInterval = TimeSpan.FromMinutes(60);
        private readonly TimeSpan _startupDelay = TimeSpan.FromSeconds(30);

        public DatabaseSyncService(ILogger<DatabaseSyncService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken ct)
        {
            _logger.LogInformation("DatabaseSyncService starting — first run in {Delay}s", _startupDelay.TotalSeconds);
            await Task.Delay(_startupDelay, ct);

            // ── Startup: prime Redis if cold ──────────────────────────────────
            await EnsureRedisPrimedAsync(ct);

            // ── Periodic loop ─────────────────────────────────────────────────
            while (!ct.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var cache = scope.ServiceProvider.GetRequiredService<ICache>();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                    var recalc = scope.ServiceProvider.GetRequiredService<IScoreRecalculationService>();

                    // Check for week rollover BEFORE syncing
                    await HandleWeekRolloverAsync(cache, omniService, recalc, ct);

                    // Flush Redis → DB
                    await RunSyncCycleAsync(cache, omniService, ct);
                }
                catch (OperationCanceledException) { break; }
                catch (Exception ex) { _logger.LogError(ex, "DatabaseSyncService error"); }

                await Task.Delay(_syncInterval, ct);
            }

            _logger.LogInformation("DatabaseSyncService stopped");
        }

        // ── 1. Startup: prime Redis if empty ─────────────────────────────────

        private async Task EnsureRedisPrimedAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var cache = scope.ServiceProvider.GetRequiredService<ICache>();
                var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                var recalc = scope.ServiceProvider.GetRequiredService<IScoreRecalculationService>();

                var workspaces = await omniService.WorkspaceService.GetAllWorkspaceInfo();
                bool anyEmpty = false;

                foreach (var ws in workspaces)
                {
                    var rankings = await cache.GetWorkspaceRankingsAsync(ws.WorkspaceGuid, 1, 1);
                    if (rankings == null || rankings.Count == 0) { anyEmpty = true; break; }
                }

                if (anyEmpty)
                {
                    _logger.LogWarning("Redis is cold on startup — running full score recalculation");
                    await recalc.RecalculateAllWorkspacesAsync(ct);
                    _logger.LogInformation("Startup recalculation complete — leaderboard is now populated");
                }
                else
                {
                    _logger.LogInformation("Redis already warm — no startup recalculation needed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Startup prime check failed — periodic sync will still run");
            }
        }

        // ── 2. New week detection + rollover ─────────────────────────────────

        private async Task HandleWeekRolloverAsync(
            ICache cache, IOmniService omniService, IScoreRecalculationService recalc, CancellationToken ct)
        {
            try
            {
                var (weekStart, _) = PeriodHelper.GetCurrentWeekPeriod();
                var weekKey = "system:current_week_start";
                var weekStartStr = weekStart.ToString("yyyy-MM-dd");

                var stored = await cache.GetStringAsync(weekKey);
                if (stored == weekStartStr) return; // same week, nothing to do

                _logger.LogInformation("New week detected — rolling over from {Prev} to {Curr}", stored, weekStartStr);

                var workspaces = await omniService.WorkspaceService.GetAllWorkspaceInfo();

                foreach (var ws in workspaces)
                {
                    if (ct.IsCancellationRequested) break;
                    try { await RolloverWorkspaceAsync(ws.WorkspaceGuid, ws.WorkspaceId, cache, ct); }
                    catch (Exception ex) { _logger.LogError(ex, "Rollover failed for workspace {Guid}", ws.WorkspaceGuid); }
                }

                // Stamp new week BEFORE recalculation so a crash mid-recalc doesn't re-rollover
                await cache.SetStringAsync(weekKey, weekStartStr);

                // Seed new week with fresh scores (carries reputation forward internally)
                _logger.LogInformation("Seeding new week scores");
                await recalc.RecalculateAllWorkspacesAsync(ct);

                _logger.LogInformation("Week rollover complete");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Week rollover check failed");
            }
        }

        private async Task RolloverWorkspaceAsync(
            string workspaceGuid, int workspaceId, ICache cache, CancellationToken ct)
        {
            // 1. Carry reputation into each user's metric before clearing
            var rankings = await cache.GetWorkspaceRankingsAsync(workspaceGuid, 1, 1000);

            foreach (var (userGuid, metric) in rankings)
            {
                if (ct.IsCancellationRequested) break;

                metric.ReputationPoints += (float)((metric.Score) * 0.1f);
                metric.CumulativeScore += metric.Score;

                await _cache_UpsertUserMetric(cache, workspaceGuid, userGuid, metric);
                await cache.AddPendingUpdateAsync(workspaceGuid, userGuid); // persist to DB before clear
            }

            // 2. Final flush of this week's data before clearing Redis
            // (the sync cycle that follows HandleWeekRollover will do this — no need to duplicate)

            // 3. Clear current week rankings — new week starts fresh
            var ws = cache.Workspace(workspaceGuid, workspaceId);
            await ws.Ranking.ClearAsync();

            _logger.LogInformation(
                "Rolled over {Count} users for workspace {Guid}", rankings.Count, workspaceGuid);
        }

        // Thin wrapper to avoid ambiguity — cache.UpsertUserMetricAsync is the real call
        private static Task _cache_UpsertUserMetric(ICache cache, string workspaceGuid, string userGuid, RankingCacheModel metric)
            => cache.UpsertUserMetricAsync(workspaceGuid, userGuid, metric);

        // ── 3. Periodic sync: Redis pending set → Supabase DB ────────────────

        private async Task RunSyncCycleAsync(ICache cache, IOmniService omniService, CancellationToken ct)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var workspaces = await omniService.WorkspaceService.GetAllWorkspaceInfo();
            int totalSynced = 0, totalErrors = 0;

            foreach (var ws in workspaces)
            {
                if (ct.IsCancellationRequested) break;
                try { totalSynced += await SyncWorkspaceAsync(ws.WorkspaceGuid, ws.WorkspaceId, cache, omniService, ct); }
                catch (Exception ex) { totalErrors++; _logger.LogError(ex, "Sync failed for workspace {Guid}", ws.WorkspaceGuid); }
            }

            sw.Stop();
            _logger.LogInformation("Sync complete — {Synced} users, {Errors} errors, {Duration:F1}s",
                totalSynced, totalErrors, sw.Elapsed.TotalSeconds);
        }

        private async Task<int> SyncWorkspaceAsync(
            string workspaceGuid, int workspaceId,
            ICache cache, IOmniService omniService, CancellationToken ct)
        {
            // Atomically grab-and-clear pending set (rename trick = no double-processing)
            var pending = await cache.GetAndClearPendingUpdatesAsync(workspaceGuid, workspaceId);
            if (!pending.Any())
            {
                _logger.LogDebug("No pending updates for {WorkspaceGuid}", workspaceGuid);
                return 0;
            }

            _logger.LogInformation("Syncing {Count} users for workspace {WorkspaceGuid}", pending.Count, workspaceGuid);

            var (weekStart, weekEnd) = PeriodHelper.GetCurrentWeekPeriodDateOnly();
            int synced = 0;

            foreach (var userGuid in pending)
            {
                if (ct.IsCancellationRequested) break;
                try
                {
                    var metric = await cache.GetUserMetricAsync(workspaceGuid, userGuid);
                    if (metric == null)
                    {
                        _logger.LogWarning("Metric missing in Redis for {UserGuid} — skipping", userGuid);
                        continue;
                    }

                    var rank = await cache.GetUserRankAsync(workspaceGuid, userGuid);
                    int userId = await cache.GetUserId(workspaceGuid, userGuid);

                    await omniService.ProfileService.UpertWeeklyUserMetric(new WeeklyUserStatsDto
                    {
                        UserId = userId,
                        WorkspaceId = workspaceId,
                        ContributionPoint = metric.ContributionPoint,
                        Efficiency = metric.Efficiency,
                        Score = (float)metric.Score,
                        TotalHours = metric.TotalHours,
                        RankPosition = (int)(rank ?? 0),
                        TicketsCompleted = metric.TotalTicketCompleted,
                        StartPeriod = weekStart,
                        EndPeriod = weekEnd,
                        CreatedAt = DateTime.UtcNow,
                        ReputationPoints = metric.ReputationPoints,
                        CumulativeScore = metric.CumulativeScore,
                    });

                    synced++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error persisting {UserGuid}", userGuid);
                }
            }

            return synced;
        }
    }
}