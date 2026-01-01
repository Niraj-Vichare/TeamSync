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
        Task<string> CreateWorkspace(string userIdClaims, string name, string description);
        Task<List<WorkspaceUserMapping>> GetWorkspaces(string userGuid);
        Task<bool> HasWorkspace(string email);
        Task<int> GetWorkspaceId(string workspaceGuid);
        Task<int> GetWorkspaceMemberCount(string workspaceId);
        Task<List<int>> GetAllActiveWorkspaceIds();
        Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUser(int workspaceId);
    }
}
