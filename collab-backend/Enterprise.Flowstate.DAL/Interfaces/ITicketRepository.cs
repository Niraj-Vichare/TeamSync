using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ITicketRepository
    {
        Task<bool> DeleteTicket(string ticketGuid);
        Task<bool> EditTicket(string ticketGuid,string userId,Ticket ticketDto);
        Task<bool> CreateTicket(Ticket ticketDto);
        Task<Ticket> GetTicket(string ticketGuid);
        Task<int> GetTicketsCountAsync(string workspaceId, string type, string searchTerm, string status, string project);
        Task<List<Ticket>> GetTicketsAsync(string workspaceGuid,string searchTerm,string type,string statusFilter,string priorityFilter,int pageNumber,int pageSize);
        Task<string> GetTicketSteps(string ticketGuid);
        Task<bool> UpdateTicketSteps(string ticketGuid, string steps);
        Task<List<TicketDropdownModel>> GetTicketsBySprintId(int ticketId);
        Task<List<Ticket>> GetUserTickets(string workspaceGuid, string userGuid);
        Task<List<Ticket>> GetSprintTickets(string sprintGuid);
        Task<List<Task>> GetTicketTask(string ticketGuid);
        Task<Ticket?> UpdateTicketStatus(string workspaceGuid, int ticketId, int status);
        Task<bool> UpdateTicketPriority(string ticketGuid, int priority);
        Task<bool> AddTicketToSprint(string ticketGuid, string sprintId);
        Task<bool> IsCloseRequested(string ticketGuid);
        Task<List<TicketCommentDto>> GetTicketComments(string ticketGuid);
        Task<bool> IsAssignedUser(string ticketGuid, string userGuid);
        Task<bool> AddComment(string ticketGuid,string userId,AddCommentRequest commentRequest);
        Task<bool> LogCloseRequest(string workspaceGuid,string ticketGuid,string reason);


    }

}
