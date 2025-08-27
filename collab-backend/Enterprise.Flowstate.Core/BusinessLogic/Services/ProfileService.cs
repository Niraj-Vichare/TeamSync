using Enterprise.Flowstate.BAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class ProfileService : IProfileService
    {
        private IOmniRepository _omniRepository;
        public ProfileService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }
        public async Task<bool> CreateProfile(User user,string displayName)
        {
            return await _omniRepository.ProfileRepository.CreateProfile(user,displayName);
        }

        public async Task<string> GetCurrentWorkspaceId(string userGuid)
        {
            var workspaceId = await _omniRepository.ProfileRepository.GetCurrentWorkspaceId(userGuid);
            if (workspaceId == null)
            {
                return null;
            }
            return workspaceId.ToString();
        }

        public async Task<ProfileDto> GetProfile(string userGuid)
        {
            var result = await _omniRepository.ProfileRepository.GetProfile(userGuid);
            ProfileDto profile = new ProfileDto
            {
                Bio = result.Bio,
                CreatedAt = result.CreatedAt,
                DisplayName = result.DisplayName,
                Id = result.Id,
                Guid = result.Guid,
                ProfileImageUrl = result.ProfileImageUrl,
                UpdatedAt = result.UpdatedAt,
                WorkspaceId = result.WorkspaceId
            };
            return profile;
        }
    }
}
