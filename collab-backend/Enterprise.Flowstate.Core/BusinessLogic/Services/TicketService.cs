using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TicketService : ITicketService
    {
        private IOmniRepository _omniRepository;
        public TicketService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }


        public async Task<bool> DeleteTicket(string ticketId)
        {
            bool isDeleted = await _omniRepository.TicketRepository.DeleteTicket(ticketId);
            return isDeleted;
        }

        public async Task<bool> EditTicket(string ticketId, string userId, TicketDto ticketDto)
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
            bool isEdited = await _omniRepository.TicketRepository.EditTicket(ticketId, userId, ticket);
            return isEdited;
        }

        public async Task<TicketDto> GetTicket(string ticketGuid)
        {
            TicketDetailDto ticketDetail = await _omniRepository.TicketRepository.GetTicket(ticketGuid);
            return ticketDetail;
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
                    AssignedName = ticket.Profile?.DisplayName,
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

        public async Task<bool> CreateTicket(string userId, TicketDto ticketDto)
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
            throw new NotImplementedException();
        }

        public async Task<bool> AssignTicketToUser(string ticketGuid, string userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateTicketSteps(string ticketGuid, List<string> steps)
        {
            string stepsString = string.Join(",", steps);
            bool isUpdated = await _omniRepository.TicketRepository.UpdateTicketSteps(ticketGuid, stepsString);
            return isUpdated;
        }

        public async Task<List<TicketDropdownModel>> GetTicketsBySprintId(string sprintId)
        {
            int sprintInt = Convert.ToInt32(sprintId);
            if (sprintInt == 0)
            {
                return null;
            }
            var result = await _omniRepository.TicketRepository.GetTicketsBySprintId(sprintInt);
            return result;
        }
    }
}
