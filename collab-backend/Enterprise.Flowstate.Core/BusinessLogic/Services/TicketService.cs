using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System.Text;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TicketService : ITicketService
    {
        private IOmniRepository _omniRepository;
        private readonly IEventPublisher _eventPublisher;
        public TicketService(IOmniRepository omniRepository,IEventPublisher eventPublisher)
        {
            _omniRepository = omniRepository;
            _eventPublisher = eventPublisher;
        }

        public async Task<bool> DeleteTicket(string ticketId)
        {
            bool isDeleted = await _omniRepository.TicketRepository.DeleteTicket(ticketId);
            if (isDeleted)
            {
                EventsLog eventLog = new EventsLog
                {
                    EventTypeId = (int)GeneralEnums.EventType.TicketDeleted,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Ticket is deleted",
                    TicketGuid = ticketId,
                    EventGuid = Guid.NewGuid().ToString(),
                };

                await _omniRepository.ProfileRepository.AddEventLog(eventLog);

            }
            return isDeleted;
        }

        public async Task<bool> EditTicket(string ticketId, string userId, TicketDto ticketDto)
        {
            var ticketGuid = Guid.NewGuid();
            Ticket ticket = new Ticket()
            {
                Points = ticketDto.Points,
                Description = ticketDto.Description,
                PriorityId = (int)ticketDto.Priority,
                ProjectId = ticketDto.ProjectId,
                SprintId = ticketDto.SprintId,
                StatusId = (int)ticketDto.Status,
                Steps = ticketDto.Steps,
                ReportedBy = ticketDto.ReportedBy,
                Title = ticketDto.Title,
                TypeId = (int)ticketDto.TypeId,
                TicketGuid = ticketGuid,
                AssignedTo = ticketDto?.AssignedTo,
                Tags = ticketDto.Tags,
                CreatedAt = DateTime.UtcNow
            };
            bool isEdited = await _omniRepository.TicketRepository.EditTicket(ticketId, userId, ticket);
            if (isEdited)
            {
                EventsLog eventLog = new EventsLog();

                if (ticketDto.Status == TicketEnums.TicketStatus.Closed)
                {

                    eventLog = new EventsLog
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket is closed",
                        TicketGuid = ticketId,
                        UserGuid = userId,
                        EventGuid = Guid.NewGuid().ToString(),
                    };

                    EventsLogDto eventLogDto = new EventsLogDto
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket is closed",
                        TicketGuid = ticketGuid.ToString(),
                        UserGuid = userId,
                        EventGuid = Guid.NewGuid().ToString(),
                        WorkspaceGuid = ticketDto.WorkspaceGuid
                    };

                    string json = System.Text.Json.JsonSerializer.Serialize(eventLogDto);
                    byte[] body = Encoding.UTF8.GetBytes(json);
                    await _eventPublisher.PublishAsync(eventLogDto, 0);
                }
                else
                {
                    eventLog = new EventsLog
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket is updated",
                        TicketGuid = ticketId,
                        UserGuid = userId,
                        WorkspaceGuid = ticketDto.WorkspaceGuid,
                        EventGuid = Guid.NewGuid().ToString(),
                    };
                }

                await _omniRepository.ProfileRepository.AddEventLog(eventLog);
            }
            return isEdited;
        }

        public async Task<TicketDto> GetTicket(string ticketGuid)
        {
            //TicketDto ticketDetail = await _omniRepository.TicketRepository.GetTicket(ticketGuid);
            //return ticketDetail;
            return null;
        }

        public async Task<PaginationResponse<TicketDto>> GetTickets(string workspaceGuid, string type, string searchTerm, string statusFilter, string priorityFilter, int pageNumber, int pageSize)
        {
            var tickets = await _omniRepository.TicketRepository.GetTicketsAsync(workspaceGuid, searchTerm, type,
                statusFilter,
                priorityFilter,
                pageNumber,
                pageSize
            );

            List<TicketDto> result = new List<TicketDto>();

            if (!tickets.Any())
            {
                return new PaginationResponse<TicketDto>
                {
                    Data = result,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = 0
                };
            }
            foreach (var ticket in tickets)
            {
                result.Add(new TicketDto
                {
                    Description = ticket.Description,
                    TicketId = ticket.TicketId,
                    ProjectId = ticket.ProjectId,
                    ProjectName = ticket.Project?.ProjectName,
                    Status = (TicketEnums.TicketStatus)ticket.StatusId,
                    CreatedAt = ticket.CreatedAt,
                    Tags = ticket.Tags,
                    Title = ticket.Title,
                    Points = ticket.Points,
                    TicketGuid = ticket.TicketGuid,
                    AssignedByName = ticket.AssignedByUser?.DisplayName,
                    AssignedToName = ticket.AssignedToUser?.DisplayName,
                    Priority = (TicketEnums.TicketPriority)ticket.PriorityId,
                    SprintId = ticket.SprintId,
                    SprintName = ticket.Sprint?.Title,
                    TypeId = (TicketEnums.TicketType)ticket.TypeId,
                    ReportedBy = ticket.ReportedBy,
                    Steps = ticket.Steps,
                    UpdatedAt = ticket.UpdatedAt
                });
            }


            // Prepare pagination response
            var totalCount = await _omniRepository.TicketRepository.GetTicketsCountAsync(workspaceGuid, type, searchTerm, statusFilter, priorityFilter);

            return new PaginationResponse<TicketDto>
            {
                Data = result,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

        }

        public async Task<bool> CreateTicket(string workspaceGuid, TicketDto ticketDto)
        {
            Ticket ticket = new Ticket()
            {
                Points = ticketDto.Points,
                Description = ticketDto.Description,
                PriorityId = (int)ticketDto.Priority,
                ProjectId = ticketDto.ProjectId,
                SprintId = ticketDto.SprintId,
                StatusId = (int)ticketDto.Status,
                Steps = ticketDto.Steps,
                ReportedBy = ticketDto.ReportedBy,
                Title = ticketDto.Title,
                TypeId = (int)ticketDto.TypeId,
                TicketGuid = Guid.NewGuid(),
                Tags = ticketDto.Tags,
                CreatedAt = DateTime.UtcNow
            };

            bool isCreated = await _omniRepository.TicketRepository.CreateTicket(ticket);

            if (isCreated)
            {
                EventsLog eventLog = new EventsLog()
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventTypeId = (int)GeneralEnums.EventType.TicketCreated,
                    EventDescription = "Ticket is created.",
                    TicketGuid = ticket.TicketGuid.ToString(),
                    WorkspaceGuid = workspaceGuid,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventLog);
            }
            return isCreated;
        }
         
        public async Task<List<string>> GetTicketStep(string ticketGuid)
        {
            var result = await _omniRepository.TicketRepository.GetTicketSteps(ticketGuid);
            if (string.IsNullOrEmpty(result))
            {
                return new List<string>();
            }
            return result.Split(",").ToList();
        }

        public async Task<bool> UpdateTicketStatus(string ticketGuid, TicketEnums.TicketStatus status)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTicketPriority(string ticketGuid, TicketEnums.TicketPriority priority)
        {
            bool isUpdated = await _omniRepository.TicketRepository.UpdateTicketPriority(ticketGuid, (int)priority);
            if (isUpdated)
            {
                EventsLog eventsLogs = new EventsLog
                {
                    EventDescription = "Ticket.Updated",
                    CreatedAt = DateTime.UtcNow,
                    TicketGuid = ticketGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                    EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                    Metadata = $"Ticket priority updated to {priority}",
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLogs);
            }
            return isUpdated;
        }

        public async Task<bool> AssignTicketToUser(string ticketGuid, string userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTicketSteps(string ticketGuid, List<string> steps)
        {
            string stepsString = string.Join(",", steps);
            bool isUpdated = await _omniRepository.TicketRepository.UpdateTicketSteps(ticketGuid, stepsString);
            if (isUpdated)
            {
                EventsLog eventsLogs = new EventsLog
                {
                    EventDescription = "Ticket.Updated",
                    CreatedAt = DateTime.UtcNow,
                    TicketGuid = ticketGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                    EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                    Metadata = $"Updated the ticket steps {ticketGuid}",
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLogs);
            }
            return isUpdated;
        }

        public async Task<List<TicketDto>> GetUserTickets(string workspaceGuid, string userGuid)
        {
            var userTicketsResponse = await _omniRepository.TicketRepository.GetUserTickets(workspaceGuid, userGuid);
            if (userTicketsResponse == null)
            {
                return new List<TicketDto>();
            }
            List<TicketDto> result = new List<TicketDto>();
            foreach (var ticket in userTicketsResponse)
            {
                result.Add(new TicketDto
                {
                    Points = ticket.Points,
                    Priority = (TicketEnums.TicketPriority)ticket.PriorityId,
                    Tags = ticket.Tags,
                    TicketId = ticket.TicketId,
                    Title = ticket.Title,
                    StartDate = ticket.StartDate,
                    EndDate = ticket.EndDate,
                    Description = ticket.Description,
                    TicketGuid = ticket.TicketGuid,   
                    ReportedBy = ticket.ReportedBy,
                    AssignedByName = ticket.AssignedByUser?.DisplayName,
                    SprintName = ticket.Sprint?.Title,
                    ProjectName = ticket.Project?.ProjectName,
                    Status = (TicketEnums.TicketStatus)ticket.StatusId,
                    TypeId = (TicketEnums.TicketType)ticket.TypeId,
                }
                );
            }
            return result;
        }

        public async Task<List<TicketDropdownModel>> GetTicketsBySprintId(int sprintId)
        {

            if (sprintId == 0)
            {
                return null;
            }
            var result = await _omniRepository.TicketRepository.GetTicketsBySprintId(sprintId);
            return result;
        }
        
        public async Task<List<TicketDto>> GetSprintTickets(string sprintId)
        {
            var tickets = await _omniRepository.TicketRepository.GetSprintTickets(sprintId);
            List<TicketDto> ticketDto = new List<TicketDto>();
            foreach (var ticket in tickets)
            {
                ticketDto.Add(new TicketDto
                {
                    Description = ticket.Description,
                    TicketId = ticket.TicketId,
                    ProjectId = ticket.ProjectId,
                    ProjectName = ticket.Project?.ProjectName,
                    Status = (TicketEnums.TicketStatus)ticket.StatusId,
                    CreatedAt = ticket.CreatedAt,
                    Tags = ticket.Tags,
                    Title = ticket.Title,
                    Points = ticket.Points,
                    TicketGuid = ticket.TicketGuid,
                    AssignedByName = ticket.AssignedByUser?.DisplayName,
                    AssignedToName = ticket.AssignedToUser?.DisplayName,
                    Priority = (TicketEnums.TicketPriority)ticket.PriorityId,
                    SprintId = ticket.SprintId,
                    SprintName = ticket.Sprint?.Title,
                    TypeId = (TicketEnums.TicketType)ticket.TypeId,
                    ReportedBy = ticket.ReportedBy,
                    Steps = ticket.Steps,
                    UpdatedAt = ticket.UpdatedAt
                });
            }
            return ticketDto;
        }
        public async Task<List<TaskDto>> GetTicketTasks(string ticketGuid)
        {
            var tasks = await _omniRepository.TicketRepository.GetTicketTask(ticketGuid);
            List<TaskDto> taskDto = new List<TaskDto>();
            foreach (var task in tasks)
            {
                taskDto.Add(new TaskDto
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
            return taskDto;
        }

        public async Task<bool> UpdateTicketStatus(string workspaceGuid, int ticketId, int status)
        {
            TicketEnums.TicketStatus ticketStatus;
            
            Ticket updatedTicket = await _omniRepository.TicketRepository.UpdateTicketStatus(workspaceGuid, ticketId, status);
            if(updatedTicket == null)
            {
                return false;
            }
            string displayName = updatedTicket.AssignedToUser?.DisplayName;

            if (updatedTicket!=null)
            {
                // Make the event model
                EventsLog eventLogs = new EventsLog
                {
                    TicketGuid = updatedTicket.TicketGuid.ToString(),
                    EventDescription = "Ticket is resolved by user",
                    //UserId = updatedTicket.AssignedTo,
                    SprintGuid = null,
                    WorkspaceGuid = workspaceGuid,
                    EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                    CreatedAt = DateTime.UtcNow,
                };

                EventsLogDto eventsLogDto = new EventsLogDto
                {
                    TicketGuid = updatedTicket.TicketGuid.ToString(),
                    EventDescription = "Ticket is resolved by user",
                    SprintGuid = null,
                    WorkspaceGuid = workspaceGuid,
                    EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                    CreatedAt = DateTime.UtcNow,
                };

                // Publish inside the rabbitmq message broker.
                string json = System.Text.Json.JsonSerializer.Serialize(eventLogs);
                byte[] body = Encoding.UTF8.GetBytes(json);
                await _eventPublisher.PublishAsync(eventsLogDto, 0);

                // Save the event log to database
            }

            return true;
        }

        public async Task<bool> AddTicketToSprint(string ticketGuid, string sprintId)
        {
            return await _omniRepository.TicketRepository.AddTicketToSprint(ticketGuid, sprintId);
        }
    }
}
