using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private Supabase.Client client;
        public ProjectRepository(Supabase.Client client)
        {
            this.client = client;
        }
        public async Task<(List<Project> Projects, int TotalCount)> GetUserProjectsAsync(string workspaceGuid,string search,string status,int pageNumber,int pageSize)
        {
            // Step 1: Get user’s project mappings
            var workspace = await client.From<Workspace>().Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            if(workspace == null || workspace.Models.Count == 0)
                return (new List<Project>(), 0);

            var workspaceId = workspace.Models.First().Id;

            var mappings = await client.From<ProjectWorkspaceMapping>()
                .Filter("workspace_id", Supabase.Postgrest.Constants.Operator.Equals, workspaceId)
                .Get();

            var projectIds = mappings.Models.Select(m => m.ProjectId).ToList();
            if (!projectIds.Any())
                return (new List<Project>(), 0);

            // Step 2: Build query
            var query = client.From<Project>().Filter("id",Supabase.Postgrest.Constants.Operator.In,projectIds);

            if (!string.IsNullOrEmpty(search))
                query = query.Filter("name", Supabase.Postgrest.Constants.Operator.Like, $"%{search}%");

            if (!string.IsNullOrEmpty(status))
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, status);

            // Step 3: Count (total before pagination)
            var totalResult = await query.Get();
            int totalCount = totalResult.Models.Count;

            // Step 4: Apply pagination
            int from = (pageNumber - 1) * pageSize;
            int to = from + pageSize - 1;

            var pagedResult = await query.Range(from, to).Get();

            return (pagedResult.Models.ToList(), totalCount);
        }

        public async Task<List<Project>> GetOngoingProjects(string workspaceId,int limit)
        {
            var workspace = await client.From<Workspace>().Filter("id", Supabase.Postgrest.Constants.Operator.Equals, workspaceId).Single();
            if (workspace != null)
            {
                var mappings = await client.From<ProjectWorkspaceMapping>().Filter("workspace_id", Supabase.Postgrest.Constants.Operator.Equals, workspaceId)
                                .Get();

                var projectIds = mappings.Models.Select(m => m.ProjectId).ToList();
                if (!projectIds.Any())
                    return new List<Project>();

                // Step 2: Get projects that match those IDs and are ongoing
                var projects = await client
                    .From<Project>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.In, $"({string.Join(",", projectIds)})")
                    .Filter("status", Supabase.Postgrest.Constants.Operator.Equals, "ongoing")
                    .Limit(limit)
                    .Get();
                return projects.Models.ToList();
            }
            return null;
        }
        public async Task<(bool,GeneralEnums.ErrorStatus)> CreateProject(string workspaceGuid, Project project)
        {

            var result = await client.From<Project>().Insert(project);
            var projectModel= result.Models.FirstOrDefault();
            if(projectModel == null)
            {
                return (false, GeneralEnums.ErrorStatus.PROJECT_NOT_FOUND);
            }
            var result2 = await client.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            var workspace = result2.Models.FirstOrDefault();

            if (workspace==null)
            {
                return (false, GeneralEnums.ErrorStatus.USER_NOT_IN_WORKSPACE);
            }
            var projectId = projectModel.ProjectId;
            var workspaceId = workspace.Id;
            ProjectWorkspaceMapping mapping = new ProjectWorkspaceMapping
            {
                ProjectId = projectId,
                WorkspaceId = workspaceId                
            };
            var result3 = await client.From<ProjectWorkspaceMapping>().Insert(mapping);
            if (result3.Models.Count <= 0)
            {
                return (false,GeneralEnums.ErrorStatus.FAILURE);
            }
            return (true, GeneralEnums.ErrorStatus.SUCCESS);
        }

        public async Task<(bool, GeneralEnums.ErrorStatus)> UpdateProject(string projectGuid, Project project)
        {
            var result = await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Single();
            if (result != null)
            {
                result.ProjectStatus = project.ProjectStatus;
                result.ProjectName = project.ProjectName;
                result.ProjectLogo = project.ProjectLogo;
                result.ProjectDescription = project.ProjectDescription;
                result.EndDate = project.EndDate;
                result.DueDate = project.DueDate;
                result.ProjectTagline = project.ProjectTagline;
                result.ProjectCategory = project.ProjectCategory;
            }
            var updated = await result.Update<Project>();
            if (updated.Models.Count > 0)
            {
                return (true, GeneralEnums.ErrorStatus.SUCCESS);
            }
            return (false, GeneralEnums.ErrorStatus.PROJECT_NOT_FOUND);
        }

        public async Task<Project> GetProjectById(string workspaceId, string projectGuid)
        {
            var result = await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Single();
            return result;
        }

        public async Task<bool> UpdateProjectStatus(string projectGuid, int projectStatus)
        {
            var project = await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Single();
            if (project == null)
            {
                return false;
            }
            project.ProjectStatus = projectStatus;
            var result = await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Update(project);
            return result.Models.Count > 0;
        }
        public async Task<(bool, GeneralEnums.ErrorStatus)> DeleteProject(string workspaceId, string projectGuid)
        {
            var projectResult = await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Single();
            if(projectResult == null)
            {
                return (false, GeneralEnums.ErrorStatus.PROJECT_NOT_FOUND);
            }
            var workspaceResult = await client.From<Workspace>().Where(w => w.WorkspaceGuid == workspaceId).Single();
            if(workspaceResult == null)
            {
                return (false, GeneralEnums.ErrorStatus.WORKSPACE_NOT_FOUND);
            }   
            await client.From<ProjectWorkspaceMapping>().Where(m => m.ProjectId == projectResult.ProjectId && m.WorkspaceId == workspaceResult.Id).Delete();
            await client.From<Project>().Where(p => p.ProjectGuid == projectGuid).Delete();
            return (true, GeneralEnums.ErrorStatus.SUCCESS);    
        }
    }
}
