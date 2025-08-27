using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IWorkspaceRepository
    {
        Task<bool> CreateWorkspace(string userIdClaims, string name, string description);
        Task<List<WorkspaceUserMapping>> GetWorkspaces(string userGuid);

    }
}
