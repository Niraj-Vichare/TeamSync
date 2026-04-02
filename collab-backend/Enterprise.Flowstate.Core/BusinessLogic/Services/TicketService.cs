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
        private readonly IOmniRepository _omniRepository;
        private readonly IEventPublisher _eventPublisher;

        public TicketService(IOmniRepository omniRepository, IEventPublisher eventPublisher)
        {
            _omniRepository = omniRepository;
            _eventPublisher = eventPublisher;
        }

        // ─────────────────────────────────────────────────────────────
        // EDIT
        // FIX: original did `var ticketGuid = Guid.NewGuid()` and then
        // set `TicketGuid = ticketGuid` on the ticket being EDITED.
        // This overwrote the existing ticket's GUID with a brand new one
        // on every edit, breaking all foreign key references in events_logs,
        // task, sprint etc. that pointed to the original GUID.
        //
        // The ticketId parameter IS the existing GUID — we pass it straight
        // to the repository. We do NOT touch TicketGuid on the model.
        // ─────────────────────────────────────────────────────────────
        public async Task<bool> EditTicket(string ticketId, string userId, TicketDto ticketDto)
        {
            Ticket ticket = new Ticket
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
                AssignedTo = ticketDto.AssignedTo,
                Tags = ticketDto.Tags,
                UpdatedAt = DateTime.UtcNow
                // FIX: TicketGuid intentionally NOT set here.
                // The repository uses ticketId (the existing GUID) to locate the record.
            };

            bool isEdited = await _omniRepository.TicketRepository.EditTicket(ticketId, userId, ticket);

            if (isEdited)
            {
                EventsLog eventLog;

                if (ticketDto.Status == TicketEnums.TicketStatus.Closed)
                {
                    eventLog = new EventsLog
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket closed",
                        TicketGuid = ticketId,
                        UserGuid = userId,
                        WorkspaceGuid = ticketDto.WorkspaceGuid,
                        EventGuid = Guid.NewGuid().ToString(),
                    };

                    await _eventPublisher.PublishAsync(new EventsLogDto
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket closed",
                        TicketGuid = ticketId,
                        UserGuid = userId,
                        WorkspaceGuid = ticketDto.WorkspaceGuid,
                        EventGuid = Guid.NewGuid().ToString(),
                    }, 0);
                }
                else
                {
                    eventLog = new EventsLog
                    {
                        EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                        CreatedAt = DateTime.UtcNow,
                        EventDescription = "Ticket updated",
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

        public async Task<bool> DeleteTicket(string ticketId)
        {
            bool isDeleted = await _omniRepository.TicketRepository.DeleteTicket(ticketId);

            if (isDeleted)
            {
                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventTypeId = (int)GeneralEnums.EventType.TicketDeleted,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Ticket deleted",
                    TicketGuid = ticketId,
                    EventGuid = Guid.NewGuid().ToString(),
                });
            }

            return isDeleted;
        }

        public async Task<bool> CreateTicket(string workspaceGuid, TicketDto ticketDto)
        {
            Ticket ticket = new Ticket
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
                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventTypeId = (int)GeneralEnums.EventType.TicketCreated,
                    EventDescription = "Ticket created",
                    TicketGuid = ticket.TicketGuid.ToString(),
                    WorkspaceGuid = workspaceGuid,
                });
            }

            return isCreated;
        }

        public async Task<PaginationResponse<TicketDto>> GetTickets(
            string workspaceGuid, string type, string searchTerm,
            string statusFilter, string priorityFilter, int pageNumber, int pageSize)
        {
            var tickets = await _omniRepository.TicketRepository.GetTicketsAsync(
                workspaceGuid, searchTerm, type, statusFilter, priorityFilter, pageNumber, pageSize);

            if (!tickets.Any())
                return new PaginationResponse<TicketDto>
                {
                    Data = new List<TicketDto>(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = 0
                };

            var result = tickets.Select(t => MapToDto(t)).ToList();

            int totalCount = await _omniRepository.TicketRepository
                .GetTicketsCountAsync(workspaceGuid, type, searchTerm, statusFilter, priorityFilter);

            return new PaginationResponse<TicketDto>
            {
                Data = result,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<TicketDto?> GetTicket(string ticketGuid)
        {
            // Not yet implemented — placeholder for the Ticket View Page feature
            return null;
        }

        public async Task<List<TicketDto>> GetUserTickets(string workspaceGuid, string userGuid)
        {
            var tickets = await _omniRepository.TicketRepository.GetUserTickets(workspaceGuid, userGuid);
            if (tickets == null) return new List<TicketDto>();

            return tickets.Select(t => new TicketDto
            {
                Points = t.Points,
                Priority = (TicketEnums.TicketPriority)t.PriorityId,
                Tags = t.Tags,
                TicketId = t.TicketId,
                Title = t.Title,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Description = t.Description,
                TicketGuid = t.TicketGuid,
                ReportedBy = t.ReportedBy,
                AssignedByName = t.AssignedByUser?.DisplayName,
                SprintName = t.Sprint?.Title,
                ProjectName = t.Project?.ProjectName,
                Status = (TicketEnums.TicketStatus)t.StatusId,
                TypeId = (TicketEnums.TicketType)t.TypeId,
            }).ToList();
        }

        public async Task<List<TicketDto>> GetSprintTickets(string sprintGuid)
        {
            var tickets = await _omniRepository.TicketRepository.GetSprintTickets(sprintGuid);
            return tickets.Select(t => MapToDto(t)).ToList();
        }

        public async Task<List<string>> GetTicketStep(string ticketGuid)
        {
            var result = await _omniRepository.TicketRepository.GetTicketSteps(ticketGuid);
            return string.IsNullOrEmpty(result)
                ? new List<string>()
                : result.Split(",").ToList();
        }

        public async Task<bool> UpdateTicketSteps(string ticketGuid, List<string> steps)
        {
            string stepsString = string.Join(",", steps);
            bool isUpdated = await _omniRepository.TicketRepository.UpdateTicketSteps(ticketGuid, stepsString);

            if (isUpdated)
            {
                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventDescription = "Ticket steps updated",
                    CreatedAt = DateTime.UtcNow,
                    TicketGuid = ticketGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                    EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                });
            }

            return isUpdated;
        }

        public async Task<bool> UpdateTicketPriority(string ticketGuid, TicketEnums.TicketPriority priority)
        {
            bool isUpdated = await _omniRepository.TicketRepository.UpdateTicketPriority(ticketGuid, (int)priority);

            if (isUpdated)
            {
                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventDescription = $"Ticket priority updated to {priority}",
                    CreatedAt = DateTime.UtcNow,
                    TicketGuid = ticketGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                    EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                });
            }

            return isUpdated;
        }

        public async Task<bool> UpdateTicketStatus(string workspaceGuid, int ticketId, int status)
        {
            Ticket? updatedTicket = await _omniRepository.TicketRepository.UpdateTicketStatus(workspaceGuid, ticketId, status);
            if (updatedTicket == null) return false;

            await _eventPublisher.PublishAsync(new EventsLogDto
            {
                TicketGuid = updatedTicket.TicketGuid.ToString(),
                EventDescription = "Ticket status updated",
                WorkspaceGuid = workspaceGuid,
                EventTypeId = (int)GeneralEnums.EventType.TicketCompleted,
                CreatedAt = DateTime.UtcNow,
                EventGuid = Guid.NewGuid().ToString(),
            }, 0);

            return true;
        }

        public async Task<bool> UpdateTicketStatus(string ticketGuid, TicketEnums.TicketStatus status)
        {
            // Overload used by the Ticket View Page feature (Feature 1) for close requests
            throw new NotImplementedException("Use UpdateTicketStatus(workspaceGuid, ticketId, status) instead.");
        }

        public async Task<bool> AssignTicketToUser(string ticketGuid, string userId)
        {
            // Placeholder — Notification Feature (Feature 2) will hook into this
            throw new NotImplementedException();
        }

        public async Task<bool> AddTicketToSprint(string ticketGuid, string sprintId)
            => await _omniRepository.TicketRepository.AddTicketToSprint(ticketGuid, sprintId);

        public async Task<List<TicketDropdownModel>> GetTicketsBySprintId(int sprintId)
        {
            if (sprintId == 0) return new List<TicketDropdownModel>();
            return await _omniRepository.TicketRepository.GetTicketsBySprintId(sprintId);
        }

        public async Task<TicketDetailDto?> GetTicketDetail(string ticketGuid, string userId)
        {
            var ticket = await _omniRepository.TicketRepository.GetTicket(ticketGuid);
            if (ticket == null) return null;

            var comments = await _omniRepository.TicketRepository.GetTicketComments(ticketGuid);
            bool closeRequested = await _omniRepository.TicketRepository.IsCloseRequested(ticketGuid);

            var detail = new TicketDetailDto
            {
                TicketId = ticket.TicketId,
                TicketGuid = ticket.TicketGuid,
                Title = ticket.Title,
                Description = ticket.Description,
                Tags = ticket.Tags,
                Priority = (TicketEnums.TicketPriority)(ticket.PriorityId ?? 0),
                Status = (TicketEnums.TicketStatus)(ticket.StatusId ?? 0),
                ProjectId = ticket.ProjectId,
                ProjectName = ticket.Project?.ProjectName,
                SprintId = ticket.SprintId,
                SprintName = ticket.Sprint?.Title,
                Points = ticket.Points,
                Steps = ticket.Steps,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                StartDate = ticket.StartDate,
                EndDate = ticket.EndDate,
                ReportedBy = ticket.ReportedBy,
                ReportedByName = ticket.AssignedByUser?.DisplayName,
                ReportedByGuid = ticket.AssignedByUser?.Guid?.ToString(),
                AssignedTo = ticket.AssignedTo,
                AssignedToName = ticket.AssignedToUser?.DisplayName,
                AssignedToGuid = ticket.AssignedToUser?.Guid?.ToString(),
                AssignedToAvatarUrl = ticket.AssignedToUser?.ProfileImageUrl,
                TypeId = (TicketEnums.TicketType)(ticket.TypeId ?? 0),
                CloseRequested = closeRequested,
                StepsList = string.IsNullOrEmpty(ticket.Steps)
                                        ? new List<string>()
                                        : ticket.Steps.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                Comments = comments.Select(c => new TicketCommentDto
                {
                    Id = c.Id,
                    CommentText = c.CommentText,
                    AuthorGuid = c.AuthorGuid,
                    AuthorName = c.AuthorName,
                    AuthorAvatarUrl = c.AuthorAvatarUrl,
                    CreatedAt = c.CreatedAt,
                    IsCurrentUser = c.AuthorGuid == userId,
                    Attachments = c.Attachments,
                }).ToList()
            };

            return detail;
        }

        public async Task<bool> CanUserComment(string workspaceGuid,string ticketGuid, string userId)
        {
            // Check if assignee
            if (await IsAssignedUser(ticketGuid, userId)) return true;

            // Check role via cache/DB
            var role = await _omniRepository.ProfileRepository.GetUserRole(userId, workspaceGuid);
            return role >= 1 && role <= 3;  // Owner=1, Admin=2, Manager=3
        }

        public async Task<bool> IsAssignedUser(string ticketGuid, string userId)
        {
            return await _omniRepository.TicketRepository.IsAssignedUser(ticketGuid, userId);
        }

        public async Task<bool> AddComment(string ticketGuid, string userId, AddCommentRequest request)
        {
            bool saved = await _omniRepository.TicketRepository.AddComment(ticketGuid, userId, request);

            if (saved)
            {
                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventTypeId = (int)GeneralEnums.EventType.TicketUpdated,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Comment added to ticket",
                    TicketGuid = ticketGuid,
                    UserGuid = userId,
                    EventGuid = Guid.NewGuid().ToString(),
                });
            }

            return saved;
        }

        public async Task<bool> RequestTicketClose(string ticketGuid, string userId, string reason)
        {
            // Prevent duplicate requests
            bool alreadyRequested = await _omniRepository.TicketRepository.IsCloseRequested(ticketGuid);
            if (alreadyRequested) return false;

            bool logged = await _omniRepository.TicketRepository.LogCloseRequest(ticketGuid, userId, reason);

            if (logged)
            {
                // Publish event so notification system (Feature 2) can pick it up
                await _eventPublisher.PublishAsync(new EventsLogDto
                {
                    EventTypeId = (int)GeneralEnums.EventType.TicketCloseRequested,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = $"Close requested: {reason}",
                    TicketGuid = ticketGuid,
                    UserGuid = userId,
                    EventGuid = Guid.NewGuid().ToString(),
                }, 0);

                await _omniRepository.ProfileRepository.AddEventLog(new EventsLog
                {
                    EventTypeId = (int)GeneralEnums.EventType.TicketCloseRequested,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = $"Closure requested. Reason: {reason}",
                    TicketGuid = ticketGuid,
                    UserGuid = userId,
                    EventGuid = Guid.NewGuid().ToString(),
                });
            }

            return logged;
        }


        public async Task<List<TaskDto>> GetTicketTasks(string ticketGuid)
        {
            var tasks = await _omniRepository.TicketRepository.GetTicketTask(ticketGuid);

            return tasks.Select(task => new TaskDto
            {
                Description = task.Description,
                TicketId = task.TicketId,
                ProjectId = task.ProjectId,
                Project = new ProjectDto { ProjectTitle = task.Project?.ProjectName, ProjectGuid = task.Project?.ProjectGuid },
                Status = (TaskEnums.TaskStatus)task.Status,
                Title = task.Title,
                TaskGuid = task.TaskGuid,
                Priority = (TaskEnums.TaskPriority)task.Priority,
                SprintId = task.SprintId,
                Sprint = new SprintDto
                {
                    // FIX: was task.Title (same copy-paste bug as in TaskService)
                    Title = task.Sprint?.Title,
                    SprintGuid = task.Sprint?.SprintGuid,
                    Status = (SprintEnums.SprintStatus)(task.Sprint?.StatusId ?? 0)
                },
                AssignedBy = task.AssignedBy,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                AssignedByUser = new ProfileDto { Guid = task.AssignedByUser?.Guid, DisplayName = task.AssignedByUser?.DisplayName },
                AssignedTo = task.AssignedTo,
                AssignedToUser = new ProfileDto { Guid = task.AssignedToUser?.Guid, DisplayName = task.AssignedToUser?.DisplayName },
                Ticket = new TicketDto
                {
                    Title = task.Ticket?.Title,
                    TicketGuid = task.Ticket?.TicketGuid,
                    Status = (TicketEnums.TicketStatus)(task.Ticket?.StatusId ?? 0),
                    Priority = (TicketEnums.TicketPriority)(task.Ticket?.PriorityId ?? 0),
                    TypeId = (TicketEnums.TicketType)(task.Ticket?.TypeId ?? 0)
                }
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────────────────────
        private static TicketDto MapToDto(Ticket t) => new TicketDto
        {
            Description = t.Description,
            TicketId = t.TicketId,
            ProjectId = t.ProjectId,
            ProjectName = t.Project?.ProjectName,
            Status = (TicketEnums.TicketStatus)t.StatusId,
            CreatedAt = t.CreatedAt,
            Tags = t.Tags,
            Title = t.Title,
            Points = t.Points,
            TicketGuid = t.TicketGuid,
            AssignedByName = t.AssignedByUser?.DisplayName,
            AssignedToName = t.AssignedToUser?.DisplayName,
            Priority = (TicketEnums.TicketPriority)t.PriorityId,
            SprintId = t.SprintId,
            SprintName = t.Sprint?.Title,
            TypeId = (TicketEnums.TicketType)t.TypeId,
            ReportedBy = t.ReportedBy,
            Steps = t.Steps,
            UpdatedAt = t.UpdatedAt
        };
    }


}