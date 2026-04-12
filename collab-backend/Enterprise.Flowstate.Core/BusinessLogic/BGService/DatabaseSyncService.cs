using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    public class DatabaseSyncService : BackgroundService
    {
        private readonly ILogger<DatabaseSyncService> _logger;
        //private readonly TimeSpan _syncInterval = TimeSpan.FromHours(3); // Sync every 3 hours
        private readonly TimeSpan _syncInterval = TimeSpan.FromMinutes(60); // Sync every 3 minutes
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _scopeFactory;

        public DatabaseSyncService(
        ILogger<DatabaseSyncService> logger,
        IConfiguration configuration, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _scopeFactory = scopeFactory; 
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
                    using var scope = _scopeFactory.CreateScope();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                    var cache = scope.ServiceProvider.GetRequiredService<ICache>();

                    await PerformSyncAsync(omniService,cache,stoppingToken);

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

        private async Task PerformSyncAsync(IOmniService omniService,ICache cache,CancellationToken stoppingToken)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("Starting database sync...");

            try
            {
                var workspaceInfos = await omniService.WorkspaceService.GetAllWorkspaceInfo();
                int totalSynced = 0;
                int totalErrors = 0;

                foreach (var workspaceInfo in workspaceInfos)
                {
                    if (stoppingToken.IsCancellationRequested)
                        break;

                    try
                    {
                        var synced = await SyncWorkspaceDataAsync(workspaceInfo.WorkspaceGuid,workspaceInfo.WorkspaceId, cache,omniService,stoppingToken);
                        totalSynced += synced;
                    }
                    catch (Exception ex)
                    {
                        totalErrors++;
                        _logger.LogError(ex, "Error syncing workspace {WorkspaceId}", workspaceInfo.WorkspaceId);
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
        private async Task<int> SyncWorkspaceDataAsync(string workspaceGuid,int workspaceId,ICache cache,IOmniService omniService,CancellationToken stoppingToken)
        {
            var pendingUserGuids = await cache.GetAndClearPendingUpdatesAsync(workspaceGuid,workspaceId);

            if (!pendingUserGuids.Any())
            {
                _logger.LogDebug("No pending updates for workspace {WorkspaceId}", workspaceId);
                return 0;
            }
            _logger.LogInformation("Syncing {Count} users for workspace {WorkspaceId}",
            pendingUserGuids.Count, workspaceId);

            var (currentWeekStart,currentWeekEnd) = PeriodHelper.GetCurrentWeekPeriodDateOnly();
            int syncedCount = 0;
            foreach(var userGuid in pendingUserGuids)
            {
                if (stoppingToken.IsCancellationRequested)
                    break;
                try
                {
                    RankingCacheModel metric = await cache.GetUserMetricAsync(workspaceGuid, userGuid);

                    if (metric == null)
                    {
                        _logger.LogWarning("Metric not found in Redis for user {UserId} workspace {WorkspaceId}",
                            userGuid, workspaceGuid);
                        continue;
                    }
                    var rank = await cache.GetUserRankAsync(workspaceGuid, userGuid);

                    int userId = await cache.GetUserId(workspaceGuid, userGuid);

                    WeeklyUserStatsDto userMetric = new WeeklyUserStatsDto
                    {
                        ContributionPoint = metric.ContributionPoint,
                        Efficiency = metric.Efficiency,
                        CreatedAt = DateTime.UtcNow,
                        Score = (float?)metric.Score,
                        TotalHours = metric.TotalHours,
                        RankPosition = (int)(rank ?? 0),
                        TicketsCompleted = metric.TotalTicketCompleted,
                        UserId = userId,
                        WorkspaceId = workspaceId,
                        EndPeriod = currentWeekEnd,
                        StartPeriod = currentWeekStart,
                    };
                    // Upesert the metric to database
                    await omniService.ProfileService.UpertWeeklyUserMetric(userMetric);

                    syncedCount++;
                }
                catch(Exception ex)
                {
                    _logger.LogError(ex, "Error syncing user {UserId} in workspace {WorkspaceId}",
                    userGuid, workspaceGuid);
                }
            }
            return syncedCount;

        }
    }
}
