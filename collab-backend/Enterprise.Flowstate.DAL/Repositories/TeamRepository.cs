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
    }
}
