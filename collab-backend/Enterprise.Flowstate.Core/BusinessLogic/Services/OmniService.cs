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

        public IAuthService AuthService { get; set; }
        public ITaskService TaskService { get; set; }
        public IWorkspaceService WorkspaceService { get; set; }

        private readonly Supabase.Client _client;
        public IProfileService ProfileService { get; set; }   
        public ITeamService TeamService { get; set; }
        public IProjectService ProjectService { get; set; }
        public ISprintService SprintService { get; set; }
        public ITicketService TicketService { get; set; }
        private IEventPublisher _eventPublisher;
        public IDashboardService DashboardService { get; set; }
        public ILeaderboardComparisonService LeaderboardComparisonService { get; set; }
        public IRoleService RoleService { get; set; }   

        private IOmniRepository _omniRepository;
        private ICache _cache;
        public OmniService(IOmniRepository omniRepository,Supabase.Client client,IEventPublisher eventPublish,ICache cache)
        {
            _client = client;
            _omniRepository = omniRepository;
            _eventPublisher = eventPublish;
            _cache = cache;
            AuthService = new AuthService(_client);
            TaskService = new TaskService(_omniRepository,_eventPublisher);
            LeaderboardComparisonService = new LeaderboardComparisonService(_cache, _omniRepository);
            ProfileService = new ProfileService(_cache,_omniRepository);
            WorkspaceService = new WorkspaceService(_cache,_omniRepository);
            ProjectService = new ProjectService(_omniRepository,eventPublish);
            TeamService = new TeamService(_omniRepository,_client,_cache);
            SprintService = new SprintService(_omniRepository);
            TicketService = new TicketService(_omniRepository,eventPublish);
            DashboardService = new DashboardService(_omniRepository,_eventPublisher);
            RoleService = new RoleService(_omniRepository, _cache);
        }

    }
}
