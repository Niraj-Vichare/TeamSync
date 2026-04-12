using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;

public interface INotificationService
{
    System.Threading.Tasks.Task CreateAsync(Notification notification);

    System.Threading.Tasks.Task CreateForUserAsync(
        int recipientProfileId,
        string recipientProfileGuid,
        int? actorProfileId,
        int notificationType,
        string title,
        string body,
        int? entityType = null,
        Guid? entityGuid = null,
        string? metadata = null
    );

    Task<List<NotificationDto>> GetUserNotificationsAsync(int profileId, int page, int pageSize);
    Task<int> GetUnreadCountAsync(int profileId);
    System.Threading.Tasks.Task MarkAsReadAsync(long notificationId);
    System.Threading.Tasks.Task MarkAllAsReadAsync(int profileId);
}