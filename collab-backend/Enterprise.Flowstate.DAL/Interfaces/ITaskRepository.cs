using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ITaskRepository
    {
        Task<bool> CreateTask(Tasks task);
        Task<bool> UpdateTask(int taskId,Tasks task);
        Task<bool> DelteTask(int taskId);
        Task<List<Tasks>> GetAllTask(int projectId);
    }
}
