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

        public async Task<bool> CreateProfile(User user,string? displayName)
        {
            Profile profile = new Profile
            {
                Guid = user.Id,
                CreatedAt = DateTime.UtcNow,
                DisplayName = displayName
            };
            var result = await _supabaseClient.From<Profile>().Insert(profile);
            return result.Models.Count > 0;
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
    }
}
