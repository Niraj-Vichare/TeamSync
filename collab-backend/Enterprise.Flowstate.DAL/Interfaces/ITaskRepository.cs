using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ITaskRepository
    {
        Task<bool> CreateTask(Task task);
        Task<bool> UpdateTask(int taskId,Task task);
        Task<bool> DelteTask(int taskId);
        Task<List<Task>> GetAllTask(int projectId);
    }
}
