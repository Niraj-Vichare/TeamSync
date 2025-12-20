using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public class ProfileRepository:IProfileRepository
    {
        private Supabase.Client _supabaseClient;    
        public ProfileRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
            // Initialize any required services or repositories here
        }

        public async Task<int?> CreateProfileAsync(Profile profile)
        {
            // First need to create the supabase profile
            var result = await _supabaseClient
                .From<Profile>()
                .Insert(profile);

            var profileId = result.Models.FirstOrDefault()?.Id;
            if(profileId == null || profileId <= 0)
            {
                return 0;
            }
            var finalResult = await InsertProfileWorkspaceMapping((int)profileId, profile.WorkspaceId);
            if(!finalResult)
            {
                return 0;
            }
            return profileId;
        }

        public async Task<bool> InsertProfileWorkspaceMapping(int profileId, string workspaceGuid)
        {
            var workspaceResponse = _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if(workspaceResponse == null)
            {
                return false;
            }
            int workspaceId = workspaceResponse.Result.Models.FirstOrDefault().Id;
            WorkspaceUserMapping mapping = new WorkspaceUserMapping
            {
                UserId = profileId,
                WorkspaceId = workspaceId
            };
            var result = await _supabaseClient.From<WorkspaceUserMapping>().Insert(mapping);
            return result.Models.Count > 0;
        }

        public async Task<int> CreateProfile(User user,string? displayName)
        {
            Profile profile = new Profile
            {
                Guid = user.Id,
                CreatedAt = DateTime.UtcNow,
                DisplayName = displayName
            };
            var result = await _supabaseClient.From<Profile>().Insert(profile);
            return result.Models.FirstOrDefault().Id;
        }

        public async Task<string> GetCurrentWorkspaceId(string userGuid)
        {
            var result = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            return result.Models.FirstOrDefault().WorkspaceId;
        }
        public async Task<int> GetProfileId(string userGuid)
        {
            var result = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            if (result.Models.Any())
            {
                var profile = result.Models.FirstOrDefault();
                return profile.Id;
            }
            return 0;
        }

        public async Task<Profile> GetProfile(string userGuid)
        {
            var result = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            return result.Models.FirstOrDefault() ?? new Profile(); // Return an empty profile if not found
        }

        public async Task<List<WorkspaceUserMapping>> GetWorkspaceUsers(string workspaceGuid)
        {
            if(workspaceGuid == null)
            {
                return null;
            }
            var workspace =await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if(workspace != null)
            {
                int workspaceId = workspace.Models.FirstOrDefault().Id;
                var result2 = await _supabaseClient.From<WorkspaceUserMapping>().Where(mapping => mapping.WorkspaceId == workspaceId).Get();
                return result2.Models.ToList();
            }
            return new List<WorkspaceUserMapping>();
        }

        public async Task<bool> InializeUserConfiguration(int userId,DateTime startDate,DateTime endDate)
        {

            
            WeeklyUserStats userMetric = new WeeklyUserStats
            {
                UserId = userId,
                EndPeriod = endDate,
                StartPeriod = startDate,
                ContributionPoints = 0,
                Score = 0,
                RankPosition = -1,
                Efficiency = 0,
                TotalHours = 0,
                CreatedAt = DateTime.Now,
            };

            await _supabaseClient.From<WeeklyUserStats>().Insert(userMetric);  
            return true;
        }



        public async Task<bool> UpdateUserConfiguration(string userGuid, string workspaceGuid, int memberCount)
        {
            var workspace = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            var profile = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            if(workspace == null && profile == null)
            {
                return false;
            }
            int profileId = profile.Models.FirstOrDefault().Id;
            int workspaceId = workspace.Models.FirstOrDefault().Id;
            var userMetricResponse = await _supabaseClient.From<WeeklyUserStats>().Where(userMetric => userMetric.Id == profileId).Get();
            if (userMetricResponse == null)
            {
                return false;
            }
            WeeklyUserStats userMetric = userMetricResponse.Models.FirstOrDefault();

            userMetric.WorkspaceId = workspaceId;
            
            _supabaseClient.From<WeeklyUserStats>().Update(userMetric);
            return true;
        }
    }
}
