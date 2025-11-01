using Enterprise.Flowstate.DAL.DTOs;
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
        Task<List<TicketDropdownModel>> GetTicketsBySprintId(string sprintId);
    }
}
