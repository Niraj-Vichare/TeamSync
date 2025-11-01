using Enterprise.Flowstate.DAL.DTOs;
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
        Task<bool> DeleteTask(string taskId);
        Task<int> GetTaskCountAsync(string userGuid,string searchTerm,string statusFilter,string sprintId,string projectId,string ticketId);
        Task<List<Task>> GetTaskAsync(string userGuid, string searchTerm, string statusFilter, string sprintId, string projectId, string ticketId, int pageNumber, int pageSize);
        Task<List<Task>> GetAllTaskAssignedToUser(string userGuid, string projectId, string sprintId, string ticketId, string priority, string status);
        Task<bool> UpdateTaskStatus(string userGuid, int taskId, int taskStatus);
        Task<bool> UpdateTask(string taskGuid,string userGuid,Task task);
    }
}
