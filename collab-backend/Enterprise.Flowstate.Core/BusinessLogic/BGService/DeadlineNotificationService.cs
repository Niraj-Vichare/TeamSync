using Enterprise.Flowstate.BAL.Interface.Service;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.BGService
{
    /// <summary>
    /// Runs once per day at 09:00 UTC.
    /// Sends deadline warnings for tasks and sprints due tomorrow.
    /// </summary>
    public class DeadlineNotificationService : BackgroundService
    {
        private readonly ILogger<DeadlineNotificationService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public DeadlineNotificationService(
            ILogger<DeadlineNotificationService> logger,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DeadlineNotificationService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var next9am = now.Date.AddDays(now.Hour >= 9 ? 1 : 0).AddHours(9);
                    var delay = next9am - now;

                    _logger.LogInformation("Next deadline check at {Next}", next9am);
                    await Task.Delay(delay, stoppingToken);

                    using var scope = _scopeFactory.CreateScope();
                    var omniService = scope.ServiceProvider.GetRequiredService<IOmniService>();
                    var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

                    await NotifyTaskDeadlinesAsync(omniService, notifService, tomorrow, stoppingToken);
                    await NotifySprintDeadlinesAsync(omniService, notifService, tomorrow, stoppingToken);
                }
                catch (OperationCanceledException) { break; }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "DeadlineNotificationService error");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
        }

        // Tasks due tomorrow
        private async Task NotifyTaskDeadlinesAsync(
            IOmniService omniService,
            INotificationService notifService,
            DateOnly tomorrow,
            CancellationToken ct)
        {
            var tasks = await omniService.TaskService.GetTasksDueOn(tomorrow);

            foreach (var task in tasks)
            {
                if (ct.IsCancellationRequested) break;
                if (task.AssignedToUser.Id == null || task.AssignedToUser.Guid == null) continue;

                await notifService.CreateForUserAsync(
                    recipientProfileId: task.AssignedTo,
                    recipientProfileGuid: task.AssignedToUser.Guid,
                    actorProfileId: null,
                    notificationType: (int)NotificationType.TaskDeadline,
                    title: "Task due tomorrow",
                    body: $"\"{task.Title}\" is due tomorrow. Make sure it's completed on time.",
                    entityType: (int)NotificationEntityType.Task,
                    entityGuid: task.TaskGuid
                );
            }
        }

        // ── Sprints due tomorrow ──────────────────────────────────────────────
        private async Task NotifySprintDeadlinesAsync(
            IOmniService omniService,
            INotificationService notifService,
            DateOnly tomorrow,
            CancellationToken ct)
        {
            var sprints = await omniService.SprintService.GetSprintDueOn(tomorrow);

            foreach (var sprint in sprints)
            {
                if (ct.IsCancellationRequested) break;

                // Notify every team member + workspace admins
                var recipients = await omniService.SprintService.GetSprintTeamMembers(sprint.SprintGuid);

                foreach (var recipient in recipients)
                {
                    await notifService.CreateForUserAsync(
                        recipientProfileId: recipient.MemberId,
                        recipientProfileGuid: recipient.MemberProfileGuid,
                        actorProfileId: null,
                        notificationType: (int)NotificationType.SprintDeadline,
                        title: "Sprint ending tomorrow",
                        body: $"Sprint \"{sprint.Title}\" ends tomorrow. Review remaining tickets.",
                        entityType: (int)NotificationEntityType.Sprint,
                        entityGuid: Guid.TryParse(sprint.SprintGuid, out var g) ? g : null
                    );
                }
            }
        }
    }
}