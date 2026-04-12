using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Constants;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class WorkspaceService : IWorkspaceService
    {
        private IOmniRepository _omniRepository;
        private readonly ICache _cache;
        public WorkspaceService(ICache cache,IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
            _cache = cache;
        }

        public async Task<string> CreateWorkspace(string userClaimsId, string name, string description)
        {
            if (string.IsNullOrEmpty(name))
            {
                return string.Empty;
            }
            (string workspaceGuid, int workspaceId) = await _omniRepository.WorkspaceRepository.CreateWorkspace(userClaimsId, name, description);

            if (!string.IsNullOrEmpty(workspaceGuid))
            {
                int memberCount = await _omniRepository.WorkspaceRepository.GetWorkspaceMemberCount(workspaceGuid);
                Profile profile = await _omniRepository.ProfileRepository.UpdateUserConfiguration(userClaimsId, workspaceGuid, 0);

                RankingCacheModel userMetric = new RankingCacheModel
                {
                    ContributionPoint = 0,
                    Efficiency = 0,
                    Ranking = memberCount,
                    Score = 0,
                    TotalHours = 0,
                    TotalTicketCompleted = 0,
                    UserName = profile.DisplayName,
                    UserId = profile.Id,
                    UserProfilePic = profile.ProfileImageUrl
                };
                #region Cache Things
                var ws = _cache.Workspace(workspaceGuid,workspaceId);
                await ws.User(userClaimsId).Metric.UpsertAsync(userMetric);
                await ws.User(userClaimsId).Role.SetAsync(AuthEnums.RoleEnum.Owner.ToString());
                await ws.User(userClaimsId).UserId.SetAsync(profile.Id.ToString());
                await ws.Ranking.UpdateAsync(userClaimsId, 0); 
                await _cache.SetStringAsync(
                    string.Format(FlowStateConstants.Cache.UserWorkspace, userClaimsId),
                    workspaceGuid,
                    TimeSpan.FromHours(30));
                //await _cache.UpdateWorkspaceRankingAtomicAsync(workspaceGuid,userClaimsId,0);
                #endregion

                Members members = new Members()
                {
                    DepartmentId = (int)WorkspaceEnums.Department.Administration,
                    PositionId = (int)WorkspaceEnums.WorkspacePosition.Admin,
                    ProfileId = Convert.ToInt32(profile.Id),
                    Status = (int)AuthEnums.UserStatus.Active,
                    WorkspaceGuid = workspaceGuid,
                };

                var result = await _omniRepository.TeamRepository.AddMember(workspaceGuid, members);
                if (!result)
                {
                    return string.Empty;
                }

                await _omniRepository.ProfileRepository.UpdateCurrentWorkspace(userClaimsId, workspaceGuid);

                EventsLog eventsLogs = new EventsLog
                {
                    EventDescription = "Workspace.Created",
                    CreatedAt = DateTime.UtcNow,
                    WorkspaceGuid = workspaceGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                    UserGuid = userClaimsId,
                    EventTypeId = (int)GeneralEnums.EventType.CreateWorkspace,
                    Metadata = $"Workspace {name} created."
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLogs);
                return workspaceGuid;
            }
            return string.Empty;

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
                WorkspaceGuid = mapping.Workspace.WorkspaceGuid,
                OwnerId = mapping.UserId
            }).ToList();
            return workspaces;
        }

        public async Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUserGroup(string workspaceGuid)
        {
            return await _omniRepository.WorkspaceRepository.GetAllActiveWorkspaceUserGroup(workspaceGuid);
        }
        public async Task<bool> HasWorkspace(string email)
        {
            var response = await _omniRepository.WorkspaceRepository.HasWorkspace(email);
            return response;
        }
        public async Task<int> GetUserWorkspaceInfo(string workspaceGuid, string userId)
        {
            return await _omniRepository.WorkspaceRepository.GetUserWorkspaceInfo(workspaceGuid,userId);
        }
        public async Task<List<int>> GetAllActiveWorkspaceIds()
        {
            var response = await _omniRepository.WorkspaceRepository.GetAllActiveWorkspaceIds();
            return response;
        }

        public async Task<List<string>> GetAllActiveWorkspaceGuid()
        {
            var response = await _omniRepository.WorkspaceRepository.GetAllActiveWorkspaceGuid();
            return response;
        }

        public async Task<List<WorkspaceInfoDto>> GetAllWorkspaceInfo()
        {
            var response = await _omniRepository.WorkspaceRepository.GetAllWorkspaceInfo();
            return response;
        }

        public async Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUser(int workspaceId)
        {
            return await _omniRepository.WorkspaceRepository.GetAllActiveWorkspaceUser(workspaceId);
        }
    }
}
