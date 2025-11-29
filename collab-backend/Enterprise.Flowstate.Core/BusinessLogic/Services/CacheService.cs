using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class CacheService : ICache
    {
        private readonly IOmniService _omniService;
        private readonly IConfiguration _config;
        private IDatabase _db;
        private IConnectionMultiplexer _redis;
        public CacheService(IOmniService omniService,IConfiguration config)
        {
            _omniService = omniService;
            _config = config;
            InitializeRedisConnection();
        }

        private void InitializeRedisConnection()
        {
            var hostname = _config.GetSection("RedisConnection:HostName").Value;
            var port = _config.GetSection("RedisConnection:Port").Value;
            var redisConfig = ConfigurationOptions.Parse(hostname + ":" + port);
            redisConfig.ConnectTimeout = 5000;
            redisConfig.SyncTimeout = 5000;

            _redis = ConnectionMultiplexer.Connect(redisConfig);
            _db = _redis.GetDatabase();
        }
        public async Task<bool> DeleteUserMetricAsync(string userId, string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.USER_METRIC_KEY, workspaceId, userId);
                return await _db.KeyDeleteAsync(key);
            }
            catch(Exception ex)
            {
                //_logger.LogError(ex, "Error deleting user metric for user {UserId} in workspace {WorkspaceId}", userId, workspaceId);
                return false;
            }
        }

        public async Task<Dictionary<string, RankingCacheModel>> GetMultipleUserMetricsAsync(string workspaceId,List<string> userIds)
        {
            var result = new ConcurrentDictionary<string, RankingCacheModel>();

            var tasks = userIds.Select(async userId =>
            {
                try
                {
                    var metric = await GetUserMetricAsync(userId, workspaceId);
                    if (metric != null)
                    {
                        result[userId] = metric;
                    }
                }
                catch (Exception ex)
                {
                    // Log and keep the train moving
                    // _logger.LogError(ex, "Failed to get metrics for {UserId}", userId);
                }
            });

            await Task.WhenAll(tasks);

            return result.ToDictionary(k => k.Key, v => v.Value);
        }

        public async Task UpsertUserMetricAsync(string workspaceId, string userId, RankingCacheModel metric)
        {
            var key = string.Format(FlowStateConstants.USER_METRIC, workspaceId, userId);
            var entries = new HashEntry[]
            {
                new HashEntry("Efficiency", metric.Efficiency),
                new HashEntry("Points", metric.Point),
                new HashEntry("ContributionScore", metric.ContributionScore),
                new HashEntry("TotalHours", metric.TotalHours),
                new HashEntry("TasksCompleted", metric.TotalTaskCompleted),
                new HashEntry("Ranking",metric.Ranking)
            };
            await _db.HashSetAsync(key, entries);
        }

        public async Task<long> GetWorkspaceRankingCountAsync(string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY,workspaceId);
                return await _db.SortedSetLengthAsync(key);

            }catch(Exception ex)
            {
                //_logger.LogError("");
                return 0;
            }
        }

        public async Task<bool> RemoveUserFromRankingAsync(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);
                return await _db.SortedSetRemoveAsync(key,userId);

            }catch(Exception ex)
            {
                //_logger.LogError(ex, "Error removing user {UserId} from workspace {WorkspaceId} ranking", userId, workspaceId);
                return false;
            }
        }

        public async Task<bool> SetUserMetricAsync(string userId, string workspaceId, RankingCacheModel metric)
        {
            try
            {
                string key = string.Format(FlowStateConstants.USER_METRIC_KEY,workspaceId,userId);
                var json = JsonSerializer.Serialize<RankingCacheModel>(metric);
                return await _db.StringSetAsync(key, json);

            }catch(Exception ex)
            {
                return false;
            }
        }

        public async Task<long?> UpdateWorkspaceRankingAsync(string workspaceId, string userId, double score)
        {
            try
            {
                var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);
                await _db.SortedSetAddAsync(key, userId, score);
                var rank =await _db.SortedSetRankAsync(key, userId);
                if (rank >= 0)
                {
                    return (long)(rank + 1);
                }
                return -1;
            }
            catch(Exception ex)
            {
                //_logger.LogError(ex, "Error updating ranking for user {UserId} in workspace {WorkspaceId}", userId, workspaceId);
                return -1;
            }
        }

        public async Task<RankingCacheModel?> GetUserMetricAsync(string userId, string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.USER_METRIC_KEY, workspaceId, userId);
                var value= await _db.StringGetAsync(key);
                if (value.IsNullOrEmpty)
                {
                    return null;
                }
                return JsonSerializer.Deserialize<RankingCacheModel?>(value);
            }catch(Exception ex)
            {
                return null;
            }
        }
    }
}
