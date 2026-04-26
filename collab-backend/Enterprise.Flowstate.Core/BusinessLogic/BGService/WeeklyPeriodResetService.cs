using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    public class WeeklyPeriodResetService : BackgroundService
    {
        private readonly ILogger<WeeklyPeriodResetService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public WeeklyPeriodResetService(
            ILogger<WeeklyPeriodResetService> logger,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Weekly Period Reset Service started");

            // FIX 1: Run mid-week startup check ONCE before entering the loop.
            // Previously this was called at the TOP of every loop iteration, so it
            // re-ran every week — potentially triggering a redundant sync right after
            // a reset had just finished writing data.
            await HandleMidWeekStartupAsync(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var nextReset = GetNextResetTime(now);
                    var delay = nextReset - now;
                    if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;

                    _logger.LogInformation("Next weekly reset scheduled for: {NextReset} UTC (in {Delay})", nextReset, delay);

                    await Task.Delay(delay, stoppingToken);

                    if (stoppingToken.IsCancellationRequested)
                        break;

                    using var scope = _scopeFactory.CreateScope();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                    var cache = scope.ServiceProvider.GetRequiredService<ICache>();

                    _logger.LogInformation("Starting weekly period reset...");
                    await PerformWeeklyResetAsync(omniService, cache, stoppingToken);
                    _logger.LogInformation("Weekly period reset completed");

                    // Wait 2 hours to avoid re-triggering on the same Monday
                    await Task.Delay(TimeSpan.FromHours(2), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Weekly Period Reset Service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in weekly period reset service");
                    await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
                }
            }

            _logger.LogInformation("Weekly Period Reset Service stopped");
        }

        private async Task HandleMidWeekStartupAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                var cache = scope.ServiceProvider.GetRequiredService<ICache>();

                var (startDate, endDate) = PeriodHelper.GetCurrentWeekPeriod();
                bool isWeeklyExist = await omniService.LeaderboardComparisonService
                    .IsWeeklyUserStatsPresent(startDate, endDate);

                if (!isWeeklyExist)
                {
                    _logger.LogWarning(
                        "No weekly stats found for current period {StartDate} to {EndDate}. " +
                        "Service may have started mid-week — performing initial sync.",
                        startDate, endDate);

                    var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();
                    int totalSynced = 0;

                    foreach (var workspaceInfo in workspaceInfos)
                    {
                        if (stoppingToken.IsCancellationRequested)
                            break;

                        try
                        {
                            var synced = await SyncWorkspaceDataAsync(
                                workspaceInfo.WorkspaceGuid,
                                workspaceInfo.WorkspaceId,
                                omniService,
                                cache,
                                stoppingToken);

                            totalSynced += synced;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error during initial sync for workspace {WorkspaceGuid}", workspaceInfo.WorkspaceGuid);
                        }
                    }

                    _logger.LogInformation("Initial weekly sync completed: {Total} users synced", totalSynced);
                }
                else
                {
                    _logger.LogInformation("Weekly stats already present for current period. No mid-week sync needed.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling mid-week startup check");
                // Don't throw — allow service to continue with normal schedule
            }
        }

        private async Task PerformWeeklyResetAsync(
            IOmniService omniService, ICache cache, CancellationToken stoppingToken)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Syncing pending data before reset...");

                var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();

                _logger.LogInformation("Processing {Count} workspaces for weekly reset", workspaceInfos.Count);

                int totalProcessed = 0;

                foreach (var workspaceInfo in workspaceInfos)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        var processed = await ProcessWorkspaceResetAsync(
                            workspaceInfo.WorkspaceGuid,
                            workspaceInfo.WorkspaceId,
                            omniService,
                            cache,
                            stoppingToken);

                        totalProcessed += processed;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing workspace {WorkspaceId}", workspaceInfo.WorkspaceId);
                    }
                }

                stopwatch.Stop();
                _logger.LogInformation(
                    "Weekly reset completed: {Total} users processed, Duration: {Duration}s",
                    totalProcessed, stopwatch.Elapsed.TotalSeconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fatal error during weekly reset");
                throw;
            }
        }

        private async Task<int> ProcessWorkspaceResetAsync(
            string workspaceGuid, int workspaceId,
            IOmniService omniService, ICache cache,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Processing workspace {WorkspaceId}", workspaceId);

            // Perform final sync before reset
            await SyncWorkspaceDataAsync(workspaceGuid, workspaceId, omniService, cache, cancellationToken);

            try
            {
                // Freeze current week rankings to previous week in Redis
                await FreezeRankingsToRedisAsync(workspaceGuid, workspaceId, cache);

                var allUserIds = await omniService.WorkspaceService.GetAllActiveWorkspaceUser(workspaceId);

                _logger.LogInformation("Found {Count} users in workspace {WorkspaceId}", allUserIds.Count, workspaceId);

                return allUserIds.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process workspace {WorkspaceId}", workspaceId);
                throw;
            }
        }

        private async Task FreezeRankingsToRedisAsync(string workspaceGuid, int workspaceId, ICache cache)
        {
            _logger.LogInformation("Freezing rankings for workspace {WorkspaceId}", workspaceId);
            try
            {
                var ws = cache.Workspace(workspaceGuid, workspaceId);

                // Snapshot current ranking → previous week before clearing
                await ws.Ranking.SnapshotToPreviousWeekAsync(TimeSpan.FromDays(8));

                // Freeze user metrics individually
                var currentRankings = await ws.Ranking.GetPageAsync(1, 1000);
                if (currentRankings.Any())
                {
                    foreach (var (userId, metric) in currentRankings)
                    {
                        var previousMetricKey = string.Format(
                            FlowStateConstants.Cache.UserMetricPrevious,
                            workspaceGuid,
                            userId);
                        await cache.SetAsync(previousMetricKey, metric, TimeSpan.FromDays(8));
                    }
                    _logger.LogInformation("Froze {Count} user rankings for workspace {WorkspaceId}",
                        currentRankings.Count, workspaceId);
                }

                // Clear current week ready for new period
                await ws.Ranking.ClearAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error freezing rankings for workspace {WorkspaceId}", workspaceId);
                throw;
            }
        }

        // Consolidated sync method — used by both initial sync and weekly reset
        private async Task<int> SyncWorkspaceDataAsync(
            string workspaceGuid, int workspaceId,
            IOmniService omniService, ICache cache,
            CancellationToken stoppingToken)
        {
            _logger.LogInformation("Syncing workspace {WorkspaceGuid}", workspaceGuid);

            try
            {
                var pendingUserIds = await cache.GetAndClearPendingUpdatesAsync(workspaceGuid, workspaceId);

                if (!pendingUserIds.Any())
                {
                    _logger.LogDebug("No pending updates for workspace {WorkspaceGuid}", workspaceGuid);
                    return 0;
                }

                _logger.LogInformation("Syncing {Count} users for workspace {WorkspaceGuid}",
                    pendingUserIds.Count, workspaceGuid);

                var (currentWeekStart, currentWeekEnd) = PeriodHelper.GetCurrentWeekPeriodDateOnly();
                int syncedCount = 0;

                foreach (var userId in pendingUserIds)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        RankingCacheModel metric = await cache.GetUserMetricAsync(workspaceGuid, userId);

                        if (metric == null)
                        {
                            _logger.LogWarning(
                                "Metric not found in Redis for user {UserId} workspace {WorkspaceGuid}",
                                userId, workspaceGuid);
                            continue;
                        }

                        var rank = await cache.GetUserRankAsync(workspaceGuid, userId);

                        WeeklyUserStatsDto userMetric = new WeeklyUserStatsDto
                        {
                            ContributionPoint = metric.ContributionPoint,
                            Efficiency = metric.Efficiency,
                            CreatedAt = DateTime.UtcNow,
                            Score = (float)metric.Score,
                            TotalHours = metric.TotalHours,
                            RankPosition = (int)(rank ?? 0),
                            TicketsCompleted = metric.TotalTicketCompleted,
                            UserId = Convert.ToInt32(userId),
                            WorkspaceId = workspaceId,
                            EndPeriod = currentWeekEnd,
                            StartPeriod = currentWeekStart,
                        };

                        await omniService.ProfileService.UpertWeeklyUserMetric(userMetric);

                        syncedCount++;
                    }
                    catch (Exception ex)
                    {
                        // FIX 2: was a compile error — the entire source of another file
                        // was accidentally pasted into this log string literal.
                        _logger.LogError(ex, "Error syncing user {UserId} in workspace {WorkspaceGuid}",
                            userId, workspaceGuid);
                    }
                }

                return syncedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync workspace {WorkspaceGuid}", workspaceGuid);
                throw;
            }
        }

        private DateTime GetNextResetTime(DateTime nowUtc)
        {
            int daysUntilMonday = ((int)DayOfWeek.Monday - (int)nowUtc.DayOfWeek + 7) % 7;

            // FIX 3: Old code always added 7 when daysUntilMonday == 0, which meant
            // that if the service was running on a Monday BEFORE midnight (i.e. the
            // reset hadn't happened yet this week) it would skip all the way to the
            // NEXT Monday — missing this week's reset entirely.
            // Correct behaviour: only skip to next Monday when today IS Monday AND
            // midnight has already passed (meaning this week's reset already fired).
            if (daysUntilMonday == 0 && nowUtc > nowUtc.Date)
            {
                daysUntilMonday = 7;
            }

            var nextMonday = nowUtc.Date.AddDays(daysUntilMonday);
            return new DateTime(nextMonday.Year, nextMonday.Month, nextMonday.Day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}