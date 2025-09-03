using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class WorkspaceService:IWorkspaceService
    {
        private IOmniRepository _omniRepository;
        public WorkspaceService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }

        public async Task<bool> CreateWorkspace(string userClaimsId,string name, string description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return false;
            }
            var response = await _omniRepository.WorkspaceRepository.CreateWorkspace(userClaimsId, name, description);
            return response;
        }

        public Task<bool> UpdateWorkspace(int workspaceId, string name, string description)
        {
            // Logic to update a workspace
            throw new NotImplementedException();
        }

        public Task<bool> DeleteWorkspace(int workspaceId)
        {
            // Logic to delete a workspace
            throw new NotImplementedException();
        }

        public Task<List<WorkspaceDto>> GetAllWorkspaces(int workspaceId)
        {
            throw new NotImplementedException();
        }

        public async Task<List<WorkspaceDto>> GetAllWorkspaces(string userClaimId)
        {
            // Logic to get all workspaces

            var mappings = await _omniRepository.WorkspaceRepository.GetWorkspaces(userClaimId);
            List<WorkspaceDto> workspaces = mappings.Select(mapping => new WorkspaceDto
            {
                Id = mapping.WorkspaceId,
                Name = mapping.Workspace.Name,
                Description = mapping.Workspace.Description,
                OwnerId = mapping.UserId
            }).ToList();
            return workspaces;
        }
    }
}
