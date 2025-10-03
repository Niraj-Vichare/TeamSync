using Enterprise.Flowstate.DAL.DTOs;
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
        Task<List<TicketDto>> GetTickets(int ticketType,Dictionary<string,string> parameter, int page, int size);

        Task<TicketDto> GetTicket(string ticketGuid);
    }
}
