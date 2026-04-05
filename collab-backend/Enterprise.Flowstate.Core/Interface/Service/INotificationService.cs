using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Task = System.Threading.Tasks.Task;


namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface INotificationService
    {
        Task CreateAsync(Notification notification);

        Task CreateForUserAsync(
            int recipientProfileId,
            int? actorProfileId,
            int notificationType,
            string title,
            string body,
            int? entityType = null,
            Guid? entityGuid = null,
            string? metadata = null
        );

        Task<List<Notification>> GetUserNotificationsAsync(int profileId, int page, int pageSize);

        Task<int> GetUnreadCountAsync(int profileId);

        Task MarkAsReadAsync(long notificationId);

        Task MarkAllAsReadAsync(int profileId);
    }
}
