using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    public class WeeklyPeriodResetService : BackgroundService
    {
        private readonly ILogger<WeeklyPeriodResetService> _logger;
        private readonly ICache _cache;
        private readonly IServiceScopeFactory _scopeFactory;

        public WeeklyPeriodResetService(
            ILogger<WeeklyPeriodResetService> logger,
            IServiceScopeFactory scopeFactory,
            ICache cache

            )
        {
            _logger = logger;
            _cache = cache;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Weekly Period Reset Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {

                    var scope = _scopeFactory.CreateScope();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();                               
                    
                    var now = DateTime.UtcNow;
                    var nextReset = GetNextResetTime(now);
                    var delay = nextReset - now;
                    if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;

                    _logger.LogInformation("Next weekly reset scheduled for: {NextReset} UTC (in {Delay})", nextReset, delay);
                    await Task.Delay(delay, stoppingToken);

                    if (stoppingToken.IsCancellationRequested)
                        break;

                    // Perform weekly reset
                    _logger.LogInformation("Starting weekly period reset...");
                    await PerformWeeklyResetAsync(omniService,stoppingToken);
                    _logger.LogInformation("Weekly period reset completed");

                    // Wait 2 hours to avoid multiple resets
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

        private async Task PerformWeeklyResetAsync(IOmniService omniService,CancellationToken stoppingToken)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                // Step 1: Sync any pending Redis data to DB before reset
                _logger.LogInformation("Syncing pending data before reset...");

                // Step 2: Get all active workspaces
                var workspaceIds = await omniService.WorkspaceService.GetAllActiveWorkspaceIds();

                _logger.LogInformation("Processing {Count} workspaces for weekly reset", workspaceIds.Count);

                int totalProcessed = 0;

                foreach (var workspaceId in workspaceIds)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        var processed = await ProcessWorkspaceResetAsync(workspaceId,omniService,stoppingToken);
                        totalProcessed += processed;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing workspace {WorkspaceId}", workspaceId);
                    }
                }

                stopwatch.Stop();
                _logger.LogInformation("✅ Weekly reset completed: {Total} users processed, Duration: {Duration}s",
                    totalProcessed, stopwatch.Elapsed.TotalSeconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Fatal error during weekly reset");
                throw;
            }
        }

        private async Task<int> ProcessWorkspaceResetAsync(int workspaceId,IOmniService omniService,CancellationToken cancellationToken)
        {
            _logger.LogInformation("Processing workspace {WorkspaceId}", workspaceId);

            // Perform final sync before reset
            await FinalSyncBeforeResetAsync(workspaceId,omniService,cancellationToken);

            try
            {
                // Step 1: Freeze current week rankings to previous week in Redis
                await FreezeRankingsToRedisAsync(workspaceId, _cache);

                // Step 2: Get all users in this workspace (from DB + Redis)
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

        private async Task FreezeRankingsToRedisAsync(int workspaceId, ICache cache)
        {
            _logger.LogInformation("❄️ Freezing rankings for workspace {WorkspaceId}", workspaceId);

            try
            {
                var currentRankingKey = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);
                var previousRankingKey = string.Format(FlowStateConstants.PREVIOUS_WEEK_RANKING_KEY, workspaceId);

                // Copy the sorted set from current to previous week
                await cache.CopySortedSetAsync(currentRankingKey, previousRankingKey, TimeSpan.FromDays(8));

                // Also freeze user metrics
                var currentRankings = await cache.GetWorkspaceRankingsAsync(workspaceId.ToString(), 1, 1000);

                if (currentRankings.Any())
                {
                    foreach (var (userId, metric) in currentRankings)
                    {
                        var previousMetricKey = string.Format(
                            FlowStateConstants.PREVIOUS_WEEK_METRIC_KEY,
                            workspaceId,
                            userId);

                        await cache.SetAsync(previousMetricKey, metric, TimeSpan.FromDays(8));
                    }

                    _logger.LogInformation("✅ Froze {Count} user rankings for workspace {WorkspaceId}",
                        currentRankings.Count, workspaceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error freezing rankings for workspace {WorkspaceId}", workspaceId);
                throw;
            }
        }

        public async Task<int> FinalSyncBeforeResetAsync(int workspaceId,IOmniService omniService,CancellationToken stoppingToken)
        {
            _logger.LogInformation("Performing final sync for workspace {WorkspaceId} before reset", workspaceId);

            try
            {
                string workspaceIdInString = workspaceId.ToString();
                var pendingUserIds = await _cache.GetAndClearPendingUpdatesAsync(workspaceIdInString);

                if (!pendingUserIds.Any())
                {
                    _logger.LogDebug("No pending updates for workspace {WorkspaceId}", workspaceIdInString);
                    return 0;
                }

                _logger.LogInformation("Syncing {Count} users for workspace {WorkspaceId}",
                    pendingUserIds.Count, workspaceIdInString);

                var (currentWeekStart, currentWeekEnd) = PeriodHelper.GetCurrentWeekPeriod();
                int syncedCount = 0;

                foreach (var userId in pendingUserIds)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        RankingCacheModel metric = await _cache.GetUserMetricAsync(workspaceIdInString, userId);

                        if (metric == null)
                        {
                            _logger.LogWarning("Metric not found in Redis for user {UserId} workspace {WorkspaceId}",
                                userId, workspaceIdInString);
                            continue;
                        }

                        var rank = await _cache.GetUserRankAsync(workspaceIdInString, userId);

                        WeeklyUserStatsDto userMetric = new WeeklyUserStatsDto
                        {
                            ContributionPoint = metric.ContributionPoint,
                            Efficiency = metric.Efficiency,
                            CreatedAt = DateTime.UtcNow,
                            Score = (float?)metric.Score,
                            TotalHours = metric.TotalHours,
                            RankPosition = (int)(rank ?? 0),
                            TicketsCompleted = metric.TotalTicketCompleted,
                            UserId = Convert.ToInt32(userId),
                            WorkspaceId = workspaceId,
                            EndPeriod = currentWeekEnd,
                            StartPeriod = currentWeekStart,
                        };

                        // Upsert the metric to database
                        await omniService.ProfileService.UpertWeeklyUserMetric(userMetric);

                        syncedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error syncing user {UserId} in workspace {WorkspaceId}",
                            userId, workspaceIdInString);
                    }
                }

                return syncedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process workspace {WorkspaceId}", workspaceId);
                throw;
            }
        }

        private DateTime GetNextResetTime(DateTime nowUtc)
        {
            // Calculate days until next Monday
            int daysUntilMonday = ((int)DayOfWeek.Monday - (int)nowUtc.DayOfWeek + 7) % 7;

            // If today is Monday but we're past midnight, wait for next Monday
            if (daysUntilMonday == 0)
            {
                daysUntilMonday = 7;
            }

            var nextMonday = nowUtc.Date.AddDays(daysUntilMonday);
            return new DateTime(nextMonday.Year, nextMonday.Month, nextMonday.Day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}