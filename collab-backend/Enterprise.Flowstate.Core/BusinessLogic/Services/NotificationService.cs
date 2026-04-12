using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;

public class NotificationService : INotificationService
{
    private readonly IOmniRepository _omniRepository;
    private readonly INotificationPublisher _publisher;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IOmniRepository omniRepository,
        INotificationPublisher publisher,
        ILogger<NotificationService> logger)
    {
        _omniRepository = omniRepository;
        _publisher = publisher;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task CreateAsync(Notification notification)
    {
        notification.CreatedAt = DateTime.UtcNow;
        notification.IsRead = false;
        await _omniRepository.NotificationRepository.CreateAsync(notification);
    }

    public async System.Threading.Tasks.Task CreateForUserAsync(
        int recipientProfileId,
        string recipientProfileGuid,
        int? actorProfileId,
        int notificationType,
        string title,
        string body,
        int? entityType = null,
        Guid? entityGuid = null,
        string? metadata = null)
    {
        var dto = new NotificationDto
        {
            RecipientProfileId = recipientProfileId,
            RecipientProfileGuid = recipientProfileGuid,
            ActorProfileId = actorProfileId,
            NotificationType = (GeneralEnums.NotificationType)notificationType,
            Title = title,
            Body = body,
            EntityType = entityType,
            EntityGuid = entityGuid,
            Metadata = metadata,
            CreatedAt = DateTime.UtcNow
        };

        // Try queue first (handles DB write + SignalR in NotificationProcessor)
        var published = await _publisher.PublishAsync(dto);

        if (!published)
        {
            // Queue unavailable — write directly so notification is never lost
            _logger.LogWarning("Queue unavailable; writing notification directly for profile {Id}", recipientProfileId);
            await _omniRepository.NotificationRepository.CreateAsync(new Notification
            {
                RecipientProfileId = recipientProfileId,
                ActorProfileId = actorProfileId,
                NotificationType = notificationType,
                Title = title,
                Body = body,
                EntityType = entityType,
                EntityGuid = entityGuid,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int profileId, int page, int pageSize)
    {
        var notifications = await _omniRepository.NotificationRepository.GetByRecipientAsync(profileId, page, pageSize);
        List<NotificationDto> result = new List<NotificationDto>();
        foreach (var notification in notifications)
        {
            result.Add(new NotificationDto
            {
                RecipientProfileId = notification.RecipientProfileId,
                ActorProfileId = notification.ActorProfileId,
                Id = notification.Id,
                NotificationType = (GeneralEnums.NotificationType)notification.NotificationType,
                Title = notification.Title,
                Body = notification.Body,
                EntityType = notification.EntityType,
                EntityGuid = notification.EntityGuid,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            });
        }
        return result;
    }

    public Task<int> GetUnreadCountAsync(int profileId)
        => _omniRepository.NotificationRepository.GetUnreadCountAsync(profileId);

    public System.Threading.Tasks.Task MarkAsReadAsync(long notificationId)
        => _omniRepository.NotificationRepository.MarkAsReadAsync(notificationId);

    public System.Threading.Tasks.Task MarkAllAsReadAsync(int profileId)
        => _omniRepository.NotificationRepository.MarkAllAsReadAsync(profileId);
}