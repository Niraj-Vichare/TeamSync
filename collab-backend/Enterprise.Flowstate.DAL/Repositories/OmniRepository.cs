using Enterprise.Flowstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class OmniRepository
    {
        public ITaskRepository TaskRepository { get;set; }
        private readonly Supabase.Client _supabaseClient;
        public OmniRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
            TaskRepository = new TaskRepository(_supabaseClient);
        }
    }
}
