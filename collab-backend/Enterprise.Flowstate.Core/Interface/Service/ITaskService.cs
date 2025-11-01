using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using FirebaseAdmin.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ITaskService
    {
        Task<bool> CreateTask(string workspaceGuid,TaskDto task);
        Task<bool> DeleteTask(string taskId);
        Task<PaginationResponse<TaskDto>> GetTasks(string userGuid, string searchTerm, string statusFilter, string sprintId, string projectId, string ticketId, int pageNumber, int pageSize);
        Task<bool> UpdateTask(string taskGuid,string userGuid,TaskDto task);
        Task<TaskDto> GetTaskById(int taskId);
        Task<List<TaskDto>> GetAllTaskAssignedToUser(string userGuid,string projectId,string sprintId,string ticketId,string priority,string status);

        Task<bool> UpdateTaskStatus(string userGuid, int taskId, string taskStatus);
    }
}
