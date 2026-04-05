using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase;
using Supabase.Interfaces;
using Supabase.Postgrest;
using Supabase.Postgrest.Responses;
using static Supabase.Postgrest.Constants;

namespace Enterprise.Flowstate.DAL.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly Supabase.Client _supabaseClient;

    public NotificationRepository(Supabase.Client client)
    {
        _supabaseClient = client;
    }

    public async Task<Notification> CreateAsync(Notification notification)
    {
        var response = await _supabaseClient
            .From<Notification>()
            .Insert(notification);

        return response.Models.First();
    }

    public async Task<List<Notification>> GetByRecipientAsync(int profileId, int page, int pageSize)
    {
        var response = await _supabaseClient
            .From<Notification>()
            .Where(x => x.RecipientProfileId == profileId)
            .Order(x => x.CreatedAt, Ordering.Descending)
            .Range((page - 1) * pageSize, page * pageSize - 1)
            .Get();

        return response.Models;
    }

    public async Task<int> GetUnreadCountAsync(int profileId)
    {
        var response = await _supabaseClient
            .From<Notification>()
            .Where(x => x.RecipientProfileId == profileId && x.IsRead == false)
            .Count(CountType.Exact);

        return response;
    }

    public async System.Threading.Tasks.Task MarkAsReadAsync(long notificationId)
    {
        var notification = new Notification
        {
            Id = notificationId,
            IsRead = true,
            ReadAt = DateTime.UtcNow
        };

        await _supabaseClient
            .From<Notification>()
            .Where(x => x.Id == notificationId)
            .Update(notification);
    }

    public async System.Threading.Tasks.Task MarkAllAsReadAsync(int profileId)
    {
        var notification = new Notification
        {
            IsRead = true,
            ReadAt = DateTime.UtcNow
        };

        await _supabaseClient
            .From<Notification>()
            .Where(x => x.RecipientProfileId == profileId && x.IsRead == false)
            .Update(notification);
    }
}