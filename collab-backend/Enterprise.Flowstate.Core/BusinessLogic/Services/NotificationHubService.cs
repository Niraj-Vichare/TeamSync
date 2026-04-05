using Enterprise.Flowstate.BAL.Hubs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly ILogger<NotificationHubService> _logger;

        public NotificationHubService(
            IHubContext<NotificationHub> hub,
            ILogger<NotificationHubService> logger)
        {
            _hub = hub;
            _logger = logger;
        }

        public async Task SendToUserAsync(string profileGuid, NotificationDto notification)
        {
            try
            {
                var group = string.Format(FlowStateConstants.UserGroupKey, profileGuid);

                await _hub.Clients
                    .Group(group)
                    .SendAsync("ReceiveNotification", new
                    {
                        notification.NotificationType,
                        notification.EntityType,
                        notification.EntityGuid,
                        notification.Title,
                        notification.Body,
                        notification.CreatedAt,
                        IsRead = false
                    });

                _logger.LogDebug(
                    "SignalR push → user:{Guid} type={Type}",
                    profileGuid, notification.NotificationType);
            }
            catch (Exception ex)
            {
                // Never let a SignalR failure bubble up — DB row is the fallback
                _logger.LogError(ex, "NotificationHubService.SendToUserAsync failed for {Guid}", profileGuid);
            }
        }
    }
}