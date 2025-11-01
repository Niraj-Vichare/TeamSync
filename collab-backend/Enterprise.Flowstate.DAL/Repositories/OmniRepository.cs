using Enterprise.Flowstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class OmniRepository:IOmniRepository
    {
        public ITaskRepository TaskRepository { get;set; }
        public IWorkspaceRepository WorkspaceRepository { get;set; }    
        public IProfileRepository ProfileRepository { get; set; }
        public IProjectRepository ProjectRepository { get;set; }
        public ITeamRepository TeamRepository { get; set; }
        public ISprintRepository SprintRepository { get; set; }
        public ITicketRepository TicketRepository { get; set; }
        public IDashboardRepository DashboardRepository { get; set; }
        private readonly Supabase.Client _supabaseClient;

        public OmniRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
            TeamRepository = new TeamRepository(_supabaseClient);
            TaskRepository = new TaskRepository(_supabaseClient);
            ProfileRepository = new ProfileRepository(_supabaseClient);
            WorkspaceRepository = new WorkspaceRepository(_supabaseClient);
            SprintRepository = new SprintRepository(_supabaseClient);
            ProjectRepository = new ProjectRepository(_supabaseClient);
            TicketRepository = new TicketRepository(_supabaseClient);
            DashboardRepository = new DashboardRepository(_supabaseClient);
        }
    }
}
