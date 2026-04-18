using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class LeaderboardHubService:ILeaderboardHubService
    {
        private readonly IHubContext<LeaderboardHub> _hubContext;
        private readonly ILogger<LeaderboardHubService> _logger;

        public LeaderboardHubService(
            IHubContext<LeaderboardHub> hubContext,
            ILogger<LeaderboardHubService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        // Send full leaderboard update to workspace
        public async Task SendLeaderboardUpdateAsync(string workspaceId, LeaderboardResponse? leaderboard)
        {
            try
            {
                await _hubContext.Clients
                    .Group($"workspace_{workspaceId}")
                    .SendAsync("LeaderboardUpdated", leaderboard); // null is fine — JS gets null, frontend ignores it
                _logger.LogDebug("Sent leaderboard signal to workspace {WorkspaceId}", workspaceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send leaderboard update");
            }
        }

        // Send individual rank change
        public async Task SendRankChangeAsync(string workspaceId, string userId, int newRank, double score)
        {
            try
            {
                await _hubContext.Clients
                    .Group($"workspace_{workspaceId}")
                    .SendAsync("RankChanged", new
                    {
                        UserId = userId,
                        NewRank = newRank,
                        Score = score,
                        Timestamp = DateTime.UtcNow
                    });

                _logger.LogDebug("Sent rank change for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send rank change");
            }
        }
    }
}
