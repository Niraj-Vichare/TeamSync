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
        private IOmniRepository _omniRepository;
        public OmniService(IOmniRepository omniRepository,Supabase.Client client)
        {
            _client = client;
            _omniRepository = omniRepository;
            AuthService = new AuthService(_client);
            TaskService = new TaskService(_omniRepository);
            ProfileService = new ProfileService(_omniRepository);
            WorkspaceService = new WorkspaceService(_omniRepository);
        }

    }
}
