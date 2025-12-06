using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class CacheService : ICache
    {
        private readonly IConfiguration _config;
        private IDatabase _db;
        private readonly ILogger<CacheService> _logger;
        private IConnectionMultiplexer _redis;
        public CacheService(IConfiguration config, ILogger<CacheService> logger)
        {
            _config = config;
            InitializeRedisConnection();
            _logger = logger;
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

        #region User Info
        public async Task<string> GetUserInfo(string userId)
        {
            return string.Empty;
        }
        #endregion
        #region Basic Operation
        public async Task<T> GetAsync<T>(string key)
        {
            try
            {
                var value = await _db.StringGetAsync(key);
                if (value.IsNullOrEmpty)
                {
                    return default;
                }

                return JsonSerializer.Deserialize<T>(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache key: {Key}", key);
                return default;
            }
        }

        public async Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var db = _redis.GetDatabase();
                if (db == null) return false;

                var json = JsonSerializer.Serialize(value);
                return await db.StringSetAsync(key, json, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache key: {Key}", key);
                return false;
            }
        }

        public async Task<bool> DeleteAsync(string key)
        {
            try
            {
                var db = _redis.GetDatabase();
                if (db == null) return false;

                return await db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cache key: {Key}", key);
                return false;
            }
        }

        #endregion

        #region User Metric
        // User Metric Operations
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

        public async Task UpsertUserMetricAsync(string workspaceId, string userId, RankingCacheModel metric)
        {
            var key = string.Format(FlowStateConstants.USER_METRIC_KEY, workspaceId, userId);
            // Cache for 7 days (weekly period)
            await SetAsync(key, metric, TimeSpan.FromDays(7));
        }

        public async Task<RankingCacheModel?> GetUserMetricAsync(string workspaceId, string userId)
        {
            var key = string.Format(FlowStateConstants.USER_METRIC_KEY, workspaceId, userId);
            return await GetAsync<RankingCacheModel>(key);
        }

        public async Task<double> GetUserScore(string workspaceId,string userId)
        {
            try
            {

                var key = string.Format(FlowStateConstants.USER_METRIC_KEY, workspaceId,userId);
                var score = await _db.SortedSetScoreAsync(key, userId);
                return score.HasValue ? score.Value : 0;
            }
            catch
            {
                return 0;
            }
        }
        
        public async Task<string> GetUserInfoAsync(string userId)
        {
            var key = string.Format(FlowStateConstants.USER_INFO_KEY, userId);
            return await GetAsync<string>(key);
        }

        
        #endregion

        #region Ranking Operation

        public async Task<long> UpdateWorkspaceRankingAsync(string workspaceId, string userId, double score)
        {
            try
            {
                var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);
                await _db.SortedSetAddAsync(key, userId, score);
                var rank = await _db.SortedSetRankAsync(key, userId, Order.Descending);
                return rank.HasValue ? (int)rank.Value + 1 : -1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ranking for user {UserId} in workspace {WorkspaceId}", userId, workspaceId);
                return -1;
            }
        }
        // Need to update
        public async Task<Dictionary<string, RankingCacheModel>> GetWorkspaceRankingsAsync(string workspaceId,int pageNumber,int pageSize)
        {
            // Calculate index boundaries for pagination
            int start = (pageNumber - 1) * pageSize;
            int stop = start + pageSize - 1;

            var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);

            long totalCount = await _db.SortedSetLengthAsync(key);

            var userIds = await _db.SortedSetRangeByRankAsync(
                key,
                start,
                stop,
                Order.Descending
            );

            var result = new Dictionary<string, RankingCacheModel>();

            foreach (var id in userIds)
            {
                string userId = id!;

                string userKey = string.Format(
                    FlowStateConstants.USER_METRIC_KEY,
                    workspaceId,
                    userId
                );

                var metric = await GetAsync<RankingCacheModel>(userKey);

                if (metric != null)
                {
                    result.Add(userId, metric);
                }
            }
            return result;
        }


        public async Task<int?> GetUserRankAsync(string workspaceId, string userId)
        {
            try
            {
                var db = _redis.GetDatabase();
                if (db == null) return null;

                var key = string.Format(FlowStateConstants.WORKSPACE_RANKING_KEY, workspaceId);
                var rank = await db.SortedSetRankAsync(key, userId, Order.Descending);

                return rank.HasValue ? (int)rank.Value + 1 : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user rank");
                return null;
            }
        }

        #endregion

        #region Bulk Operations

        public async Task AddPendingUpdateAsync(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.PENDING_DB_UPDATES, workspaceId);
                await _db.SetAddAsync(key, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding pending update");
            }
        }

        public async Task<List<string>> GetAndClearPendingUpdatesAsync(string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.PENDING_DB_UPDATES, workspaceId);

                // Get all members
                var members = await _db.SetMembersAsync(key);

                // Clear the set
                await _db.KeyDeleteAsync(key);

                return members.Select(m=>m.ToString()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending updates");
                return new List<string>();
            }
        }

        #endregion

        #region Previous Week Metric
        public async Task<RankingCacheModel> GetPreviousWeekMetricAsync(string workspaceId, string userId)
        {
            var key = string.Format(FlowStateConstants.PREVIOUS_WEEK_METRIC_KEY, workspaceId, userId);
            return await GetAsync<RankingCacheModel>(key);
        }

        public async Task<int?> GetPreviousWeekRankAsync(string workspaceId, string userId)
        {
            try
            {
                
                var key = string.Format(FlowStateConstants.PREVIOUS_WEEK_RANKING_KEY, workspaceId);
                var rank = await _db.SortedSetRankAsync(key, userId, Order.Descending);

                return rank.HasValue ? (int)rank.Value + 1 : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting previous week rank");
                return null;
            }
        }

        public async Task<double?> GetPreviousWeekScoreAsync(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.PREVIOUS_WEEK_RANKING_KEY, workspaceId);
                var score = await _db.SortedSetScoreAsync(key, userId);

                return score;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting previous week score");
                return null;
            }
        }
        #endregion

        #region Project Metric
        

        #endregion

        #region Sprint Metric

        #endregion

        #region Tickets Metric

        #endregion
    }
}
