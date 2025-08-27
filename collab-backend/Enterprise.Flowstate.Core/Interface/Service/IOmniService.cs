using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IOmniService
    {
        IAuthService AuthService { get; set; }
        ITaskService TaskService { get; set; }
        IProfileService ProfileService { get; set; }
        IWorkspaceService WorkspaceService { get; set; }
        IProjectService ProjectService { get; set; }
    }
}
