using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> CreateAsync(Notification notification);

        Task<List<Notification>> GetByRecipientAsync(int profileId, int page, int pageSize);

        Task<int> GetUnreadCountAsync(int profileId);

        System.Threading.Tasks.Task MarkAsReadAsync(long notificationId);

        System.Threading.Tasks.Task MarkAllAsReadAsync(int profileId);
    }
}
