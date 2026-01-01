using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
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
        Task<bool> HasWorkspace(string email);
        Task<List<int>> GetAllActiveWorkspaceIds();
        Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUser(int workspaceId);
    }
}
