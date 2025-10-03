using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TicketService:ITicketService
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
            Ticket ticket = new Ticket();
            bool isEdited = await _omniRepository.TicketRepository.EditTicket(ticketId, userId, ticket);
            return isEdited;
        }

        public async Task<TicketDto> GetTicket(string ticketGuid)
        {
            TicketDetailDto ticketDetail = await _omniRepository.TicketRepository.GetTicket(ticketGuid);
            return ticketDetail;
        }

        public async Task<List<TicketDto>> GetTickets(int ticketType,Dictionary<string,string> parameter, int page, int size)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> CreateTicket(string userId, TicketDto ticketDto)
        {
            Ticket ticket = new Ticket();
            bool isCreated = await _omniRepository.TicketRepository.CreateTicket(ticket);
            return isCreated;
        }
    }
}
