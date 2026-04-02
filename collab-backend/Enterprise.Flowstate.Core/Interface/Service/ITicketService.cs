using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ITicketService
    {
        Task<bool> CreateTicket(string userId,TicketDto ticketDto);
        Task<bool> DeleteTicket(string ticketId);
        Task<bool> EditTicket(string ticketId,string userId,TicketDto ticketDto);
        Task<PaginationResponse<TicketDto>> GetTickets(string workspaceGuid, string type, string searchTerm, string statusFilter, string priorityFilter, int pageNumber, int pageSize);
        Task<TicketDto> GetTicket(string ticketGuid);
        Task<List<TicketDto>> GetUserTickets(string workspaceGuid, string userGuid);
        Task<List<string>> GetTicketStep(string ticketGuid);
        Task<bool> UpdateTicketSteps(string ticketGuid, List<string> steps);
        Task<List<TicketDropdownModel>> GetTicketsBySprintId(int sprintId);
        Task<List<TaskDto>> GetTicketTasks(string ticketGuid);
        Task<List<TicketDto>> GetSprintTickets(string sprintId);
        Task<bool> UpdateTicketStatus(string workspaceGuid, int ticketId, int status);
        Task<bool> AddTicketToSprint(string ticketGuid, string sprintId);
        Task<bool> RequestTicketClose(string ticketGuid, string userId, string reason);
        Task<bool> AddComment(string ticketGuid, string userId, AddCommentRequest request);
        Task<bool> IsAssignedUser(string ticketGuid, string userId);
        Task<bool> CanUserComment(string workspaceGuid, string ticketGuid, string userId);
        Task<TicketDetailDto?> GetTicketDetail(string ticketGuid, string userId);
        Task<bool> AssignTicketToUser(string ticketGuid, string userId);
        Task<bool> UpdateTicketStatus(string ticketGuid, TicketEnums.TicketStatus status);
        Task<bool> UpdateTicketPriority(string ticketGuid, TicketEnums.TicketPriority priority);
    }

}
