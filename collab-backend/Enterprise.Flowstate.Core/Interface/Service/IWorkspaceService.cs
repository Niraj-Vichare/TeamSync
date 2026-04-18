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
        Task<string> CreateWorkspace(string userClaimsId, string name, string description);
        Task<bool> UpdateWorkspace(WorkspaceDto workspaceDto);
        Task<bool> DeleteWorkspace(string workspaceId);
        Task<List<WorkspaceDto>> GetAllWorkspaces(string userClaimId);
        Task<bool> HasWorkspace(string email);
        Task<List<int>> GetAllActiveWorkspaceIds();
        Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUser(int workspaceId);
        Task<int> GetUserWorkspaceInfo(string workspaceGuid,string userId);
        Task<List<string>> GetAllActiveWorkspaceGuid();

        Task<List<WorkspaceInfoDto>> GetAllWorkspaceInfo();
        Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUserGroup(string workspaceGuid);
    }
}
