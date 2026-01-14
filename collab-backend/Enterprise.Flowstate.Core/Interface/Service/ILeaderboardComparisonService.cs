using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ILeaderboardComparisonService
    {
        Task<LeaderboardResponse> GetLeaderboardWithComparisonAsync(string workspaceId, int pageNumber, int pageSize);
        Task<UserRankingWithComparison> GetUserRankingWithComparisonAsync(string workspaceId, string userId);
        Task<List<RankingHistoryDto>> GetUserRankingHistory(string workspaceGuid, string userGuid);
        Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate);
    }
}
