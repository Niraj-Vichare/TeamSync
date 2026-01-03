using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using Google.Apis.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    public class DatabaseSyncService : BackgroundService
    {
        private readonly ILogger<DatabaseSyncService> _logger;
        private readonly TimeSpan _syncInterval = TimeSpan.FromHours(3); // Sync every 3 hours
        private readonly IConfiguration _configuration;
        private readonly IOmniService _omniService;
        private readonly ICache _cache;

        public DatabaseSyncService(
        ILogger<DatabaseSyncService> logger,
        IConfiguration configuration, IOmniService omniService, ICache cache)
        {
            _logger = logger;
            _configuration = configuration;
            _omniService = omniService;
            _cache = cache;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Database Sync Service started - syncing every {Interval} seconds",
                _syncInterval.TotalSeconds);

            // Wait a bit before first sync to let app initialize
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformSyncAsync(stoppingToken);

                    _logger.LogInformation("Next sync scheduled in {Interval} hours", _syncInterval.TotalHours);
                    await Task.Delay(_syncInterval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Database Sync Service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in database sync service");
                    // Wait 5 minutes before retry on error
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("Database Sync Service stopped");
        }

        private async Task PerformSyncAsync(CancellationToken stoppingToken)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("Starting database sync...");

            try
            {
                var activeWorkspaceIds = await _omniService.WorkspaceService.GetAllActiveWorkspaceIds();
                int totalSynced = 0;
                int totalErrors = 0;

                foreach (var workspaceId in activeWorkspaceIds)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        var synced = await SyncWorkspaceDataAsync(workspaceId, stoppingToken);
                        totalSynced += synced;
                    }
                    catch (Exception ex)
                    {
                        totalErrors++;
                        _logger.LogError(ex, "Error syncing workspace {WorkspaceId}", workspaceId);
                    }
                }

                stopwatch.Stop();
                _logger.LogInformation(
                    "Database sync completed: {Synced} users synced, {Errors} errors, Duration: {Duration}s",
                    totalSynced, totalErrors, stopwatch.Elapsed.TotalSeconds);


            }
            catch (Exception ex)
            {

            }

        }
        private async Task<int> SyncWorkspaceDataAsync(int workspaceId,CancellationToken stoppingToken)
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

            var (currentWeekStart,currentWeekEnd) = PeriodHelper.GetCurrentWeekPeriod();
            int syncedCount = 0;
            foreach(var userId in pendingUserIds)
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
                    // Upesert the metric to database
                    await _omniService.ProfileService.UpertWeeklyUserMetric(userMetric);

                    syncedCount++;
                }
                catch(Exception ex)
                {
                    _logger.LogError(ex, "Error syncing user {UserId} in workspace {WorkspaceId}",
                    userId, workspaceIdInString);
                }
            }
            return syncedCount;

        }
    }
}
