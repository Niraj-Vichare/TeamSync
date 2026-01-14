using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ICache
    {
        Task<RankingCacheModel?> GetUserMetricAsync(string userId, string workspaceId);
        Task<bool> DeleteUserMetricAsync(string userId, string workspaceId);
        Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task<bool> DeleteAsync(string key);
        Task<(long rank, double score)> UpdateWorkspaceRankingAtomicAsync(
            string workspaceId, string userId, double score);
        System.Threading.Tasks.Task UpsertUserMetricAsync(string workspaceId, string userId, RankingCacheModel metric);
        // ranking
        Task<Dictionary<string, RankingCacheModel>> GetWorkspaceRankingsAsync(string workspaceId, int pageNumber, int pageSize);
        Task<int?> GetUserRankAsync(string workspaceId, string userId);
        System.Threading.Tasks.Task AddPendingUpdateAsync(string workspaceId, string userId);
        Task<List<string>> GetAndClearPendingUpdatesAsync(string workspaceId);
        Task<int?> GetPreviousWeekRankAsync(string workspaceId, string userId);
        Task<RankingCacheModel> GetPreviousWeekMetricAsync(string workspaceId, string userId);
        Task<double?> GetPreviousWeekScoreAsync(string workspaceId, string userId);
        Task<string> GetUserInfo(string userId);
        Task<double> GetUserScore(string workspaceId, string userId);
        Task<bool> ClearWorkspaceRankingsAsync(string workspaceId);
        Task CopySortedSetAsync(string sourceKey, string destinationKey, TimeSpan? expiry = null);
        Task UpsertUserProfile(UserDto user);
        Task<List<string>> GetUserPermissionsAsync(string userId, int workspaceId);
        Task<string> GetUserRoleAsync(string userId, int workspaceId);
        Task InvalidateUserCacheAsync(string userId, int workspaceId);
        Task CacheUserPermissionsAsync(string userId, int workspaceId, List<string> permissions, string roleName);
    }
}
