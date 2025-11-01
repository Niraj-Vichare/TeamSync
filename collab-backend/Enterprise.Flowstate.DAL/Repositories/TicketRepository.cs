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
    public class TicketRepository : ITicketRepository
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
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false; // invalid ticketGuid
            var model = await _supabaseClient.From<Ticket>().Where(ticket => ticket.TicketGuid == guid).Get();
            if (!model.Models.Any())
            {
                return false;
            }
            _ = await _supabaseClient.From<Ticket>().Delete(model.Model);
            return true;
        }

        public async Task<bool> EditTicket(string ticketGuid, string userId, Ticket ticket)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(ticketGuid) || string.IsNullOrWhiteSpace(userId))
                return false;
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false; // invalid ticketGuid

            // Fetch existing ticket
            var existingResponse = await _supabaseClient
                .From<Ticket>()
                .Where(t => t.TicketGuid == guid)
                .Get();

            var existingTicket = existingResponse.Models.FirstOrDefault();

            if (existingTicket == null)
            {
                // No matching ticket found (either wrong ID or unauthorized user)
                return false;
            }

            // Update only the fields you allow to be edited
            existingTicket.Title = ticket.Title;
            existingTicket.Description = ticket.Description;
            existingTicket.Points = ticket.Points;
            existingTicket.SprintId = ticket.SprintId;
            existingTicket.ProjectId = ticket.ProjectId;
            existingTicket.Steps = ticket.Steps;
            existingTicket.UpdatedAt = DateTime.UtcNow;
            existingTicket.PriorityId = ticket.PriorityId;
            existingTicket.ReportedBy = ticket.ReportedBy;
            existingTicket.StatusId = ticket.StatusId;

            // Perform the update
            var updateResponse = await _supabaseClient
                .From<Ticket>()
                .Where(t => t.TicketGuid == guid)
                .Update(existingTicket);

            // Return true if the update succeeded
            return updateResponse.Models.Any();
        }


        public async Task<TicketDetailDto> GetTicket(string ticketGuid)
        {
            throw new NotImplementedException();
        }

        public async Task<List<TicketDropdownModel>> GetTicketsBySprintId(int sprintId)
        {
            var ticketResponse = await _supabaseClient.From<Ticket>().Where(t=> t.SprintId == sprintId).Get();
            if (ticketResponse == null)
            {
                return new List<TicketDropdownModel>();
            }
            var ticketDropdowns = ticketResponse.Models.Select(s => new TicketDropdownModel
            {
                TicketId = s.TicketId,
                TicketName = s.Title
            }).ToList();
            return ticketDropdowns;
        }

        public async Task<List<Ticket>> GetUserTickets(string workspaceGuid, string userGuid)
        {
            var userResponse = await _supabaseClient.From<Profile>().Where(user=>user.Guid == userGuid).Get();
            if (userResponse == null)
                return new List<Ticket>();
            var user = userResponse.Models.FirstOrDefault();
            int userId = user.Id;
            var ticketResponse = await _supabaseClient.From<Ticket>().Where(ticket => ticket.AssignedToUser.Id == userId).Get();
            if(ticketResponse == null)
            {
                return new List<Ticket>();
            }
            return ticketResponse.Models.ToList();
        }

        public async Task<int> GetTicketsCountAsync(string workspaceId, string type, string searchTerm, string status, string priority)
        {
            var workspaceResult = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceId)
                .Get();

            var workspace = workspaceResult.Models.FirstOrDefault();
            if (workspace == null)
                return 0; // no workspace

            // 2️⃣ Get project IDs in this workspace
            var projectMappingResult = await _supabaseClient
                .From<ProjectWorkspaceMapping>()
                .Where(pwm => pwm.WorkspaceId == workspace.Id)
                .Select("project_id")
                .Get();

            var projectIds = projectMappingResult.Models.Select(p => p.ProjectId).ToArray();

            if (projectIds.Length == 0)
                return 0; // no projects in workspace


            // 4️⃣ Build the sprint query
            var query = _supabaseClient.From<Ticket>()
                .Select("*,project:project_id(project_name),sprint:sprint_id(title),profile:reported_by(display_name)")
                .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, projectIds);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%");
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, status);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Filter("type", Supabase.Postgrest.Constants.Operator.Equals, type);
            }
            if (!string.IsNullOrEmpty(priority))
            {
                query = query.Filter("priority", Supabase.Postgrest.Constants.Operator.Like, priority);
            }
            // 5️⃣ Get only IDs to count
            var result = await query.Select("ticket_id").Get();

            return result.Models.Count;
        }

        public async Task<List<Ticket>> GetTicketsAsync(string workspaceGuid, string searchTerm, string type, string statusFilter, string priorityFilter, int pageNumber, int pageSize)
        {
            // 1️. Get the workspace
            var workspaceResult = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var workspace = workspaceResult.Models.FirstOrDefault();
            if (workspace == null)
                return new List<Ticket>(); // return empty if not found

            // 2️. Get project IDs in this workspace
            var projectMappingResult = await _supabaseClient
                .From<ProjectWorkspaceMapping>()
                .Where(pwm => pwm.WorkspaceId == workspace.Id)
                .Select("project_id")
                .Get();

            var projectIds = projectMappingResult.Models.Select(p => p.ProjectId).ToArray();

            if (projectIds.Length == 0)
                return new List<Ticket>(); // no projects in workspace



            // 4️. Build the sprint query
            var query = _supabaseClient.From<Ticket>()

                .Select("*,project:project_id(project_name),sprint:sprint_id(title),assignedByUser:profile!reported_by(display_name),assignedToUser:profile!assigned_to(display_name)")
                .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, projectIds);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%"); // Supabase ilike for case-insensitive search
            }

            if (!string.IsNullOrEmpty(statusFilter))
            {
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, statusFilter);
            }

            if (!string.IsNullOrEmpty(priorityFilter))
            {
                query = query.Filter("priority", Supabase.Postgrest.Constants.Operator.Equals, priorityFilter);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Filter("type", Supabase.Postgrest.Constants.Operator.Equals, type);

            }

            int start = (pageNumber - 1) * pageSize;
            int end = pageNumber * pageSize - 1;

            var ticketsResult = await query.Range(start, end).Get();

            return ticketsResult.Models;
        }

        public async Task<string> GetTicketSteps(string ticketGuid)
        {
            // Parse string to Guid
            if (!Guid.TryParse(ticketGuid, out var guid))
                return ""; // invalid ticketGuid

            // Direct comparison, no ToString()
            var response = await _supabaseClient
                .From<Ticket>()
                .Where(t => t.TicketGuid == guid)
                .Get();

            var ticket = response.Models.FirstOrDefault();
            return ticket?.Steps ?? "";
        }

        public async Task<bool> UpdateTicketSteps(string ticketGuid, string steps)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false; 
            var response = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Get();

            var ticket = response.Models.FirstOrDefault();

            if (ticket == null)
            {
                return false;
            }
            ticket.Steps = steps;
            var updateResponse = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Update(ticket);

            return updateResponse.Models.Any();
        }
    }
}
