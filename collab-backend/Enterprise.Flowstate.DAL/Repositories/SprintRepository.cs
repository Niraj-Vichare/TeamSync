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
    public class SprintRepository : ISprintRepository
    {
        private Supabase.Client _supabaseClient;
        public SprintRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;

        }

        public async Task<bool> CreateSprint(string userId, Sprint sprint)
        {
            var models = await _supabaseClient.From<Sprint>().Insert(sprint);
            if (models.Models.Any())
            {
                return true;
            }
            return false;
        }


        public async Task<List<Sprint>> GetSprintsAsync(
        string workspaceId,
        string searchTerm,
        string status,
        string project,
        int pageNumber,
        int pageSize)
        {

            // 1️. Get the workspace
            var workspaceResult = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceId)
                .Get();

            var workspace = workspaceResult.Models.FirstOrDefault();
            if (workspace == null)
                return new List<Sprint>(); // return empty if not found

            // 2️. Get project IDs in this workspace
            var projectMappingResult = await _supabaseClient
                .From<ProjectWorkspaceMapping>()
                .Where(pwm => pwm.WorkspaceId == workspace.Id)
                .Select("project_id")
                .Get();

            var projectIds = projectMappingResult.Models.Select(p => p.ProjectId).ToArray();

            if (projectIds.Length == 0)
                return new List<Sprint>(); // no projects in workspace

            // 3️. If user selected a specific project, filter projectIds
            if (!string.IsNullOrEmpty(project))
            {
                projectIds = projectIds.Where(id => id.ToString() == project).ToArray();
                if (projectIds.Length == 0)
                    return new List<Sprint>(); // project not in this workspace
            }

            // 4️. Build the sprint query
            var query = _supabaseClient.From<Sprint>().Filter("project_id", Supabase.Postgrest.Constants.Operator.In, projectIds);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%"); // Supabase ilike for case-insensitive search
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, status);
            }

            if (!string.IsNullOrEmpty(project))
            {
                query = query.Filter("projectId", Supabase.Postgrest.Constants.Operator.Equals, project);
            }

            int start = (pageNumber - 1) * pageSize;
            int end = pageNumber * pageSize - 1;

            var sprintsResult = await query.Range(start, end).Get();

            return sprintsResult.Models;
        }

        public async Task<int> GetSprintsCountAsync(
     string workspaceId,
     string searchTerm,
     string status,
     string project)
        {
            // 1️⃣ Get the workspace
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

            // 3️⃣ If user selected a specific project, filter projectIds
            if (!string.IsNullOrEmpty(project))
            {
                projectIds = projectIds.Where(id => id.ToString() == project).ToArray();
                if (projectIds.Length == 0)
                    return 0; // project not in workspace
            }

            // 4️⃣ Build the sprint query
            var query = _supabaseClient.From<Sprint>()
                .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, projectIds);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Filter("title", Supabase.Postgrest.Constants.Operator.ILike, $"%{searchTerm}%");
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Filter("status", Supabase.Postgrest.Constants.Operator.Equals, status);
            }

            // 5️⃣ Get only IDs to count
            var result = await query.Select("sprint_id").Get();

            return result.Models.Count;
        }


        public async Task<List<SprintDropdownModel>> GetSprintsByProjectId(int projectId)
        {
            
            var sprintsResponse = await _supabaseClient.From<Sprint>().Where(s => s.ProjectId == projectId).Get();
            if(sprintsResponse == null)
            {
                return new List<SprintDropdownModel>();
            }
            var sprintDropdowns = sprintsResponse.Models.Select(s => new SprintDropdownModel
            {
                SprintId = s.SprintId,
                SprintName = s.Title
            }).ToList();
            return sprintDropdowns;
        }

        public async Task<bool> IncludeTicketInSprint(string sprintGuid, string ticketGuid)
        {
            if (!Guid.TryParse(ticketGuid, out var guid))
                return false; // invalid ticketGuid

            var ticketResponse = await _supabaseClient.From<Ticket>().Where(t => t.TicketGuid == guid).Get();
            if (!ticketResponse.Models.Any())
            {
                return false;
            }
            var ticket = ticketResponse.Models.First();

            var sprintResponse = await _supabaseClient.From<Sprint>().Where(s => s.SprintGuid == sprintGuid).Get();
            if (sprintResponse == null)
            {
                return false;
            }
            var sprintId = sprintResponse.Models.First().SprintId;
            ticket.SprintId = sprintId;
            var response = await _supabaseClient.From<Ticket>().Update(ticket);
            return response.Models.Any();
        }

        public async Task<Sprint> GetSprint(string sprintGuid)
        {

            var sprint = await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (sprint.Models.Any())
            {
                return null;
            }
            var sprintResult = sprint.Models.FirstOrDefault();
            return sprintResult;
        }


        public async Task<List<TeamMemberMapping>> GetAssignedTeam(string sprintGuid)
        {
            var sprint = await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (sprint.Models.Any())
            {
                return null;
            }
            var assignedTeam = sprint.Models.FirstOrDefault().WorkingTeamId;
            var teamMemberMappings = await _supabaseClient.From<TeamMemberMapping>().Where(teamMapping=>teamMapping.TeamId == assignedTeam).Get();
            return teamMemberMappings.Models.ToList();
        }

        public async Task<List<EventsLog>> GetSprintActivities(string sprintGuid, int pagNumber, int pageSize)
        {
            var sprint =await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (!sprint.Models.Any())
            {
                return null;
            }
            var sprintId = sprint.Models.FirstOrDefault().SprintId;
            var events =await _supabaseClient.From<EventsLog>().Where(eventLogs=>eventLogs.SprintId == sprintId).Get();
            return events.Models.ToList();
        }

        // When task compelete event happen in the week
        public async Task<List<SprintProgressModel>> GetSprintProgress(string sprintGuid)
        {
            // Get sprint info
            var sprintResult = await _supabaseClient
                .From<Sprint>()
                .Where(s => s.SprintGuid == sprintGuid)
                .Get();

            var sprint = sprintResult.Models.FirstOrDefault();
            if (sprint == null) return new List<SprintProgressModel>();

            var startDate = sprint.StartDate;
            var endDate = sprint.EndDate?.Date ?? DateTime.UtcNow.Date;

            // Get total tickets for this sprint
            var totalTicketsResult = await _supabaseClient
                .From<Ticket>()
                .Where(t => t.SprintId == sprint.SprintId)
                .Get();

            var totalTickets = totalTicketsResult.Models.Count;

            // Get all completed ticket events for this sprint
            var eventLogsResult = await _supabaseClient
                .From<EventsLog>()
                .Where(e => e.SprintId == sprint.SprintId &&
                            e.EventTypeId == 2 && // completed
                            e.CreatedAt >= startDate &&
                            e.CreatedAt <= endDate)
                .Get();

            var completedByDay = eventLogsResult.Models
                .GroupBy(e => e.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(g => g.Date)
                .ToList();

            var progress = new List<SprintProgressModel>();
            int cumulativeCompleted = 0;

            for (var day = startDate; day <= endDate; day = day.Value.AddDays(1))
            {
                var dayData = completedByDay.FirstOrDefault(d => d.Date == day);
                if (dayData != null)
                    cumulativeCompleted += dayData.Count;

                progress.Add(new SprintProgressModel
                {
                    Date = (DateTime)day,
                    Completed = cumulativeCompleted,
                    Pending = totalTickets - cumulativeCompleted
                });
            }

            return progress;
        }

        public async Task<SprintMetric> GetSprintBreakdown(string sprintGuid)
        {
            var sprint = await _supabaseClient.From<Sprint>().Where(sprint => sprint.SprintGuid == sprintGuid).Get();
            if (!sprint.Models.Any())
            {
                return null;
            }
            var sprintId = sprint.Models.FirstOrDefault().SprintId;
            var sprintMetric =await _supabaseClient.From<SprintMetric>().Where(sprint => sprint.SprintId == sprintId).Get();
            return sprintMetric.Models.FirstOrDefault();
        }
    }
}
