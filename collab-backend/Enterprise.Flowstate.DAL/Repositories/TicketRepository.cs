using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Models.Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

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

        public async Task<bool> IsCloseRequested(string ticketGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false;
            var result = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Get();
            if (result.Models.Any())
            {
                var ticket = result.Models.FirstOrDefault();    
                if (ticket.StatusId == (int)TicketEnums.TicketStatus.Closed)
                {
                    return true;
                }
                return false;
         
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
            existingTicket.StatusId = ticket.StatusId;

            // Perform the update
            var updateResponse = await _supabaseClient
                .From<Ticket>()
                .Where(t => t.TicketGuid == guid)
                .Update(existingTicket);

            // Return true if the update succeeded
            return updateResponse.Models.Any();
        }

        public async Task<List<TicketDropdownModel>> GetTicketsBySprintId(int sprintId)
        {
            var ticketResponse = await _supabaseClient.From<Ticket>().Where(t => t.SprintId == sprintId).Get();
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
        public async Task<Ticket> GetTicket(int? ticketId)
        {
            if(ticketId == null || ticketId == 0)
            {
                return null;
            }
            var ticketReponse = await _supabaseClient.From<Ticket>().Where(t => t.TicketId == ticketId).Get();
            return ticketReponse.Models.FirstOrDefault();
        }
        public async Task<List<Ticket>> GetUserTickets(string workspaceGuid, string userGuid)
        {
            var userResponse = await _supabaseClient.From<Profile>().Where(user => user.Guid == userGuid).Get();
            if (userResponse == null)
                return new List<Ticket>();
            var user = userResponse.Models.FirstOrDefault();
            int userId = user.Id;
            var ticketResponse = await _supabaseClient.From<Ticket>().Select("*,project:project_id(project_name),sprint:sprint_id(title),assignedByUser:profile!reported_by(display_name),assignedToUser:profile!assigned_to(display_name)").Where(ticket => ticket.AssignedTo == userId).Get();
            if (ticketResponse == null)
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


        public async Task<List<Ticket>> GetSprintTickets(string sprintGuid)
        {
            var sprint = await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (!sprint.Models.Any())
            {
                return null;
            }
            var sprintId = sprint.Models.FirstOrDefault().SprintId;
            var ticketResponse = await _supabaseClient.From<Ticket>().Select("*,project:project_id(project_name),sprint:sprint_id(title),assignedByUser:profile!reported_by(display_name,avatar_url),assignedToUser:profile!assigned_to(display_name,avatar_url)").Where(ticket => ticket.SprintId == sprintId).Get();
            return ticketResponse.Models.ToList();

        }

        public async Task<List<Models.Task>> GetTicketTask(string ticketGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return null; // invalid ticketGuid
            var ticketResponse = await _supabaseClient.From<Ticket>().Where(task => task.TicketGuid == guid).Get();
            if (!ticketResponse.Models.Any())
            {
                return null;
            }
            var ticketId = ticketResponse.Models.FirstOrDefault().TicketId;
            var tasks = await _supabaseClient.From<Task>().Where(task => task.TaskId == ticketId).Get();
            return tasks.Models.ToList();

        }

        public async Task<Ticket> GetTicket(string ticketGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return null;

            var result = await _supabaseClient
                .From<Ticket>()
                .Select(@"
            *,
            project:project_id(project_name),
            sprint:sprint_id(title),
            assignedByUser:profile!reported_by(display_name,email,guid),
            assignedToUser:profile!assigned_to(display_name,email,guid)
        ")
                .Where(t => t.TicketGuid == guid)
                .Single();

            return result;
        }

        public async Task<Ticket?> UpdateTicketStatus(string workspaceGuid, int ticketId, int status)
        {
            var workspaceResult = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();
            if (workspaceResult == null)
            {
                return null;
            }
            var workspace = workspaceResult.Models.FirstOrDefault();
            var result = await _supabaseClient.From<Ticket>().Where(t => t.TicketId == ticketId).Update(new Ticket { StatusId = status });
            return result.Models.FirstOrDefault();
        }

        public async Task<bool> UpdateTicketPriority(string ticketGuid, int priority)
        {
            Enum.TryParse(ticketGuid, out Guid guid);
            var ticket = await _supabaseClient.From<Ticket>().Where(tic => tic.TicketGuid == guid).Limit(1).Get();
            if(ticket == null)
            {
                return false;
            }
            int ticketId = ticket.Models.First().TicketId;
            var result = await _supabaseClient.From<Ticket>().Where(t => t.TicketId == ticketId).Update(new Ticket { PriorityId = priority });
            return true;
        }

        public async Task<bool> AddTicketToSprint(string ticketGuid, string sprintId)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false; // invalid ticketGuid

            var sprintResponse = await _supabaseClient.From<Sprint>().Where(s => s.SprintGuid == sprintId).Get();
            if (!sprintResponse.Models.Any())
            {
                return false; // sprint not found
            }
            var sprint = sprintResponse.Models.FirstOrDefault();

            var ticketResponse = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Get();
            if (!ticketResponse.Models.Any())
            {
                return false; // ticket not found
            }
            var ticket = ticketResponse.Models.FirstOrDefault();

            ticket.SprintId = sprint.SprintId;

            var updateResponse = await _supabaseClient.From<Ticket>()
                .Select("*,project:project_id(project_name),sprint:sprint_id(title),assignedByUser:profile!reported_by(display_name),assignedToUser:profile!assigned_to(display_name)")
                .Where(t => t.TicketGuid == guid).Update(ticket);

            return updateResponse.Models.Any();
        }

        public async Task<List<TicketCommentDto>> GetTicketComments(string ticketGuid)
        {
            List<TicketCommentDto> ticketCommentDtos = new List<TicketCommentDto>();
            if (!Guid.TryParse(ticketGuid, out var guid))
                return null; // invalid ticketGuid
            var result = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Get();
            int ticketId = result.Models.FirstOrDefault().TicketId;
            if(ticketId == 0)
            {
                return null;
            }
            var comments = await _supabaseClient.From<TicketComment>().Where(c => c.TicketId == ticketId).Select("*,profile:commented_by(id,display_name,avatar_url,guid,email)").Get();
            for(int i = 0; i < comments.Models.Count; i++)
            {
                TicketCommentDto comment = new TicketCommentDto()
                {
                    AuthorAvatarUrl = comments.Models[i].Author?.ProfileImageUrl,
                    AuthorName = comments.Models[i].Author?.DisplayName,
                    AuthorGuid = comments.Models[i].Author?.Guid.ToString(),
                    CommentText = comments.Models[i].CommentText,
                    CreatedAt = comments.Models[i].CreateDate ?? DateTime.UtcNow,
                    Id = (int)comments.Models[i].Id,  
                };
                ticketCommentDtos.Add(comment);
            }
            return ticketCommentDtos;
        }

        public async Task<int> GetSprintTicketsCount(List<int> sprintIds)
        {
            var response = await _supabaseClient.From<Ticket>()
                .Where(t => t.SprintId != null && sprintIds.Contains(t.SprintId.Value)).Get();
            return response.Models.Count;
        }

        public async Task<bool> IsAssignedUser(string ticketGuid, string userGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false;
            var result = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid ==guid).Get();
            int userId = result.Models.FirstOrDefault().AssignedTo ?? 0;
            var userResult = await _supabaseClient.From<Profile>().Where(p => p.Guid == userGuid).Get();
            int assignedUserId = userResult.Models.FirstOrDefault().Id;
            return userId == assignedUserId;
        }
        public async Task<bool> AddComment(string ticketGuid, string userId, AddCommentRequest commentRequest)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false;
            var ticketResult = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid ==guid).Get();
            if (!ticketResult.Models.Any())
            {
                return false; // ticket not found
            }
            var ticket = ticketResult.Models.FirstOrDefault();

            var userResult = await _supabaseClient.From<Profile>().Where(p => p.Guid == userId).Get();
            if (!userResult.Models.Any())
            {
                return false; // user not found
            }
            var user = userResult.Models.FirstOrDefault();

            TicketComment newComment = new TicketComment
            {
                TicketId = ticket.TicketId,
                AuthorId = user.Id,
                CommentText = commentRequest.CommentText,
                Media = null,
                CreateDate = DateTime.UtcNow
            };

            var insertResult = await _supabaseClient.From<TicketComment>().Insert(newComment);
            return insertResult.Models.Any();

        }

        public async Task<bool> LogCloseRequest(string workspaceGuid,string ticketGuid,string reason)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false;
            var ticket = await _supabaseClient.From<Ticket>().Where(ticket => ticket.TicketGuid == guid).Get();
            if(!ticket.Models.Any())
            {
                return false; // ticket not found
            }
            var workspace = await _supabaseClient.From<Workspace>().Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            if (!workspace.Models.Any())
            {
                return false; // workspace not found
            }

            var ticketId = ticket.Models.FirstOrDefault().TicketId;
            TicketCloseRequest closeRequest = new TicketCloseRequest
            {
                Reason = reason,
                Status = (int)TicketEnums.TicketCloseRequestStatus.Pending,
                WorkspaceId = workspace.Models.FirstOrDefault().Id,
                RequestedBy = ticket.Models.FirstOrDefault().AssignedTo,
                TicketGuid = Guid.Parse(ticketGuid),
                CreatedAt = DateTime.UtcNow
            };

            await _supabaseClient.From<TicketCloseRequest>().Insert(closeRequest);
            return true;
        }

        public async Task<bool> AssignedTicketToUser(string ticketGuid, string userGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var parsedTicketGuid))
                return false;

            var result = await _supabaseClient.From<Ticket>().Where(ticket => ticket.TicketGuid == parsedTicketGuid).Get();
            if (!result.Models.Any())
                return false; // ticket not found
            var ticket = result.Models.FirstOrDefault();

            var user = await _supabaseClient.From<Profile>().Where(pr => pr.Guid == userGuid).Get();
            if(user == null || !user.Models.Any())
                return false; // user not found
            var userId = user.Models.FirstOrDefault().Id;
            ticket.AssignedTo = userId;

            var res = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == parsedTicketGuid).Update(ticket);
            return res.Models.Any();

        }

        public async Task<List<TicketDto>> GetSprintTicketsDtos(List<int> sprintIds)
        {
            if (sprintIds == null || !sprintIds.Any())
            {
                return new List<TicketDto>();
            }

            var response = await _supabaseClient
                .From<Ticket>()
                .Select("ticket_id,title,status,sprint_id,points,type")
                .Filter("sprint_id", Supabase.Postgrest.Constants.Operator.In, sprintIds)
                .Get();

            if (!response.Models.Any())
            {
                return new List<TicketDto>();
            }

            var ticketDtos = response.Models.Select(t => new TicketDto
            {
                TicketId = t.TicketId,
                Title = t.Title,
                Points = t.Points,
                TypeId = (TicketEnums.TicketType)t.TypeId,
                Status = (TicketEnums.TicketStatus)t.StatusId,
                SprintId = t.SprintId
            }).ToList();

            return ticketDtos;
        }

        public async Task<(bool isManaged, int reportedBy)> IsTicketManaged(string ticketGuid, string userGuid, TicketEnums.TicketCloseRequestStatus ticketCloseRequestStatus, string reason)
        {
            if (!Guid.TryParse(ticketGuid, out var TicketGuid))
            {
                return (false, 0);
            }

            var ticketCloseRequestResponse = await _supabaseClient
                .From<TicketCloseRequest>()
                .Where(t => t.TicketGuid == TicketGuid)
                .Get();

            var ticketRequestResponse = ticketCloseRequestResponse.Models.FirstOrDefault();

            if (ticketRequestResponse == null)
            {
                return (false, 0);
            }

            if (ticketCloseRequestStatus == TicketEnums.TicketCloseRequestStatus.Approved)
            {
                var ticketResponse = await _supabaseClient
                    .From<Ticket>()
                    .Where(ti => ti.TicketGuid == TicketGuid)
                    .Get();

                var ticket = ticketResponse.Models.FirstOrDefault();

                if (ticket != null)
                {
                    ticket.StatusId = (int)TicketEnums.TicketStatus.Closed;
                    ticket.EndDate = DateTime.UtcNow;

                    await _supabaseClient.From<Ticket>().Update(ticket);
                }
            }
            var profileResponse = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            int profileId = profileResponse.Models.FirstOrDefault().Id; 

            // Update TicketCloseRequest
            ticketRequestResponse.Status =  (int)ticketCloseRequestStatus;
            ticketRequestResponse.Reason = reason;
            ticketRequestResponse.ReviewedAt =  DateTime.UtcNow;
            ticketRequestResponse.ReviewedBy = profileId;
            ticketRequestResponse.UpdatedAt = DateTime.UtcNow;

            await _supabaseClient
                .From<TicketCloseRequest>()
                .Update(ticketRequestResponse);

            int ticketAssignedTo = (int)ticketRequestResponse.RequestedBy;

            return (true, ticketAssignedTo);
        }
    }
}
