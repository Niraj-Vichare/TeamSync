using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ILeaderboardHubService
    {
        Task SendLeaderboardUpdateAsync(string workspaceId, LeaderboardResponse? leaderboard);
        Task SendRankChangeAsync(string workspaceId, string userId, int newRank, double score);
    }

}
