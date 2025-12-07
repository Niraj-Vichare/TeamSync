using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;


namespace Enterprise.Flowstate.DAL.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private Supabase.Client _supabaseClient;
        public TeamRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;

        }
        public async Task<bool> AddMember(string workspaceId, TeamMemberWorkspaceMapping mapping)
        {
            var response = await _supabaseClient.From<TeamMemberWorkspaceMapping>().Insert(mapping);
            return response.Models.Count > 0;
        }


        public async Task<List<TeamMemberWorkspaceMapping>> GetTeamMembers(string workspaceId)
        {
            var workspace = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceId).Single();
            if (workspace == null)
            {
                return null;
            }
            var response = await _supabaseClient.From<TeamMemberWorkspaceMapping>().Where(mapping => mapping.WorkspaceId == workspace.Id).Get();
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

        public async Task<List<TeamMemberMapping>> GetCustomTeams(string workspaceGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if (!workspaceResponse.Models.Any())
            {
                return null;
            }
            var workspace = workspaceResponse.Models.FirstOrDefault();
            int workspaceId = workspace.Id;

            var teamResponse = await _supabaseClient.From<Team>().Where(team => team.WorkspaceId == workspaceId).Get();
            if (!teamResponse.Models.Any())
            {
                return null;
            }
            var customTeamList = teamResponse.Models.Select(team => team.TeamId).ToList();
            if (customTeamList.Count == 0)
            {
                return null;
            }
            var teamMemberMapping = await _supabaseClient.From<TeamMemberMapping>().Filter("team_id", Supabase.Postgrest.Constants.Operator.In,customTeamList).Get();
            return teamMemberMapping.Models.ToList();
        }

        public async Task<List<Members>> GetDepartmentWiseMembers(string workspaceGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if (!workspaceResponse.Models.Any())
            {
                return null;
            }
            var workspace = workspaceResponse.Models.FirstOrDefault();
            int workspaceId = workspace.Id;

            var members = await _supabaseClient.From<Members>().Where(member => member.WorkspaceGuid == workspaceGuid).Get();
            return members.Models.ToList();

        }
    }
}
