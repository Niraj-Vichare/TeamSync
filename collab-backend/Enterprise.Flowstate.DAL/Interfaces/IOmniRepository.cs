using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IOmniRepository
    {
        ITaskRepository TaskRepository { get; }
        IWorkspaceRepository WorkspaceRepository { get; }
        IProfileRepository ProfileRepository { get; }
        IProjectRepository ProjectRepository { get; }
        ITeamRepository TeamRepository { get; }
        ISprintRepository SprintRepository { get; }
        ITicketRepository TicketRepository { get; }
        IDashboardRepository DashboardRepository { get; }
        ILeaderBoardRepository LeaderBoardRepository { get; }
        INotificationRepository NotificationRepository { get; }
    }
}
