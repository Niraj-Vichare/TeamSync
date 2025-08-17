using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private Supabase.Client _supabaseClient;
        public TaskRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public Task<bool> CreateTask(Task task)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DelteTask(int taskId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Task>> GetAllTask(int projectId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateTask(int taskId, Task task)
        {
            throw new NotImplementedException();
        }
    }
}
