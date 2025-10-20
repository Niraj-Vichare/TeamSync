using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;

using Enterprise.Flowstate.DAL.Models;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TaskService : ITaskService
    {
        private IOmniRepository _omniRepository;
        public TaskService(IOmniRepository omniRepository)
        {
            // Initialize any required services or repositories here
            _omniRepository = omniRepository;   
        }
        public async Task<bool> CreateTask(string userGuid,TaskDto task)
        {
            task.AssignedBy = await _omniRepository.ProfileRepository.GetProfileId(userGuid);
            task.AssignedTo = task.AssignedBy;
            Task taskDB = new Task()
            {
                AssignedBy = task.AssignedBy,
                AssignedTo = task.AssignedTo,
                CreatedAt = task.CreateAt,
                Description = task.Description,
                EndDate = task.EndDate,
                SprintId = task.SprintId,
                ProjectId = task.ProjectId,
                TicketId = task.TicketId,
                StartDate = task.StartDate,
                Title = task.Title,
                TaskGuid = Guid.NewGuid(),
                Priority = (int)task.Priority,
                Status = (int)task.Status,
            };
            bool isCreated =await _omniRepository.TaskRepository.CreateTask(taskDB);
            return isCreated;
        }

        public Task<bool> DeleteTask(int taskId)
        {
            throw new NotImplementedException();
        }

        public Task<TaskDto> GetTaskById(int taskId)
        {
            throw new NotImplementedException();
        }

        public async Task<PaginationResponse<TaskDto>> GetTasks(string userGuid, string searchTerm, string statusFilter, string sprintId, string projectId, string ticketId, int pageNumber, int pageSize)
        {
            var tasks = await _omniRepository.TaskRepository.GetTaskAsync(userGuid, searchTerm,
                statusFilter,
                sprintId,
                projectId,
                ticketId,
                pageNumber,
                pageSize
            );

            List<TaskDto> result = new List<TaskDto>();

            if (!tasks.Any())
            {
                return new PaginationResponse<TaskDto>
                {
                    Data = result,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = 0
                };
            }
            foreach (var task in tasks)
            {
                result.Add(new TaskDto
                {
                    Description = task.Description,
                    TicketId = task.TicketId,
                    ProjectId = task.ProjectId,
                    Project = new ProjectDto
                    {
                        ProjectTitle = task.Project.ProjectName,
                        ProjectGuid = task.Project.ProjectGuid,
                    },
                    Status = (TaskEnums.TaskStatus)task.Status,
                    Title = task.Title,
                    TaskGuid = task.TaskGuid,
                    Priority = (TaskEnums.TaskPriority)task.Priority,
                    SprintId = task.SprintId,
                    
                    Sprint = new SprintDto
                    {
                        Title = task.Title,
                        SprintGuid = task.Sprint.SprintGuid,
                        Status = (SprintEnums.SprintStatus)task.Sprint.StatusId
                    },
                    AssignedBy = task.AssignedBy,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    AssignedByUser = new ProfileDto
                    {
                        Guid = task?.AssignedByUser.Guid,
                        DisplayName = task?.AssignedByUser.DisplayName,

                    },
                    AssignedTo = task.AssignedTo,
                    AssignedToUser = new ProfileDto
                    {
                        DisplayName = task?.AssignedToUser.DisplayName,
                        Guid = task?.AssignedToUser.Guid
                    },
                    Ticket = new TicketDto
                    {
                        Title = task.Ticket.Title,
                        TicketGuid = task.Ticket.TicketGuid,
                        Status = (TicketEnums.TicketStatus)task.Ticket.StatusId,
                        Priority = (TicketEnums.TicketPriority)task.Ticket.PriorityId,
                        TypeId = (TicketEnums.TicketType)task.Ticket.TypeId
                    }
                });
            }


            // Prepare pagination response
            var totalCount = await _omniRepository.TaskRepository.GetTaskCountAsync(userGuid, searchTerm, statusFilter,sprintId,projectId,ticketId);

            return new PaginationResponse<TaskDto>
            {
                Data = result,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

        }

        public async Task<List<TaskDto>> GetAllTaskAssignedToUser(string userGuid, string projectId, string sprintId, string ticketId, string priority, string status)
        {
            var tasks = await _omniRepository.TaskRepository.GetAllTaskAssignedToUser(userGuid,projectId,
                sprintId,
                ticketId,
                priority,
                status
            );
            List<TaskDto> result = new List<TaskDto>();
            
            foreach (var task in tasks)
            {
                result.Add(new TaskDto
                {
                    Id = task.TaskId,
                    Description = task.Description,
                    TicketId = task.TicketId,
                    ProjectId = task.ProjectId,

                    Project = new ProjectDto
                    {
                        ProjectTitle = task.Title,
                        ProjectGuid = task.Project.ProjectGuid
                    },
                    Status = (TaskEnums.TaskStatus)task.Status,
                    Title = task.Title,
                    TaskGuid = task.TaskGuid,
                    Priority = (TaskEnums.TaskPriority)task.Priority,
                    SprintId = task.SprintId,
                    Sprint = new SprintDto
                    {
                        SprintGuid = task.Sprint?.SprintGuid.ToString(),
                        Title = task.Sprint?.Title,
                        Status = (SprintEnums.SprintStatus)task.Sprint.StatusId,
                    },
                    AssignedBy = task.AssignedBy,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    AssignedByUser = new ProfileDto
                    {
                        Guid = task.AssignedByUser?.Guid,
                        DisplayName = task.AssignedByUser?.DisplayName
                    },
                    AssignedTo = task.AssignedTo,
                    AssignedToUser = new ProfileDto
                    {
                        Guid = task.AssignedToUser?.Guid,
                        DisplayName = task.AssignedToUser?.DisplayName
                    },
                    Ticket = new TicketDto
                    {
                        TicketGuid = task.Ticket?.TicketGuid,
                        Title = task.Ticket.Title,
                        Status = (TicketEnums.TicketStatus)task.Ticket.StatusId,
                        Priority = (TicketEnums.TicketPriority)task.Ticket.PriorityId,
                        TypeId = (TicketEnums.TicketType)task.Ticket.TypeId
                    }
                });
            }
            return result;

        }

        public Task<bool> UpdateTask(TaskDto task)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateTaskStatus(string userGuid, int taskId, string taskStatus)
        {
            TaskEnums.TaskStatus statusEnum = Enum.Parse<TaskEnums.TaskStatus>(taskStatus);
            int taskStatusInInt = (int)statusEnum;
            return _omniRepository.TaskRepository.UpdateTaskStatus(userGuid, taskId, taskStatusInInt);
        }
    }
}
