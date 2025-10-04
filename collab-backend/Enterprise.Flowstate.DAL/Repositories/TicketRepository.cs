using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class TicketRepository: ITicketRepository
    {
        private readonly Supabase.Client _supabaseClient;

        public TicketRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<bool> CreateTicket(Ticket ticket)
        {
            var result = await _supabaseClient.From<Ticket>().Insert(ticket);
            if (result.Models.Any())
            {
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteTicket(string ticketGuid)
        {
            Guid guid = Guid.NewGuid();
            var model = await _supabaseClient.From<Ticket>().Where(ticket => ticket.TicketGuid == guid).Get();
            if (!model.Models.Any())
            {
                return false;
            }
            _ = await _supabaseClient.From<Ticket>().Delete(model.Model);
            return true;
        }

        public async Task<bool> EditTicket(string ticketGuid,string userId,Ticket ticket)
        {
            throw new NotImplementedException();
        }

        public async Task<TicketDetailDto> GetTicket(string ticketGuid)
        {
            throw new NotImplementedException();
        }

        public PaginationResponse<TicketDto> GetTickets(int type, string search)
        {
            throw new NotImplementedException();
        }
    }
}
