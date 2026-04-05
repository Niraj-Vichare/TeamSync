using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services;

public class NotificationService : INotificationService
{
    private readonly IOmniRepository _omniRepository;

    public NotificationService(IOmniRepository omniRepository)
    {
        _omniRepository = omniRepository;
    }

    public async Task CreateAsync(Notification notification)
    {
        notification.CreatedAt = DateTime.UtcNow;
        notification.IsRead = false;

        await _omniRepository.NotificationRepository.CreateAsync(notification);
    }

    public async Task CreateForUserAsync(
        int recipientProfileId,
        int? actorProfileId,
        int notificationType,
        string title,
        string body,
        int? entityType = null,
        Guid? entityGuid = null,
        string? metadata = null
    )
    {
        var notification = new Notification
        {
            RecipientProfileId = recipientProfileId,
            ActorProfileId = actorProfileId,
            NotificationType = notificationType,
            Title = title,
            Body = body,
            EntityType = entityType,
            EntityGuid = entityGuid,
            Metadata = metadata,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _omniRepository.NotificationRepository.CreateAsync(notification);
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(int profileId, int page, int pageSize)
    {
        return await _omniRepository.NotificationRepository.GetByRecipientAsync(profileId, page, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(int profileId)
    {
        return await _omniRepository.NotificationRepository.GetUnreadCountAsync(profileId);
    }

    public async Task MarkAsReadAsync(long notificationId)
    {
        await _omniRepository.NotificationRepository.MarkAsReadAsync(notificationId);
    }

    public async Task MarkAllAsReadAsync(int profileId)
    {
        await _omniRepository.NotificationRepository.MarkAllAsReadAsync(profileId);
    }
}