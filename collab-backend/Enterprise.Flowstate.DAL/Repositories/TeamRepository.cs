using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System.Collections.Concurrent;
using static Supabase.Postgrest.Constants;


namespace Enterprise.Flowstate.DAL.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private Supabase.Client _supabaseClient;
        public TeamRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;

        }
        public async Task<bool> AddMember(string workspaceId, Members mapping)
        {
            var response = await _supabaseClient.From<Members>().Insert(mapping);
            return response.Models.Count > 0;
        }


        public async Task<List<Members>> GetTeamMembers(string workspaceId)
        {
            var workspace = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceId).Single();
            if (workspace == null)
            {
                return null;
            }
            var response = await _supabaseClient.From<Members>().Select("*,department:department_id(*),profile:profile_id(*)").Where(mapping => mapping.WorkspaceGuid == workspaceId).Get();
            var teamMembers = response.Models.ToList();

            return teamMembers;

        }


        public async Task<List<TeamDropdownModel>> GetTeamDropDown(string workspaceGuid)
        {
            // Get workspace by GUID
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            if (workspaceResponse == null)
            {
                return null; // workspace not found
            }
            var workspace = workspaceResponse.Models.FirstOrDefault();  
            // Get teams in the workspace
            var teamResponse = await _supabaseClient
                .From<Team>()
                .Where(t => t.WorkspaceId == workspace.Id)
                .Get();

            if (teamResponse.Models == null || !teamResponse.Models.Any())
            {
                return new List<TeamDropdownModel>(); // no teams
            }

            // Map to dropdown model
            var dropdown = teamResponse.Models.Select(team => new TeamDropdownModel
            {
                TeamId = team.TeamId,
                TeamName = team.TeamName
            }).ToList();

            return dropdown;
        }

        public async Task<List<TeamMemberMapping>> GetAssignedMember(string sprintGuid)
        {
            var sprintResponse = await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (!sprintResponse.Models.Any())
            {
                return null;
            }
            var sprint = sprintResponse.Models.FirstOrDefault();
            long assignedTeamId = sprint.WorkingTeamId;
            
            var mappingResult = await _supabaseClient.From<TeamMemberMapping>().Select("*,team:team_id(team_name),member:member_id(*,profile:profile_id(*), department:department_id(*))").Where(mapping=>mapping.TeamId == assignedTeamId).Get();
            return mappingResult.Models.ToList();
        }

        public async Task<List<TeamDto>> GetCustomTeams(string workspaceGuid)
        {
            var workspaceResponse = await _supabaseClient
        .From<Workspace>()
        .Filter("workspace_guid", Supabase.Postgrest.Constants.Operator.Equals, workspaceGuid)
        .Get();

            if (!workspaceResponse.Models.Any())
            {
                return new List<TeamDto>();
            }

            var workspaceId = workspaceResponse.Models.First().Id;

            // Get all teams for this workspace
            var teamsResponse = await _supabaseClient
                .From<Team>()
                .Filter("workspace_id", Supabase.Postgrest.Constants.Operator.Equals, workspaceId)
                .Get();

            if (!teamsResponse.Models.Any())
            {
                return new List<TeamDto>();
            }

            var teamIds = teamsResponse.Models.Select(t => t.TeamId).ToList();

            // Get all team member mappings with member, profile, and department info
            var teamMemberMappingsResponse = await _supabaseClient
                .From<TeamMemberMapping>()
                .Select("*, member:member_id(*, profile:profile_id(*), department:department_id(*))")
                .Filter("team_id", Supabase.Postgrest.Constants.Operator.In, teamIds)
                .Get();

            // Group mappings by team
            var teamMemberGroups = teamMemberMappingsResponse.Models
                .GroupBy(tm => tm.TeamId);

            var result = new List<TeamDto>();

            foreach (var team in teamsResponse.Models)
            {
                var teamMembers = teamMemberGroups
                    .FirstOrDefault(g => g.Key == team.TeamId)?
                    .ToList() ?? new List<TeamMemberMapping>();

                var customTeam = new TeamDto
                {
                    TeamId = team.TeamId,
                    Name = team.TeamName,
                    Tagline = team.Tagline,

                    Members = teamMembers.Select(tm => new TeamMemberDto
                    {
                        StatusId = tm.Member?.Status ?? 0,
                        PositionId = tm.Member.PositionId,
                        DepartmentDto = tm.Member?.Department != null ? new DepartmentDto
                        {
                            DepartmentId = tm.Member.Department.Id,
                            DepartmentName = tm.Member.Department.Title,
                            Tagline = tm.Member.Department.Tagline,
                            DepartmentColor = tm.Member.Department.DepartmentColor
                        } : null,
                        Profile = tm.Member?.Profile != null ? new ProfileDto
                        {
                            Id = tm.Member.Profile.Id,
                            DisplayName = tm.Member.Profile.DisplayName,
                            Guid = tm.Member.Profile.Guid,
                            Bio = tm.Member.Profile.Bio,
                            ProfileImageUrl = tm.Member.Profile.ProfileImageUrl,
                            CreatedAt = tm.Member.Profile.CreatedAt,
                            UpdatedAt = tm.Member.Profile.UpdatedAt,
                            WorkspaceId = tm.Member.Profile.WorkspaceId,
                            Email = tm.Member.Profile.Email,
                            IsLeader = tm.IsLeader
                        } : null
                    }).ToList()
                };

                result.Add(customTeam);
            }
            return result;
        }

        public async System.Threading.Tasks.Task AddTeamMemberMapping(TeamMemberMapping teamMemberMapping)
        {
            _supabaseClient.From<TeamMemberMapping>().Insert(teamMemberMapping);
        }
        public async Task<int> AddTeam(Team team)
        {
            var response = await _supabaseClient.From<Team>().Insert(team);
            return (int)response.Models.FirstOrDefault().TeamId;
        }
        public async Task<List<DepartmentWithMembersDto>> GetDepartmentWiseMembers(string workspaceGuid)
        {
            // Get all members with their department and profile information
            var membersResponse = await _supabaseClient
                .From<Members>()
                .Select("*,department:department_id(*),profile:profile_id(*)")
                .Where(member=>member.WorkspaceGuid == workspaceGuid)
                .Get();

            if (!membersResponse.Models.Any())
            {
                return new List<DepartmentWithMembersDto>();
            }

            // Group members by department
            var departmentGroups = membersResponse.Models
                .Where(m => m.Department != null)
                .GroupBy(m => m.DepartmentId);

            var result = new List<DepartmentWithMembersDto>();

            foreach (var group in departmentGroups)
            {
                var firstMember = group.First();
                var department = firstMember.Department;

                var departmentWithMembers = new DepartmentWithMembersDto
                {
                    DepartmentId = department.Id,
                    DepartmentName = department.Title,
                    Tagline = department.Tagline,
                    DepartmentColor = department.DepartmentColor,
                    Members = group.Select(m => new TeamMemberDto
                    {
                        PositionId = m.PositionId,
                        StatusId = m.Status,
                        Profile = m.Profile != null ? new ProfileDto
                        {
                            Id = m.Profile.Id,
                            DisplayName = m.Profile.DisplayName,
                            Guid = m.Profile.Guid,
                            Bio = m.Profile.Bio,
                            ProfileImageUrl = m.Profile.ProfileImageUrl,
                            CreatedAt = m.Profile.CreatedAt,
                            UpdatedAt = m.Profile.UpdatedAt,
                            WorkspaceId = m.Profile.WorkspaceId,
                            Email = m.Profile.Email,
                        } : null
                    }).ToList()
                };

                result.Add(departmentWithMembers);
            }

            // Sort by department position
            return result.OrderBy(d => d.PositionId).ToList();
        }

        public async Task<bool> EditMember(string workspaceGuid, Members mapping)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Members>()
                    .Where(x => x.WorkspaceGuid == workspaceGuid && x.ProfileId == mapping.ProfileId)
                    .Set(x => x.DepartmentId, mapping.DepartmentId)
                    .Set(x => x.Status, mapping.Status)
                    .Set(x => x.PositionId, mapping.PositionId)
                    .Update();

                return response.Models.Count > 0;
            }
            catch (Exception ex)
            {
                // log ex if you have a logger
                return false;
            }
        }

       
        public async Task<bool> RemoveTeamMember(string workspaceId, int teamId, int memberId)
        {
            
            // Execute targeted delete
            var deleteResponse = _supabaseClient.From<TeamMemberMapping>().Where(m => m.TeamId == teamId && m.MemberId == memberId).Delete();
            return true;
        }

        public async Task<bool> RemoveTeam(int teamId)
        {
            var deleteResponse = _supabaseClient.From<Team>().Where(t => t.TeamId == teamId).Delete();
            return true;
        }
        public async Task<bool> EditTeam(Team team)
        {
            try
            {
                var existing = await _supabaseClient
                    .From<Team>()
                    .Filter("team_id", Operator.Equals, team.TeamId.ToString())
                    .Get();

                if (!existing.Models.Any())
                    return false;

                var row = existing.Models.First();
                row.TeamName = team.TeamName;
                row.Tagline = team.Tagline;
                row.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient.From<Team>().Update(row);
                return response.Models.Count > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveTeamMemberMapping(TeamMemberMapping mapping)
        {
            var deleteResponse = _supabaseClient.From<TeamMemberMapping>().Where(m=>m.TeamId == mapping.TeamId && m.MemberId == mapping.MemberId).Delete();
            return true;
        }

        public async Task<bool> UpdateMember(Members member)
        {
            var existing = await _supabaseClient.From<Members>()
                .Filter("id", Operator.Equals, member.Id.ToString())
                .Get();

            if (!existing.Models.Any())
                return false;

            var row = existing.Models.First();
            row.DepartmentId = member.DepartmentId;
            row.PositionId = member.PositionId;   // maps to column "position"
            row.Status = member.Status;

            await _supabaseClient.From<Members>().Update(row);
            return true;
        }

        public async Task<bool> DeleteMember(string workspaceGuid, int profileId)
        {
            // ✅ Step 1 — delete from members table
            await _supabaseClient.From<Members>()
                .Filter("workspace_guid", Operator.Equals, workspaceGuid)
                .Filter("profile_id", Operator.Equals, profileId.ToString())
                .Delete();

            // ✅ Step 2 — resolve workspace int id for mapping table
            var workspace = await _supabaseClient.From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            if (!workspace.Models.Any())
                return false;

            int workspaceId = workspace.Models.First().Id;

            // ✅ Step 3 — delete from workspace_user_mapping
            await _supabaseClient.From<WorkspaceUserMapping>()
                .Filter("workspace_id", Operator.Equals, workspaceId.ToString())
                .Filter("profile_id", Operator.Equals, profileId.ToString())
                .Delete();

            return true;
        }

        // Update role in workspace_user_mapping (separate from members)
        public async Task<bool> UpdateUserRole(string workspaceGuid, int profileId, int roleId)
        {
            var workspace = await _supabaseClient.From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            if (!workspace.Models.Any())
                return false;

            int workspaceId = workspace.Models.First().Id;

            var mapping = await _supabaseClient.From<WorkspaceUserMapping>()
                .Filter("workspace_id", Operator.Equals, workspaceId.ToString())
                .Filter("profile_id", Operator.Equals, profileId.ToString())
                .Get();

            if (!mapping.Models.Any())
                return false;

            var row = mapping.Models.First();
            row.RoleId = roleId;

            await _supabaseClient.From<WorkspaceUserMapping>().Update(row);
            return true;
        }

        public async Task<List<TeamSummaryDto>> GetTeamsBySprintDtos(List<int> workingTeamIds)
        {
            if (workingTeamIds == null || !workingTeamIds.Any())
                return new List<TeamSummaryDto>();

            var result = await _supabaseClient
                .From<TeamMemberMapping>()
                .Select(@"
            id,
            team_id,
            member_id,
            is_leader,
            team:team (
                team_id,
                team_name,
                tagline,
                team_uuid
            ),
            member:members (
                id,
                profile:profile (
                    display_name,
                    avatar_url,
                    email,
                    guid
                )
            )
        ")
                .Filter("team_id", Supabase.Postgrest.Constants.Operator.In, workingTeamIds)
                .Get();

            if (result.Models == null || !result.Models.Any())
                return new List<TeamSummaryDto>();

            var teamSummaries = result.Models
                .Where(x => x.Team != null)
                .GroupBy(x => x.TeamId)
                .Select(group =>
                {
                    var team = group.First().Team;

                    return new TeamSummaryDto
                    {
                        TeamId = team.TeamId,
                        TeamName = team.TeamName,
                        TeamDescription = team.Tagline,
                        TeamGuid = team.TeamGuid.ToString(),

                        Members = group
                            .Where(x => x.Member?.Profile != null)
                            .Select(x => new TeamMemberSummaryDto
                            {
                                DisplayName = x.Member.Profile.DisplayName,
                                Email = x.Member.Profile.Email,
                                Guid = x.Member.Profile.Guid,
                                AvatarUrl = x.Member.Profile.ProfileImageUrl
                            })
                            .ToList()
                    };
                })
                .ToList();

            return teamSummaries;
        }
        public async Task<ConcurrentDictionary<int, int>> GetRoleProfileMapping(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any())
                return new ConcurrentDictionary<int, int>();

            var response = await _supabaseClient
                .From<WorkspaceUserMapping>()
                .Select("profile_id, role_id")
                .Filter("profile_id", Supabase.Postgrest.Constants.Operator.In, profileIds)
                .Get();

            var dictionary = new ConcurrentDictionary<int, int>(
                response.Models.Where(x => x.RoleId != 0).ToDictionary(
                        x => x.UserId,
                        x => (int)x.RoleId
                    ));

            return dictionary;
        }
    }
}
