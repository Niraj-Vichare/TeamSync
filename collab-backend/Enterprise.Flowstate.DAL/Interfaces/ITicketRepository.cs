using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ITicketRepository
    {
        Task<bool> DeleteTicket(string ticketGuid);
        Task<bool> EditTicket(string ticketGuid,string userId,Ticket ticketDto);
        Task<bool> CreateTicket(Ticket ticketDto);
        Task<TicketDetailDto> GetTicket(string ticketGuid);
        Task<int> GetTicketsCountAsync(string workspaceId, string type, string searchTerm, string status, string project);
        Task<List<Ticket>> GetTicketsAsync(string workspaceGuid,string searchTerm,string type,string statusFilter,string priorityFilter,int pageNumber,int pageSize);
        Task<string> GetTicketSteps(string ticketGuid);
        Task<bool> UpdateTicketSteps(string ticketGuid, string steps);
        Task<List<TicketDropdownModel>> GetTicketsBySprintId(int ticketId);
    }

}
