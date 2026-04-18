using Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;

public interface ICache
{
    // ── All existing methods stay exactly as they are ──────────────────

    Task<RankingCacheModel?> GetUserMetricAsync(string userId, string workspaceId);
    Task<bool> DeleteUserMetricAsync(string userId, string workspaceId);
    Task<bool> SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task<bool> DeleteAsync(string key);
    Task<string> GetStringAsync(string key);
    Task<bool> SetStringAsync(string key, string value, TimeSpan? expiry = null);
    Task<(long rank, double score)> UpdateWorkspaceRankingAtomicAsync(string workspaceId, string userId, double score);
    System.Threading.Tasks.Task UpsertUserMetricAsync(string workspaceGuid, string userId, RankingCacheModel metric);
    Task<Dictionary<string, RankingCacheModel>> GetWorkspaceRankingsAsync(string workspaceId, int pageNumber, int pageSize);
    Task<int?> GetUserRankAsync(string workspaceId, string userId);
    System.Threading.Tasks.Task AddPendingUpdateAsync(string workspaceId, string userId);
    Task<List<string>> GetAndClearPendingUpdatesAsync(string workspaceGuid,int workspaceId);
    Task<int?> GetPreviousWeekRankAsync(string workspaceId, string userId);
    Task<RankingCacheModel> GetPreviousWeekMetricAsync(string workspaceId, string userId);
    Task<double?> GetPreviousWeekScoreAsync(string workspaceId, string userId);
    Task<string> GetUserInfo(string userId);
    Task<double> GetUserScore(string workspaceId, string userId);
    Task<bool> ClearWorkspaceRankingsAsync(string workspaceId);
    System.Threading.Tasks.Task CopySortedSetAsync(string sourceKey, string destinationKey, TimeSpan? expiry = null);
    System.Threading.Tasks.Task UpsertUserProfile(UserDto user);
    Task<List<string>> GetUserPermissionsAsync(string userId, int workspaceId);
    Task<string> GetUserRoleAsync(string userId, int workspaceId);
    System.Threading.Tasks.Task InvalidateUserCacheAsync(string userId, int workspaceId);
    System.Threading.Tasks.Task CacheUserPermissionsAsync(string userId, int workspaceId, List<string> permissions, string roleName);
    Task<string> GetUserRoleAsync(string userId, string workspaceId);
    System.Threading.Tasks.Task SetUserRoleAsync(string userId, string workspaceId, string roleName);
    System.Threading.Tasks.Task InvalidateUserRoleAsync(string userId, string workspaceId);
    System.Threading.Tasks.Task<int> GetUserId(string workspaceGuid, string userGuid);

    // ── Only NEW additions ──────────────────────────────────────────────
    WorkspaceCacheContext Workspace(string workspaceGuid,int workspaceId);
    GlobalUserCacheContext User(string userId);
    Task<int> GetWorkspaceRankingCountAsync(string workspaceGuid);


}