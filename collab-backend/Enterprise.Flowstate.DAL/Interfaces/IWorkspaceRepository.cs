using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IWorkspaceRepository
    {
        Task<bool> CreateWorkspace(int ownerId, string name, string description);

    }
}
