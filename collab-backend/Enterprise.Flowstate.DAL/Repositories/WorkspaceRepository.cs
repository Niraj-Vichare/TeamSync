using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class WorkspaceRepository:IWorkspaceRepository
    {
        private readonly Supabase.Client _supabaseClient;
        public WorkspaceRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }
        public async Task<bool> CreateWorkspace(string ownerId, string name,string description)
        {
            var profile = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == ownerId).Get();
            if(profile.Models.Count == 0)
            {
                return false; // Profile not found
            }
            int siteuserId = profile.Models.FirstOrDefault().Id;

            Workspace workspace = new Workspace
            {
                Name = name,
                Description = description,
                OwnerId = siteuserId,                
            };
            var result = await _supabaseClient.From<Workspace>().Insert(workspace);
            if (result.Models.Count > 0)
            {
                var mapping = new WorkspaceUserMapping
                {
                    UserId = siteuserId,
                    WorkspaceId = result.Models.FirstOrDefault().Id
                };
                await _supabaseClient.From<WorkspaceUserMapping>().Insert(mapping);
            }
            return result.Models.Count > 0;
        }

        public async Task<List<WorkspaceUserMapping>> GetWorkspaces(string userGuid)
        {
            var profile = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            int profileId = profile.Models.FirstOrDefault().Id;
            if (profileId > 0)
            {
                var workspaces = await _supabaseClient.From<WorkspaceUserMapping>().Where(mapping => mapping.UserId == profileId)
                    .Get();
                return workspaces.Models.ToList();
            }
            return null;
        }
    }
}
