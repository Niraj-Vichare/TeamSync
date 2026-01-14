using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ILeaderBoardRepository
    {
        Task<WeeklyUserStats> GetUserRankingAsync(string workspaceGuid, string userGuid, DateTime startPeriod, DateTime endPeriod);
        Task<WeeklyUserStats> GetUserMetricAsync(string workspaceGuid, string userId, DateTime startPeriod, DateTime endPeriod);
        Task<List<WeeklyUserStats>> GetUserRankingHistory(string workspaceGuid, string userGuid);
        Task<Dictionary<string, RankingCacheModel>> GetWorkspaceWeekRankings(string workspaceGuid, DateTime startPeriod, DateTime endPeriod);
        Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate);
    }
}
