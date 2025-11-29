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
        Task<bool> SetUserMetricAsync(string userId, string workspaceId, RankingCacheModel metric);
        Task<bool> DeleteUserMetricAsync(string userId, string workspaceId);
        Task<long> GetWorkspaceRankingCountAsync(string workspaceId);
        Task<bool> RemoveUserFromRankingAsync(string workspaceId, string userId);
        System.Threading.Tasks.Task UpsertUserMetricAsync(string workspaceId, string userId, RankingCacheModel metric);
        Task<long?> UpdateWorkspaceRankingAsync(string workspaceId, string userId, double score);
        Task<Dictionary<string, RankingCacheModel>> GetMultipleUserMetricsAsync(string workspaceId, List<string> userIds);
    }
}
