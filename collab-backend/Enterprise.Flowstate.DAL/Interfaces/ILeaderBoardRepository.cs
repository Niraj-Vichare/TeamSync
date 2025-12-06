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
        Task<Ranking> GetUserRankingAsync(string workspaceId, string userId,DateTime startPeriod,DateTime endPeriod);
        Task<UserMetric> GetUserMetricAsync(string workspaceGuid, string userId, DateTime startPeriod, DateTime endPeriod);
        Task<List<RankingCacheModel>> GetWorkspaceWeekRankings(string worksapceGuid,DateTime startPeriod,DateTime endPeriod);
        Task<List<Ranking>> GetUserRankingHistory(string workspaceGuid, string userGuid);
    }
}
