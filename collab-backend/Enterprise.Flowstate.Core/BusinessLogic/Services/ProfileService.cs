using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Supabase.Gotrue;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.DTO;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class ProfileService : IProfileService
    {
        private IOmniRepository _omniRepository;
        private ICache _cache;

        public ProfileService(ICache cache,IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
            _cache = cache;
        }
        public async Task<bool> CreateProfile(User user,string displayName)
        {

            int profileId = await _omniRepository.ProfileRepository.CreateProfile(user,displayName);
            if (profileId > 0)
            {
                (DateOnly startDate,DateOnly endDate) = PeriodHelper.GetCurrentWeekPeriodDateOnly();
                await _omniRepository.ProfileRepository.InializeUserConfiguration(profileId,startDate,endDate);
                
            }
            
            return profileId > 0;
        }

        public async Task<string> GetCurrentWorkspaceId(string userGuid)
        {
            var workspaceId = await _omniRepository.ProfileRepository.GetCurrentWorkspaceId(userGuid);
            if (string.IsNullOrEmpty(workspaceId))
            {
                return null;
            }
            return workspaceId.ToString();
        }
        public async Task<bool> ProfileExists(string userGuid)
        {
            try
            {
                var profile = await _omniRepository.ProfileRepository.GetProfile(userGuid);
                return profile != null;
            }
            catch
            {
                return false;
            }
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
                WorkspaceId = result.WorkspaceId,
                Email = result.Email,
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


        public async System.Threading.Tasks.Task UpertWeeklyUserMetric(WeeklyUserStatsDto weeklyUserStatsDto)
        {
            WeeklyUserStats weeklyUserStats = new WeeklyUserStats
            {
                StartPeriod = weeklyUserStatsDto.StartPeriod,
                EndPeriod = weeklyUserStatsDto.EndPeriod,
                ContributionPoints = weeklyUserStatsDto.ContributionPoint,
                CreatedAt = weeklyUserStatsDto.CreatedAt,
                Efficiency = weeklyUserStatsDto.Efficiency,
                RankPosition = weeklyUserStatsDto.RankPosition,
                Score = weeklyUserStatsDto.Score,
                TicketCompleted = weeklyUserStatsDto.TicketsCompleted,
                UserId = weeklyUserStatsDto.UserId,
                TotalHours = weeklyUserStatsDto.TotalHours,
                WorkspaceId = weeklyUserStatsDto.WorkspaceId
            };
            var result = _omniRepository.ProfileRepository.UpertWeeklyUserMetric(weeklyUserStats);
        }


        public async Task<int> GetUserRole(string userGuid,string workspaceGuid)
        {
            return await _omniRepository.ProfileRepository.GetUserRole(userGuid,workspaceGuid);
        }


    }
}
