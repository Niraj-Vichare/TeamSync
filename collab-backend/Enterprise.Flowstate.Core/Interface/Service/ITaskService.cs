using Enterprise.Flowstate.DAL.DTOs;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ITaskService
    {
        Task<bool> CreateTask(string workspaceGuid,TaskDto task);
        Task<bool> DeleteTask(string taskId);
        Task<PaginationResponse<TaskDto>> GetTasks(string userGuid, string searchTerm, string statusFilter, string sprintId, string projectId, string ticketId, int pageNumber, int pageSize);
        Task<bool> UpdateTask(string workspaceGuid,string taskGuid,string userGuid,TaskDto task);
        Task<TaskDto> GetTaskById(int taskId);
        Task<List<TaskDto>> GetAllTaskAssignedToUser(string userGuid,string projectId,string sprintId,string ticketId,string priority,string status);

        Task<bool> UpdateTaskStatus(string workspaceGuid,string userGuid, int taskId, string taskStatus);

        Task<List<TaskDto>> GetOngoingUserTask(string userGuid, string workspaceGuid);
        Task<List<TaskDto>> GetTasksDueOn(DateOnly dueDate);
        Task<List<TaskDto>> GetTaskByProjectIdAsync(int projectId);
    }
}
