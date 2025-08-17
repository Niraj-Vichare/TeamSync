using Enterprise.Flowstate.BAL.DTOs;
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

        public async Task<bool> CreateWorkspace(int ownerId,string name, string description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return false;
            }
            var response = await _omniRepository.WorkspaceRepository.CreateWorkspace(ownerId, name, description);
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

        public Task<bool> CreateWorkspace(string name, string description)
        {
            throw new NotImplementedException();
        }

        public Task<List<WorkspaceDto>> GetAllWorkspaces()
        {
            throw new NotImplementedException();
        }
    }
}
