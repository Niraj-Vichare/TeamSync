namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IOmniService
    {
        IAuthService AuthService { get; }
        ITaskService TaskService { get; }
        IProfileService ProfileService { get; }
        IWorkspaceService WorkspaceService { get; }
        IProjectService ProjectService { get; }
        ITeamService TeamService { get; }
        ISprintService SprintService { get; }
        ITicketService TicketService { get; }
        IDashboardService DashboardService { get; }
        ILeaderboardComparisonService LeaderboardComparisonService { get; }
        IRoleService RoleService { get; }
        INotificationService NotificationService { get; }
    }
}