using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class SprintService:ISprintService
    {
        private IOmniRepository _omniRepository;
        public SprintService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }

        public async Task<bool> CreateSprint(string userId, SprintDto sprintDto)
        {
            Sprint sprint = new Sprint
            {
                CreatedAt = DateTime.UtcNow,
                Title = sprintDto.Title,
                Description = sprintDto.Goal,
                UpdateDate = sprintDto.UpdateDate,
                EndDate = sprintDto.EndDate,
                ProjectId = sprintDto.ProjectId,
                StartDate = sprintDto.StartDate,
                StatusId = (int)sprintDto.Status,
                Tagline = sprintDto.Tagline,
                Tags = sprintDto.Tags,
                SprintGuid = Guid.NewGuid().ToString(),
                WorkingTeamId = sprintDto.TeamModel.TeamId
            };

            var result = await _omniRepository.SprintRepository.CreateSprint(userId, sprint);

            if (result)
            {
                EventsLog eventLog = new EventsLog
                {
                    SprintGuid = sprint.SprintGuid,
                    ProjectGuid = sprint?.Project?.ProjectId.ToString(),
                    EventDescription = "Sprint.Created",
                    CreatedAt = DateTime.UtcNow,
                    EventGuid = Guid.NewGuid().ToString(),
                    UserGuid = userId,
                    EventTypeId = (int)GeneralEnums.EventType.SprintCreated
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventLog);
            }
            return result;
        }
        public async Task<bool> IncludeTicketInSprint(string sprintGuid, string ticketGuid,int teamId)
        {
            bool isIncluded = await _omniRepository.SprintRepository.IncludeTicketInSprint(sprintGuid, ticketGuid,teamId);
            if (isIncluded)
            {
                EventsLog eventsLog = new EventsLog
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Sprint.Ticket.Included",
                    EventGuid= Guid.NewGuid().ToString(),
                    SprintGuid = sprintGuid,
                    TicketGuid = ticketGuid,
                    EventTypeId = (int)GeneralEnums.EventType.TicketIncludeInSprint,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);

            }
            return isIncluded;
        }

        public async Task<List<TeamMemberDropdownDto>> GetSprintTeamMembers(string sprintGuid)
        {
            var result = await _omniRepository.SprintRepository.GetTeamMembers(sprintGuid);
            return result;
        }

        public async Task<List<SprintDropdownModel>> GetSprintsByProjectId(string projectId)
        {
            int projectInt = Convert.ToInt32(projectId);
            if(projectInt == 0)
            {
                return null;
            }
            var result = await _omniRepository.SprintRepository.GetSprintsByProjectId(projectInt);
            return result;
        }
        public async Task<PaginationResponse<SprintDto>> GetSprints(string workspaceGuid,string searchTerm, string statusFilter,string projectFilter, int pageNumber,int pageSize)
        {

            // Call repository with filters and pagination
            var sprints = await _omniRepository.SprintRepository.GetSprintsAsync(workspaceGuid, searchTerm,
                statusFilter,
                projectFilter,
                pageNumber,
                pageSize
            );

            List<SprintDto> result = new List<SprintDto>(); 
            foreach (var sprint in sprints)
            {
                result.Add(new SprintDto
                {
                    EndDate = sprint.EndDate,
                    Goal = sprint.Description,
                    Id = sprint.SprintId,
                    ProjectId = sprint.ProjectId,
                    ProjectName = sprint.Project.ProjectName,
                    StartDate = sprint.StartDate,
                    Tagline = sprint.Tagline,
                    Status = (SprintEnums.SprintStatus)sprint.StatusId,
                    Tags = sprint.Tags,
                    Title = sprint.Title,
                    UpdateDate = sprint.UpdateDate,
                    SprintGuid = sprint.SprintGuid,
                    TeamModel = new TeamDropdownModel
                    {
                        TeamId = sprint.Team.TeamId,
                        TeamName = sprint.Team.TeamName
                    }
                });
            }


            // Prepare pagination response
            var totalCount = await _omniRepository.SprintRepository.GetSprintsCountAsync(workspaceGuid, searchTerm, statusFilter, projectFilter);

            return new PaginationResponse<SprintDto>
            {
                Data = result,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<SprintDto> GetSprint(string workspaceGuid, string sprintGuid)
        {
            var sprint = await _omniRepository.SprintRepository.GetSprint(sprintGuid);
            if (sprint == null)
            {
                return null;
            }
            SprintDto sprintDto = new SprintDto
            {
                EndDate = sprint.EndDate,
                Goal = sprint.Description,
                Id = sprint.SprintId,
                ProjectId = sprint.ProjectId,
                ProjectName = sprint.Project.ProjectName,
                StartDate = sprint.StartDate,
                Tagline = sprint.Tagline,
                Status = (SprintEnums.SprintStatus)sprint.StatusId,
                Tags = sprint.Tags,
                Title = sprint.Title,
                UpdateDate = sprint.UpdateDate,
                SprintGuid = sprint.SprintGuid,
                TeamModel = new TeamDropdownModel
                {
                    TeamId = sprint.Team.TeamId,
                    TeamName = sprint.Team.TeamName
                }
            };
            return sprintDto;
        }

        
        public Task<List<EventsLog>> GetSprintActivities(string sprintGuid, int pagNumber, int pageSize)
        {
            return _omniRepository.SprintRepository.GetSprintActivities(sprintGuid, pagNumber, pageSize);
        }

        public async Task<List<SprintProgressModel>> GetSprintProgress(string sprintGuid)
        {
            var tickets = await _omniRepository.TicketRepository.GetSprintTickets(sprintGuid);
            var sprint = await _omniRepository.SprintRepository.GetSprint(sprintGuid);

            if (tickets == null || sprint == null || !tickets.Any())
            {
                return new List<SprintProgressModel>();
            }

            var totalTickets = tickets.Count;
            var progressList = new List<SprintProgressModel>();

            // Add sprint start date with 0 completed
            progressList.Add(new SprintProgressModel
            {
                Date = sprint.StartDate.Value.Date,
                Completed = 0,
                Pending = totalTickets
            });

            // Group tickets by completion date and order them
            var ticketsByDate = tickets
                .Where(t => t.EndDate.HasValue && t.EndDate.Value >= sprint.StartDate)
                .GroupBy(t => t.EndDate.Value.Date)
                .OrderBy(g => g.Key)
                .ToList();

            int cumulativeCompleted = 0;

            foreach (var group in ticketsByDate)
            {
                cumulativeCompleted += group.Count();

                progressList.Add(new SprintProgressModel
                {
                    Date = group.Key,
                    Completed = cumulativeCompleted,
                    Pending = totalTickets - cumulativeCompleted
                });
            }

            // Add sprint end date if it's not already the last entry
            var lastEntry = progressList.Last();
            if (lastEntry.Date.Date != sprint.EndDate)
            {
                progressList.Add(new SprintProgressModel
                {
                    Date = sprint.EndDate.Value,
                    Completed = cumulativeCompleted,
                    Pending = totalTickets - cumulativeCompleted
                });
            }

            return progressList;
        }

        public async Task<SprintBreakdownModel> GetSprintBreakdown(string sprintGuid)
        {
            var breakDown =await _omniRepository.SprintRepository.GetSprintBreakdown(sprintGuid);
            if(breakDown == null)
            {
                return new SprintBreakdownModel();
            }
            SprintBreakdownModel sprintBreakdown = new SprintBreakdownModel
            {
                TotalTickets = breakDown.TotalTickets,
                SprintVelocity = breakDown.SprintVelocity,
                Effiency = breakDown.SprintEffiency
            };

            return sprintBreakdown;
        }
    }
}
