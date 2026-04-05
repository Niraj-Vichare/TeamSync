using Enterprise.Flowstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class OmniRepository : IOmniRepository
    {
        public ITaskRepository TaskRepository { get; }
        public IWorkspaceRepository WorkspaceRepository { get; }
        public IProfileRepository ProfileRepository { get; }
        public IProjectRepository ProjectRepository { get; }
        public ITeamRepository TeamRepository { get; }
        public ISprintRepository SprintRepository { get; }
        public ITicketRepository TicketRepository { get; }
        public IDashboardRepository DashboardRepository { get; }
        public ILeaderBoardRepository LeaderBoardRepository { get; }
        public INotificationRepository NotificationRepository { get; }

        public OmniRepository(
            ITaskRepository taskRepository,
            IWorkspaceRepository workspaceRepository,
            IProfileRepository profileRepository,
            IProjectRepository projectRepository,
            ITeamRepository teamRepository,
            ISprintRepository sprintRepository,
            ITicketRepository ticketRepository,
            IDashboardRepository dashboardRepository,
            ILeaderBoardRepository leaderBoardRepository,
            INotificationRepository notificationRepository)
        {
            TaskRepository = taskRepository;
            WorkspaceRepository = workspaceRepository;
            ProfileRepository = profileRepository;
            ProjectRepository = projectRepository;
            TeamRepository = teamRepository;
            SprintRepository = sprintRepository;
            TicketRepository = ticketRepository;
            DashboardRepository = dashboardRepository;
            LeaderBoardRepository = leaderBoardRepository;
            NotificationRepository = notificationRepository;
        }
    }
}
