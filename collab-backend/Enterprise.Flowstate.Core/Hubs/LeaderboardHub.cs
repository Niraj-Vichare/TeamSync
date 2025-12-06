using Enterprise.Flowstate.BAL.Interface.Service;
using Microsoft.AspNetCore.SignalR;

namespace Enterprise.Flowstate.Hubs
{
    public class LeaderboardHub:Hub
    {
        private IOmniService _omniService;
        public LeaderboardHub(IOmniService omniService)
        {
            _omniService = omniService;
        }

        public async Task JoinWorkspace(string workspaceId)
        {
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
