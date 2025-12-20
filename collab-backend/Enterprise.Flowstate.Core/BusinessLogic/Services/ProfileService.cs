using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Enterprise.Flowstate.DAL.Models;

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

            int profileId = await _omniRepository.ProfileRepository.CreateProfile(user,displayName);
            if (profileId > 0)
            {
                (DateTime startDate,DateTime endDate) = PeriodHelper.GetCurrentWeekPeriod();
                _omniRepository.ProfileRepository.InializeUserConfiguration(profileId,startDate,endDate);
            }
            return profileId > 0;
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

        
        public async Task<List<ProfileDto>> GetWorkspaceUsers(string workspaceGuid)
        {
            var result = await _omniRepository.ProfileRepository.GetWorkspaceUsers(workspaceGuid);

            if (result == null || !result.Any())
            {
                return new List<ProfileDto>();
            }

            var profiles = result
                .Select(mapping => mapping.Profile)
                .Where(profile => profile != null)
                .Select(profile => new ProfileDto
                {
                    Id = profile.Id,
                    DisplayName = profile.DisplayName,
                    Guid = profile.Guid,
                    Bio = profile.Bio,
                    ProfileImageUrl = profile.ProfileImageUrl,
                    CreatedAt = profile.CreatedAt,
                    UpdatedAt = profile.UpdatedAt,
                    WorkspaceId = profile.WorkspaceId
                })
                .ToList();

            return profiles;
        }


    }
}
