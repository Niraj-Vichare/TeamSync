using Enterprise.Flowstate.BAL.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Enterprise.Flowstate.Hubs
{
    public class LeaderboardHub:Hub
    {
        private IOmniService _omniService;
        public LeaderboardHub(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [Authorize]
        public async Task JoinWorkspace(string workspaceId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Validate user has access to workspace
            //var hasAccess = await _omniService.WorkspaceService
            //    .ValidateUserAccess(userId, workspaceId);
            bool hasAccess = true; // Placeholder for actual access check   

            if (!hasAccess)
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized access to workspace");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"workspace_{workspaceId}");
            await Clients.Caller.SendAsync("Joined", $"Joined workspace {workspaceId}");
        }

        public async Task LeaveWorkspace(string workspaceId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"workspace_{workspaceId}");
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
