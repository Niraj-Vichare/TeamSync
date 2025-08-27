using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IOmniRepository
    {
        public IWorkspaceRepository WorkspaceRepository { get; set; }
        public ITaskRepository TaskRepository { get; set; }
        public IProfileRepository ProfileRepository { get; set; }
        public IProjectRepository ProjectRepository { get; set; }
    }
}
