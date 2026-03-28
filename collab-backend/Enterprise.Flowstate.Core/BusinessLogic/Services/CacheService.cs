using Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class CacheService : ICache
    {
        private readonly IConfiguration _config;
        private readonly ILogger<CacheService> _logger;
        private IConnectionMultiplexer _redis;
        internal IDatabase _db;

        public CacheService(IConnectionMultiplexer redis, IConfiguration config, ILogger<CacheService> logger)
        {
            _logger = logger;
            _redis = redis ?? throw new ArgumentNullException(nameof(redis));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _db = _redis.GetDatabase();
        }

        #region Fluent Entry Points
        public WorkspaceCacheContext Workspace(string workspaceGuid,int workspaceId) => new(workspaceGuid,workspaceId, this);
        public GlobalUserCacheContext User(string userId) => new(userId, this);
        #endregion

        #region Basic Operations
        public async Task<T> GetAsync<T>(string key)
        {
            try
            {
                var value = await _db.StringGetAsync(key);
                if (value.IsNullOrEmpty) return default;
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
                var json = JsonSerializer.Serialize(value);
                return await _db.StringSetAsync(key, json, expiry);
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
                return await _db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cache key: {Key}", key);
                return false;
            }
        }

        public async Task<string> GetStringAsync(string key)
        {
            try
            {
                var value = await _db.StringGetAsync(key);
                return value.HasValue ? value.ToString() : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting string cache key: {Key}", key);
                return null;
            }
        }

        public async Task<bool> SetStringAsync(string key, string value, TimeSpan? expiry = null)
        {
            try
            {
                return await _db.StringSetAsync(key, value, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting string cache key: {Key}", key);
                return false;
            }
        }
        #endregion

        #region User Metric
        public async Task<bool> DeleteUserMetricAsync(string userId, string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.UserMetric, workspaceId, userId);
                return await _db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user metric");
                return false;
            }
        }

        public async Task UpsertUserMetricAsync(string workspaceGuid, string userId, RankingCacheModel metric)
        {
            var key = string.Format(FlowStateConstants.Cache.UserMetric, workspaceGuid, userId);
            await SetAsync(key, metric, TimeSpan.FromDays(7));
        }

        public async Task<RankingCacheModel?> GetUserMetricAsync(string workspaceGuid, string userId)
        {
            var key = string.Format(FlowStateConstants.Cache.UserMetric, workspaceGuid, userId);
            return await GetAsync<RankingCacheModel>(key);
        }

        public async Task<double> GetUserScore(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceId);
                var score = await _db.SortedSetScoreAsync(key, userId);
                return score ?? 0;
            }
            catch { return 0; }
        }
        #endregion

        #region User Info
        public async Task UpsertUserProfile(UserDto user)
        {
            var key = string.Format(FlowStateConstants.Cache.UserInfo, user.Id);
            await SetAsync(key, user);
        }

        public async Task<string> GetUserInfo(string userId)
        {
            var key = string.Format(FlowStateConstants.Cache.UserInfo, userId);
            return await GetAsync<string>(key);
        }
        #endregion

        #region Ranking
        public async Task<(long rank, double score)> UpdateWorkspaceRankingAtomicAsync(
            string workspaceId, string userId, double score)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceId);
                var transaction = _db.CreateTransaction();
                var addTask = transaction.SortedSetAddAsync(key, userId, score);
                var rankTask = transaction.SortedSetRankAsync(key, userId, Order.Descending);

                if (await transaction.ExecuteAsync())
                {
                    var rank = await rankTask;
                    return (rank.Value + 1, score);
                }

                _logger.LogError("Transaction failed for workspace {WorkspaceId}, user {UserId}", workspaceId, userId);
                return (-1, score);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in atomic ranking update");
                return (-1, score);
            }
        }

        public async Task<Dictionary<string, RankingCacheModel>> GetWorkspaceRankingsAsync(
     string workspaceGuid, int pageNumber, int pageSize)
        {
            int start = (pageNumber - 1) * pageSize;
            int stop = start + pageSize - 1;

            var rankingKey = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceGuid);

            var userIds = await _db.SortedSetRangeByRankAsync(rankingKey, start, stop, Order.Descending);
            if (userIds.Length == 0) return new Dictionary<string, RankingCacheModel>();

            var batch = _db.CreateBatch();

            var metricTasks = userIds
                .Select(id => (
                    userId: id.ToString(),
                    task: batch.StringGetAsync(
                        string.Format(FlowStateConstants.Cache.UserMetric, workspaceGuid, id.ToString()))
                ))
                .ToList();

            batch.Execute();

            await Task.WhenAll(metricTasks.Select(x => x.task));

            var result = new Dictionary<string, RankingCacheModel>();

            foreach (var (userId, task) in metricTasks)
            {
                var val = task.Result;

                if (!val.IsNullOrEmpty)
                {
                    try
                    {
                        var metric = JsonSerializer.Deserialize<RankingCacheModel>(val);
                        if (metric != null)
                            result[userId] = metric;
                    }
                    catch
                    {
                        // log if needed
                    }
                }
            }

            return result;
        }

        public async Task<int?> GetUserRankAsync(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceId);
                var rank = await _db.SortedSetRankAsync(key, userId, Order.Descending);
                return rank.HasValue ? (int)rank.Value + 1 : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user rank");
                return null;
            }
        }

        public async Task<bool> ClearWorkspaceRankingsAsync(string workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceId);
                return await _db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing workspace rankings");
                return false;
            }
        }
        #endregion

        #region Previous Week
        public async Task<RankingCacheModel> GetPreviousWeekMetricAsync(string workspaceId, string userId)
        {
            var key = string.Format(FlowStateConstants.Cache.UserMetricPrevious, workspaceId, userId);
            return await GetAsync<RankingCacheModel>(key);
        }

        public async Task<int?> GetPreviousWeekRankAsync(string workspaceId, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRankingPrevious, workspaceId);
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
                var key = string.Format(FlowStateConstants.Cache.WorkspaceRankingPrevious, workspaceId);
                return await _db.SortedSetScoreAsync(key, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting previous week score");
                return null;
            }
        }
        #endregion

        #region Bulk Operations
        public async Task AddPendingUpdateAsync(string workspaceGuid, string userId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspacePendingUpdates, workspaceGuid);
                await _db.SetAddAsync(key, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding pending update");
            }
        }

        public async Task<List<string>> GetAndClearPendingUpdatesAsync(string workspaceGuid,int workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.WorkspacePendingUpdates, workspaceGuid);
                var processingKey = $"{key}:processing:{Guid.NewGuid():N}";

                if (!await _db.KeyExistsAsync(key)) return [];

                try { await _db.KeyRenameAsync(key, processingKey); }
                catch (RedisServerException ex) when (ex.Message.Contains("no such key"))
                {
                    _logger.LogDebug("Key {Key} already processed", key);
                    return [];
                }

                var members = await _db.SetMembersAsync(processingKey);
                await _db.KeyDeleteAsync(processingKey);
                return members.Select(m => m.ToString()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending updates");
                return [];
            }
        }
        #endregion

        #region Sorted Set
        public async Task CopySortedSetAsync(string sourceKey, string destinationKey, TimeSpan? expiry = null)
        {
            try
            {
                await _db.KeyDeleteAsync(destinationKey);
                await _db.SortedSetCombineAndStoreAsync(SetOperation.Union, destinationKey, new RedisKey[] { sourceKey });
                if (expiry.HasValue) await _db.KeyExpireAsync(destinationKey, expiry.Value);
                _logger.LogInformation("Copied sorted set {Source} → {Dest}", sourceKey, destinationKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error copying sorted set {Source} → {Dest}", sourceKey, destinationKey);
                throw;
            }
        }
        #endregion

        #region Role & Permissions
        public async Task<string> GetUserRoleAsync(string userId, string workspaceId)
        {
            var key = string.Format(FlowStateConstants.Cache.UserRole, workspaceId, userId);
            return await GetStringAsync(key);
        }

        public async Task<string> GetUserRoleAsync(string userId, int workspaceId)
            => await GetUserRoleAsync(userId, workspaceId.ToString());

        public async Task SetUserRoleAsync(string userId, string workspaceId, string roleName)
        {
            var key = string.Format(FlowStateConstants.Cache.UserRole, workspaceId, userId);
            await SetStringAsync(key, roleName);
        }

        public async Task<int> GetUserId(string workspaceGuid, string userGuid)
        {
            var key = string.Format(FlowStateConstants.Cache.UserId, workspaceGuid, userGuid);
            string userId = await GetStringAsync(key);
            return Convert.ToInt32(userId);
        }

        public async Task InvalidateUserRoleAsync(string userId, string workspaceId)
        {
            var key = string.Format(FlowStateConstants.Cache.UserRole, workspaceId, userId);
            await DeleteAsync(key);
        }

        public async Task InvalidateUserCacheAsync(string userId, int workspaceId)
        {
            try
            {
                var roleKey = string.Format(FlowStateConstants.Cache.UserRole, workspaceId.ToString(), userId);
                var permKey = string.Format(FlowStateConstants.Cache.UserPermissions, workspaceId.ToString(), userId);
                await _db.KeyDeleteAsync(roleKey);
                await _db.KeyDeleteAsync(permKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating cache for user {UserId}", userId);
            }
        }

        public async Task<List<string>> GetUserPermissionsAsync(string userId, int workspaceId)
        {
            try
            {
                var key = string.Format(FlowStateConstants.Cache.UserPermissions, workspaceId.ToString(), userId);
                var value = await GetStringAsync(key);
                if (string.IsNullOrEmpty(value)) return [];
                return JsonSerializer.Deserialize<List<string>>(value) ?? [];
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user permissions for user {UserId}", userId);
                return [];
            }
        }

        public async Task CacheUserPermissionsAsync(string userId, int workspaceId, List<string> permissions, string roleName)
        {
            try
            {
                var permKey = string.Format(FlowStateConstants.Cache.UserPermissions, workspaceId.ToString(), userId);
                var roleKey = string.Format(FlowStateConstants.Cache.UserRole, workspaceId.ToString(), userId);
                await SetStringAsync(permKey, JsonSerializer.Serialize(permissions));
                await SetStringAsync(roleKey, roleName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error caching permissions for user {UserId}", userId);
            }
        }
        #endregion
    }
}