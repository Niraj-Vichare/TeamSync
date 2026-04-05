using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    /// <summary>
    /// Handles one notification event:
    ///   1. Writes a row to the notifications table via ProfileRepository.
    ///   2. Pushes the payload to the recipient's personal SignalR group.
    ///
    /// Registered as Scoped (created per consumer message via IServiceScopeFactory).
    /// No Redis, no leaderboard logic — completely independent of MessageProcessor.
    /// </summary>
    public class NotificationProcessor : INotificationProcessor
    {
        private readonly IOmniRepository _repo;
        private readonly INotificationHubService _hubService;
        private readonly ILogger<NotificationProcessor> _logger;

        public NotificationProcessor(
            IOmniRepository repo,
            INotificationHubService hubService,
            ILogger<NotificationProcessor> logger)
        {
            _repo = repo;
            _hubService = hubService;
            _logger = logger;
        }

        public async System.Threading.Tasks.Task ProcessAsync(NotificationDto dto)
        {
            // 1. Persist the notification row
            var notification = new Notification
            {
                RecipientProfileId = dto.RecipientProfileId,
                ActorProfileId = dto.ActorProfileId,
                NotificationType = (int)dto.NotificationType,
                EntityType = dto.EntityType,
                EntityGuid = dto.EntityGuid,
                Title = dto.Title,
                Body = dto.Body,
                IsRead = false,
                CreatedAt = dto.CreatedAt,
            };

            await _repo.NotificationRepository.CreateAsync(notification);

            _logger.LogDebug(
                "Notification persisted Type={Type} Recipient={Id}",
                dto.NotificationType, dto.RecipientProfileId);

            // 2. Push via SignalR (fire-and-forget: user may be offline — DB row is fallback)
            await _hubService.SendToUserAsync(dto.RecipientProfileGuid, dto);
        }
    }
}