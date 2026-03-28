using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using Supabase.Interfaces;
using Supabase.Postgrest;
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
        public async Task<(string,int)> CreateWorkspace(string ownerId, string name,string description)
        {
            var profile = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == ownerId).Get();
            

            if (profile.Models.Count == 0)
            {
                return (string.Empty,0); // Profile not found
            }
            int siteuserId = profile.Models.FirstOrDefault().Id;

            Workspace workspace = new Workspace
            {
                Name = name,
                Description = description,
                OwnerId = siteuserId,          
                CreatedAt = DateTime.Now,
                WorkspaceGuid = Guid.NewGuid().ToString()
            };
            //var result = await _supabaseClient.From<Workspace>().Insert(workspace);
            var result = await _supabaseClient.From<Workspace>().Insert(workspace);


            int workspaceId = result.Models.FirstOrDefault().Id;
            if (result.Models.Count > 0)
            {
                var mapping = new WorkspaceUserMapping
                {
                    UserId = siteuserId,
                    WorkspaceId = workspaceId,
                    RoleId = 1 // Assuming 1 is the role ID for owner/admin
                    
                };
                await _supabaseClient.From<WorkspaceUserMapping>().Insert(mapping);
            }
            return (result.Models.FirstOrDefault().WorkspaceGuid,result.Models.FirstOrDefault().Id);
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

        public async Task<bool> HasWorkspace(string profileGuid)
        {
            var profile = await _supabaseClient.From<Profile>().Where(profile=>profile.Guid == profileGuid).Get();
            string workspaceGuid = profile.Models.FirstOrDefault().WorkspaceId;
            if(workspaceGuid == null)
            {
                return false;
            }
            return true;

        }

        public async Task<int> GetWorkspaceId(string workspaceGuid)
        {
            var workspace =  await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            return workspace.Models.FirstOrDefault().Id;
        }

        public async Task<List<int>> GetAllActiveWorkspaceIds()
        {
            var workspaces = await _supabaseClient.From<Workspace>().Get();
            List<int> workspacesIds = workspaces.Models.Select(w => w.Id).ToList();
            return workspacesIds;
        }
        public async Task<List<WorkspaceUserMapping>> GetAllActiveWorkspaceUser(int workspaceId)
        {
            var workspaces = await _supabaseClient.From<WorkspaceUserMapping>().Where(mapping => mapping.WorkspaceId == workspaceId).Get();
            return workspaces.Models.ToList();
        }

        public async Task<int> GetUserWorkspaceInfo(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            int workspaceId = workspaceResponse.Models.FirstOrDefault().Id;
            var userResponse = await _supabaseClient.From<Profile>().Where(profile=>profile.Guid == userGuid).Get();
            int userId = userResponse.Models.FirstOrDefault().Id;
            var mappingResponse = await _supabaseClient.From<WorkspaceUserMapping>().Where(m => m.WorkspaceId == workspaceId && m.UserId == userId).Get();
            return (int)mappingResponse.Models.FirstOrDefault().RoleId;
        }
        public async Task<int> GetWorkspaceMemberCount(string workspaceId)
        {
            var workspaceGuid = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceId).Get();
            int workspaceDbId = workspaceGuid.Models.FirstOrDefault().Id;
            if (workspaceDbId == 0)
            {
                return -1;
            }
            var workspaceMappingResponse = await _supabaseClient.From<WorkspaceUserMapping>().Where(mapping=>mapping.WorkspaceId == workspaceDbId).Get();
            return workspaceMappingResponse.Models.Count;
        }

        public async Task<bool> UpdateUserRole(string workspaceGuid, int profileId, int roleId)
        {
            var workspace = await _supabaseClient.From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            if (!workspace.Models.Any()) return false;

            int workspaceId = workspace.Models.First().Id;

            var mapping = await _supabaseClient.From<WorkspaceUserMapping>()
                .Where(m => m.WorkspaceId == workspaceId && m.UserId == profileId)
                .Get();
            if (!mapping.Models.Any()) return false;

            var row = mapping.Models.FirstOrDefault();
            row.RoleId = (long)roleId;
            await _supabaseClient.From<WorkspaceUserMapping>().Update(row);
            return true;
        }

        public async Task<bool> RemoveUserFromWorkspace(string workspaceGuid, int profileId)
        {
            var workspace = await _supabaseClient.From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            if (!workspace.Models.Any()) return false;

            int workspaceId = workspace.Models.First().Id;

            await _supabaseClient.From<WorkspaceUserMapping>()
                .Where(m => m.WorkspaceId == workspaceId && m.UserId == profileId)
                .Delete();
            return true;
        }


        public async Task<List<string>> GetAllActiveWorkspaceGuid()
        {
            var workspaces = await _supabaseClient.From<Workspace>().Get();
            if(workspaces == null)
            {
                return null;
            }
            return workspaces.Models.Select(wo => wo.WorkspaceGuid).ToList();
        }
        public async Task<List<WorkspaceInfoDto>> GetAllWorkspaceInfo()
        {
            var workspaces = await _supabaseClient.From<Workspace>().Get();
            if (workspaces == null)
            {
                return null;
            }
            return workspaces.Models.Select(wo=>new WorkspaceInfoDto
            {
                WorkspaceGuid = wo.WorkspaceGuid,
                WorkspaceId = wo.Id
            }).ToList();

        }

    }
}
