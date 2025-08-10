using Enterprise.Flowstate.BAL.Interface.Service;
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
        private IConfiguration _configuration;
        private ITaskService TaskService { get; set; }
        

        public OmniService(IConfiguration config)
        {
            _configuration = config;
            AuthService = new AuthService();
            TaskService = new TaskService();
        }

    }
}
