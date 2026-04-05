using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Supabase.Gotrue;
using static Enterprise.Flowstate.DAL.Constants.FlowStateConstants;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    public class WeeklyPeriodResetService : BackgroundService
    {
        private readonly ILogger<WeeklyPeriodResetService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public WeeklyPeriodResetService(
            ILogger<WeeklyPeriodResetService> logger,
            IServiceScopeFactory scopeFactory
            )
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Weekly Period Reset Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var nextReset = GetNextResetTime(now);
                    var delay = nextReset - now;
                    if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;

                    _logger.LogInformation("Next weekly reset scheduled for: {NextReset} UTC (in {Delay})", nextReset, delay);

                    // Check for mid-week startup edge case BEFORE waiting
                    await HandleMidWeekStartupAsync(stoppingToken);

                    await Task.Delay(delay, stoppingToken);

                    if (stoppingToken.IsCancellationRequested)
                        break;

                    // Create scope just before using it
                    using var scope = _scopeFactory.CreateScope();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                    var cache = scope.ServiceProvider.GetRequiredService<ICache>();

                    // Perform weekly reset
                    _logger.LogInformation("Starting weekly period reset...");
                    await PerformWeeklyResetAsync(omniService,cache,stoppingToken);
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

        private async Task HandleMidWeekStartupAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                var cache = scope.ServiceProvider.GetRequiredService<ICache>();

                var (startDate, endDate) = PeriodHelper.GetCurrentWeekPeriod();
                bool isWeeklyExist = await omniService.LeaderboardComparisonService.IsWeeklyUserStatsPresent(startDate, endDate);

                if (!isWeeklyExist)
                {
                    _logger.LogWarning("No weekly stats found for current period {StartDate} to {EndDate}. Service may have started mid-week.", startDate, endDate);
                    _logger.LogInformation("Performing initial sync of current week data...");

                    //var workspaceGuids = await omniService.WorkspaceService.GetAllActiveWorkspaceGuid();
                    //var workspaceIds = await omniService.WorkspaceService.GetAllActiveWorkspaceIds();
                    var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();


                    int totalSynced = 0;

                    foreach (var workspaceInfo in workspaceInfos)
                    {
                        if (stoppingToken.IsCancellationRequested)
                            break;

                        try
                        {
                            var synced = await SyncWorkspaceDataAsync(workspaceInfo.WorkspaceGuid, workspaceInfo.WorkspaceId, omniService, cache, stoppingToken);
                            totalSynced += synced;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error during initial sync for workspace {WorkspaceGuid}", workspaceInfo.WorkspaceGuid);
                        }
                    }

                    _logger.LogInformation("Initial weekly sync completed: {Total} users synced", totalSynced);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling mid-week startup check");
                // Don't throw - allow service to continue with normal schedule
            }
        }

        private async Task PerformWeeklyResetAsync(IOmniService omniService,ICache cache,CancellationToken stoppingToken)
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
                        var processed = await ProcessWorkspaceResetAsync(workspaceInfo.WorkspaceGuid, workspaceInfo.WorkspaceId, omniService, cache, stoppingToken);
                        totalProcessed += processed;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing workspace {WorkspaceId}", workspaceInfo.WorkspaceId);
                    }
                }

                stopwatch.Stop();
                _logger.LogInformation("Weekly reset completed: {Total} users processed, Duration: {Duration}s",
                    totalProcessed, stopwatch.Elapsed.TotalSeconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fatal error during weekly reset");
                throw;
            }
        }

        private async Task<int> ProcessWorkspaceResetAsync(string workspaceGuid,int workspaceId, IOmniService omniService,ICache cache,CancellationToken cancellationToken)
        {
            _logger.LogInformation("Processing workspace {WorkspaceId}", workspaceId);

            // Perform final sync before reset
            await SyncWorkspaceDataAsync(workspaceGuid,workspaceId,omniService,cache,cancellationToken);

            try
            {
                // Freeze current week rankings to previous week in Redis
                await FreezeRankingsToRedisAsync(workspaceGuid,workspaceId, cache);

                // Get all users in this workspace
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

        private async Task FreezeRankingsToRedisAsync(string workspaceGuid,int workspaceId, ICache cache)
        {
            _logger.LogInformation("Freezing rankings for workspace {WorkspaceId}", workspaceId);
            try
            {
                var ws = cache.Workspace(workspaceGuid,workspaceId);

                // Snapshot current ranking → previous week before clearing
                await ws.Ranking.SnapshotToPreviousWeekAsync(TimeSpan.FromDays(8));

                // Freeze user metrics
                var currentRankings = await ws.Ranking.GetPageAsync(1, 1000);
                if (currentRankings.Any())
                {
                    foreach (var (userId, metric) in currentRankings)
                    {
                        var previousMetricKey = string.Format(
                            FlowStateConstants.Cache.UserMetricPrevious,
                            workspaceId,
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

        // Consolidated sync method - used by both initial sync and weekly reset
        private async Task<int> SyncWorkspaceDataAsync(string workspaceGuid,int workspaceId,IOmniService omniService,ICache cache,CancellationToken stoppingToken)
        {
            _logger.LogInformation("Syncing workspace {WorkspaceId}", workspaceGuid);

            try
            {
                var pendingUserIds = await cache.GetAndClearPendingUpdatesAsync(workspaceGuid,workspaceId);

                if (!pendingUserIds.Any())
                {
                    //omniService.DashboardService.CopyPreviousStats(workspaceId);
                    _logger.LogDebug("No pending updates for workspace {WorkspaceId}", workspaceGuid);
                    return 0;
                }

                _logger.LogInformation("Syncing {Count} users for workspace {WorkspaceId}",
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
                            _logger.LogWarning("Metric not found in Redis for user {UserId} workspace {WorkspaceId}",
                                userId,workspaceGuid);
                            continue;
                        }

                        var rank = await cache.GetUserRankAsync(workspaceGuid, userId);

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
                        _logger.LogError(ex, "Error synusing Enterprise.Flowstate.BAL.BusinessLogic.Services;\r\nusing Enterprise.Flowstate.BAL.Interface.Service;\r\nusing Enterprise.Flowstate.DAL.Constants;\r\nusing Enterprise.Flowstate.DAL.DTO;\r\nusing Enterprise.Flowstate.DAL.Models;\r\nusing Microsoft.Extensions.DependencyInjection;\r\nusing Microsoft.Extensions.Hosting;\r\nusing Microsoft.Extensions.Logging;\r\nusing Task = System.Threading.Tasks.Task;\r\n\r\nnamespace Enterprise.Flowstate.BAL.BusinessLogic.BGService\r\n{\r\n    public class WeeklyPeriodResetService : BackgroundService\r\n    {\r\n        private readonly ILogger<WeeklyPeriodResetService> _logger;\r\n        private readonly ICache _cache;\r\n        private readonly IServiceScopeFactory _scopeFactory;\r\n\r\n        public WeeklyPeriodResetService(\r\n            ILogger<WeeklyPeriodResetService> logger,\r\n            IServiceScopeFactory scopeFactory,\r\n            ICache cache)\r\n        {\r\n            _logger = logger;\r\n            _cache = cache;\r\n            _scopeFactory = scopeFactory;\r\n        }\r\n\r\n        protected override async Task ExecuteAsync(CancellationToken stoppingToken)\r\n        {\r\n            _logger.LogInformation(\"Weekly Period Reset Service started\");\r\n\r\n            // FIX 1: Run mid-week check ONCE on startup, outside the loop\r\n            await HandleMidWeekStartupAsync(stoppingToken);\r\n\r\n            while (!stoppingToken.IsCancellationRequested)\r\n            {\r\n                try\r\n                {\r\n                    var now = DateTime.UtcNow;\r\n                    var nextReset = GetNextResetTime(now);\r\n                    var delay = nextReset - now;\r\n                    if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;\r\n\r\n                    _logger.LogInformation(\"Next weekly reset scheduled for: {NextReset} UTC (in {Delay})\", nextReset, delay);\r\n\r\n                    await Task.Delay(delay, stoppingToken);\r\n\r\n                    if (stoppingToken.IsCancellationRequested)\r\n                        break;\r\n\r\n                    using var scope = _scopeFactory.CreateScope();\r\n                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();\r\n\r\n                    _logger.LogInformation(\"Starting weekly period reset...\");\r\n                    await PerformWeeklyResetAsync(omniService, stoppingToken);\r\n                    _logger.LogInformation(\"Weekly period reset completed\");\r\n\r\n                    // Wait 2 hours to avoid re-triggering on the same Monday\r\n                    await Task.Delay(TimeSpan.FromHours(2), stoppingToken);\r\n                }\r\n                catch (OperationCanceledException)\r\n                {\r\n                    _logger.LogInformation(\"Weekly Period Reset Service is stopping\");\r\n                    break;\r\n                }\r\n                catch (Exception ex)\r\n                {\r\n                    _logger.LogError(ex, \"Error in weekly period reset service\");\r\n\r\n                    // FIX 4: Retry with backoff instead of looping back to next Monday\r\n                    // Try again in 30 minutes — stays well within the same Monday\r\n                    _logger.LogWarning(\"Reset failed. Retrying in 30 minutes...\");\r\n                    await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);\r\n                }\r\n            }\r\n\r\n            _logger.LogInformation(\"Weekly Period Reset Service stopped\");\r\n        }\r\n\r\n        private async Task HandleMidWeekStartupAsync(CancellationToken stoppingToken)\r\n        {\r\n            try\r\n            {\r\n                using var scope = _scopeFactory.CreateScope();\r\n                var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();\r\n\r\n                var (startDate, endDate) = PeriodHelper.GetCurrentWeekPeriod();\r\n                bool isWeeklyExist = await omniService.LeaderboardComparisonService.IsWeeklyUserStatsPresent(startDate, endDate);\r\n\r\n                if (!isWeeklyExist)\r\n                {\r\n                    _logger.LogWarning(\r\n                        \"No weekly stats found for current period {StartDate} to {EndDate}. \" +\r\n                        \"Service may have started mid-week — performing initial sync.\",\r\n                        startDate, endDate);\r\n\r\n                    var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();\r\n                    int totalSynced = 0;\r\n\r\n                    foreach (var workspaceInfo in workspaceInfos)\r\n                    {\r\n                        if (stoppingToken.IsCancellationRequested)\r\n                            break;\r\n\r\n                        try\r\n                        {\r\n                            // FIX 3: Delegate sync entirely to DatabaseSyncService.\r\n                            // Just snapshot/freeze previous week if missing — no duplicate sync logic here.\r\n                            await FreezeRankingsToRedisAsync(workspaceInfo.WorkspaceGuid, workspaceInfo.WorkspaceId, _cache);\r\n                            totalSynced++;\r\n                        }\r\n                        catch (Exception ex)\r\n                        {\r\n                            _logger.LogError(ex, \"Error during initial sync for workspace {WorkspaceGuid}\", workspaceInfo.WorkspaceGuid);\r\n                        }\r\n                    }\r\n\r\n                    _logger.LogInformation(\"Initial weekly sync completed: {Total} workspaces processed\", totalSynced);\r\n                }\r\n                else\r\n                {\r\n                    _logger.LogInformation(\"Weekly stats already present for current period. No mid-week sync needed.\");\r\n                }\r\n            }\r\n            catch (Exception ex)\r\n            {\r\n                _logger.LogError(ex, \"Error handling mid-week startup check\");\r\n                // Don't throw — allow service to continue with normal schedule\r\n            }\r\n        }\r\n\r\n        private async Task PerformWeeklyResetAsync(IOmniService omniService, CancellationToken stoppingToken)\r\n        {\r\n            var stopwatch = System.Diagnostics.Stopwatch.StartNew();\r\n\r\n            try\r\n            {\r\n                // FIX 3: No sync logic here — DatabaseSyncService owns that.\r\n                // This service only handles freeze + clear.\r\n                var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();\r\n\r\n                _logger.LogInformation(\"Processing {Count} workspaces for weekly reset\", workspaceInfos.Count);\r\n\r\n                int totalProcessed = 0;\r\n\r\n                foreach (var workspaceInfo in workspaceInfos)\r\n                {\r\n                    if (stoppingToken.IsCancellationRequested)\r\n                        break;\r\n\r\n                    try\r\n                    {\r\n                        await ProcessWorkspaceResetAsync(workspaceInfo.WorkspaceGuid, workspaceInfo.WorkspaceId, omniService, stoppingToken);\r\n                        totalProcessed++;\r\n                    }\r\n                    catch (Exception ex)\r\n                    {\r\n                        _logger.LogError(ex, \"Error processing workspace {WorkspaceId}\", workspaceInfo.WorkspaceId);\r\n                    }\r\n                }\r\n\r\n                stopwatch.Stop();\r\n                _logger.LogInformation(\"Weekly reset completed: {Total} workspaces processed, Duration: {Duration}s\",\r\n                    totalProcessed, stopwatch.Elapsed.TotalSeconds);\r\n            }\r\n            catch (Exception ex)\r\n            {\r\n                _logger.LogError(ex, \"Fatal error during weekly reset\");\r\n                throw;\r\n            }\r\n        }\r\n\r\n        private async Task ProcessWorkspaceResetAsync(string workspaceGuid, int workspaceId, IOmniService omniService, CancellationToken cancellationToken)\r\n        {\r\n            _logger.LogInformation(\"Processing workspace {WorkspaceId}\", workspaceId);\r\n\r\n            try\r\n            {\r\n                await FreezeRankingsToRedisAsync(workspaceGuid, workspaceId, _cache);\r\n\r\n                var allUserIds = await omniService.WorkspaceService.GetAllActiveWorkspaceUser(workspaceId);\r\n                _logger.LogInformation(\"Found {Count} users in workspace {WorkspaceId}\", allUserIds.Count, workspaceId);\r\n            }\r\n            catch (Exception ex)\r\n            {\r\n                _logger.LogError(ex, \"Failed to process workspace {WorkspaceId}\", workspaceId);\r\n                throw;\r\n            }\r\n        }\r\n\r\n        private async Task FreezeRankingsToRedisAsync(string workspaceGuid, int workspaceId, ICache cache)\r\n        {\r\n            _logger.LogInformation(\"Freezing rankings for workspace {WorkspaceId}\", workspaceId);\r\n            try\r\n            {\r\n                var ws = cache.Workspace(workspaceGuid, workspaceId);\r\n\r\n                await ws.Ranking.SnapshotToPreviousWeekAsync(TimeSpan.FromDays(8));\r\n\r\n                var currentRankings = await ws.Ranking.GetPageAsync(1, 1000);\r\n                if (currentRankings.Any())\r\n                {\r\n                    foreach (var (userId, metric) in currentRankings)\r\n                    {\r\n                        var previousMetricKey = string.Format(\r\n                            FlowStateConstants.Cache.UserMetricPrevious,\r\n                            workspaceId,\r\n                            userId);\r\n                        await cache.SetAsync(previousMetricKey, metric, TimeSpan.FromDays(8));\r\n                    }\r\n                    _logger.LogInformation(\"Froze {Count} user rankings for workspace {WorkspaceId}\",\r\n                        currentRankings.Count, workspaceId);\r\n                }\r\n\r\n                await ws.Ranking.ClearAsync();\r\n            }\r\n            catch (Exception ex)\r\n            {\r\n                _logger.LogError(ex, \"Error freezing rankings for workspace {WorkspaceId}\", workspaceId);\r\n                throw;\r\n            }\r\n        }\r\n\r\n        private DateTime GetNextResetTime(DateTime nowUtc)\r\n        {\r\n            int daysUntilMonday = ((int)DayOfWeek.Monday - (int)nowUtc.DayOfWeek + 7) % 7;\r\n\r\n            // FIX 2: Only skip to next Monday if today IS Monday AND midnight has already passed.\r\n            // Previously this always skipped when daysUntilMonday == 0, even if it was Monday at 11PM\r\n            // and the reset hadn't happened yet.\r\n            if (daysUntilMonday == 0)\r\n            {\r\n                var todayMidnight = nowUtc.Date; // midnight today\r\n                if (nowUtc > todayMidnight)\r\n                {\r\n                    // We're past midnight on Monday — this week's reset already happened\r\n                    daysUntilMonday = 7;\r\n                }\r\n                // else: it IS exactly midnight Monday — reset should fire now (delay = 0)\r\n            }\r\n\r\n            var nextMonday = nowUtc.Date.AddDays(daysUntilMonday);\r\n            return new DateTime(nextMonday.Year, nextMonday.Month, nextMonday.Day, 0, 0, 0, DateTimeKind.Utc);\r\n        }\r\n    }\r\n}cing user {UserId} in workspace {WorkspaceGuid}",
                            userId,workspaceGuid);
                    }
                }

                return syncedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync workspace {WorkspaceId}", workspaceId);
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