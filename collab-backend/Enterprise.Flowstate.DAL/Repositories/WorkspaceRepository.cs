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
        public async Task<bool> CreateWorkspace(int ownerId,string name,string description)
        {
            Workspace workspace = new Workspace
            {
                Name = name,
                Description = description,
                OwnerId = ownerId
            };
            var result = await _supabaseClient.From<Workspace>().Insert(workspace);
            return result.Models.Count > 0;
        }
    }
}
