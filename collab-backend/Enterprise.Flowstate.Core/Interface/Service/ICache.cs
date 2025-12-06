using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ICache
    {
        Task<RankingCacheModel?> GetUserMetricAsync(string userId, string workspaceId);
        Task<bool> DeleteUserMetricAsync(string userId, string workspaceId);
        Task<bool> DeleteAsync(string key);
        System.Threading.Tasks.Task UpsertUserMetricAsync(string workspaceId, string userId, RankingCacheModel metric);
        // ranking
        Task<long> UpdateWorkspaceRankingAsync(string workspaceId, string userId, double score);
        Task<Dictionary<string, RankingCacheModel>> GetWorkspaceRankingsAsync(string workspaceId, int pageNumber, int pageSize);
        Task<int?> GetUserRankAsync(string workspaceId, string userId);
        System.Threading.Tasks.Task AddPendingUpdateAsync(string workspaceId, string userId);
        Task<List<string>> GetAndClearPendingUpdatesAsync(string workspaceId);
        Task<int?> GetPreviousWeekRankAsync(string workspaceId, string userId);
        Task<RankingCacheModel> GetPreviousWeekMetricAsync(string workspaceId, string userId);
        Task<double?> GetPreviousWeekScoreAsync(string workspaceId, string userId);
        Task<string> GetUserInfo(string userId);
        Task<double> GetUserScore(string workspaceId, string userId);
    }
}
