using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class OmniService : IOmniService
    {

        public IAuthService AuthService { get; set; }
        public ITaskService TaskService { get; set; }
        public IWorkspaceService WorkspaceService { get; set; }

        private readonly Supabase.Client _client;
        public IProfileService ProfileService { get; set; }   
        public ITeamService TeamService { get; set; }
        public IProjectService ProjectService { get; set; }
        public ISprintService SprintService { get; set; }
        public ITicketService TicketService { get; set; }
        public IDashboardService DashboardService { get; set; }
        private IOmniRepository _omniRepository;
        public OmniService(IOmniRepository omniRepository,Supabase.Client client)
        {
            _client = client;
            _omniRepository = omniRepository;
            AuthService = new AuthService(_client);
            TaskService = new TaskService(_omniRepository);
            ProfileService = new ProfileService(_omniRepository);
            WorkspaceService = new WorkspaceService(_omniRepository);
            ProjectService = new ProjectService(_omniRepository);
            TeamService = new TeamService(_omniRepository);
            SprintService = new SprintService(_omniRepository);
            TicketService = new TicketService(_omniRepository);
            DashboardService = new DashboardService(_omniRepository);
        }

    }
}
