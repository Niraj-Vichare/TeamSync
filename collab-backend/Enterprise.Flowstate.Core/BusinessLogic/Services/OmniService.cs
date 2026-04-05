using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{

    public class OmniService : IOmniService
    {
        public IAuthService AuthService { get; }
        public ITaskService TaskService { get; }
        public IWorkspaceService WorkspaceService { get; }
        public IProfileService ProfileService { get; }
        public ITeamService TeamService { get; }
        public IProjectService ProjectService { get; }
        public ISprintService SprintService { get; }
        public ITicketService TicketService { get; }
        public IDashboardService DashboardService { get; }
        public ILeaderboardComparisonService LeaderboardComparisonService { get; }
        public IRoleService RoleService { get; }
        public INotificationService NotificationService { get; }

        public OmniService(
            IAuthService authService,
            ITaskService taskService,
            IWorkspaceService workspaceService,
            IProfileService profileService,
            ITeamService teamService,
            IProjectService projectService,
            ISprintService sprintService,
            ITicketService ticketService,
            IDashboardService dashboardService,
            ILeaderboardComparisonService leaderboardComparisonService,
            IRoleService roleService,
            INotificationService notificationService)
        {
            AuthService = authService;
            TaskService = taskService;
            WorkspaceService = workspaceService;
            ProfileService = profileService;
            TeamService = teamService;
            ProjectService = projectService;
            SprintService = sprintService;
            TicketService = ticketService;
            DashboardService = dashboardService;
            LeaderboardComparisonService = leaderboardComparisonService;
            RoleService = roleService;
            NotificationService = notificationService;
        }
    }
}
