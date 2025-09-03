using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IWorkspaceService
    {
        Task<bool> CreateWorkspace(string userClaimsId, string name, string description);
        Task<bool> UpdateWorkspace(int workspaceId, string name, string description);
        Task<bool> DeleteWorkspace(int workspaceId);
        Task<List<WorkspaceDto>> GetAllWorkspaces(string userClaimId);

    }
}
