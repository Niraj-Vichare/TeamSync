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
        Task<bool> DeleteTicket(Guid ticketGuid);
        Task<bool> EditTicket(string ticketGuid,string userId,Ticket ticketDto);
        Task<bool> CreateTicket(Ticket ticketDto);
        Task<PaginationReponse<Ticket>> GetTickets(int type, string search,int projectId,int sprintId,int pageNumber,int pageSize);
        Task<TicketDetailDto> GetTicket(string ticketGuid);
    }
}
