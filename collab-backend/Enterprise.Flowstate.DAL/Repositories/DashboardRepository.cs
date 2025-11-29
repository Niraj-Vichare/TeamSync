using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = Enterprise.Flowstate.DAL.Models.Task;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class DashboardRepository:IDashboardRepository
    {
        public Supabase.Client _supabaseClient;
        public DashboardRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }
        public async Task<List<UserMetric>> GetUserMetric(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null || userResponse?.Models.FirstOrDefault() == null)
                return null;

            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            var today = DateTime.UtcNow;
            var currentWeekStart = today.AddDays(-(int)today.DayOfWeek);
            var previousWeekStart = currentWeekStart.AddDays(-7);
            var previousWeekEnd = currentWeekStart.AddTicks(-1); // up to before this week's start

            // Query both current and previous week
            var userMetricsResponse = await _supabaseClient
                .From<UserMetric>()
                .Where(m => m.WorkspaceId == workspaceId && m.UserId == userId)
                .Where(m => m.CreatedAt >= previousWeekStart && m.CreatedAt <= today)
                .Order(x => x.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            if (userMetricsResponse?.Models?.Any() == true)
            {
                // Optionally, just return the last 2 records (prev + current week)
                return userMetricsResponse.Models
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(2)
                    .ToList();
            }

            return new List<UserMetric>();
        }

        public async Task<DailyLogging> GetTodayLogging(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null || userResponse?.Models.FirstOrDefault() == null)
                return null;

            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            var today = DateTime.UtcNow.Date;

            var logging = await _supabaseClient
                .From<DailyLogging>()
                .Where(d => d.WorkspaceId == workspaceId && d.UserId == userId && d.CheckingDate.Date == today)
                .Get();

            return logging.Models.FirstOrDefault();
            
        }

        public async Task<bool> ClockIn(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null || userResponse?.Models.FirstOrDefault() == null)
                return false;

            var today = DateTime.UtcNow.Date;
            var todayRecord = await GetTodayLogging(workspaceGuid, userGuid);
            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;
            if (todayRecord != null)
            {
                if (todayRecord.CheckIn != default)
                    throw new Exception("Already clocked in");

                todayRecord.CheckIn = TimeOnly.FromDateTime(DateTime.UtcNow);
                await _supabaseClient.From<DailyLogging>().Update(todayRecord);
                return true;
            }

            var record = new DailyLogging
            {
                WorkspaceId = workspaceId,
                UserId = userId,
                CheckingDate = today,
                CheckIn = TimeOnly.FromDateTime(DateTime.UtcNow)
            };

            var result = await _supabaseClient.From<DailyLogging>().Insert(record);
            return result.Models.Any();
        }


        public async Task<bool> ClockOut(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null || userResponse?.Models.FirstOrDefault() == null)
                return false;

            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            var todayRecord = await GetTodayLogging(workspaceGuid, userGuid);
            if (todayRecord == null || todayRecord.CheckIn == null)
                throw new Exception("Cannot clock out before clocking in");

            todayRecord.CheckOut = TimeOnly.FromDateTime(DateTime.UtcNow);
            var result = await _supabaseClient.From<DailyLogging>().Update(todayRecord);
            return result.Models.Any();
        }

        // Need to optmized...
        public async Task<List<UserWorkMetric>> GetUserWorkMetric(string workspaceGuid, string userGuid)
        {
            // Load workspace
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            // Load user
            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (!workspaceResponse.Models.Any() || !userResponse.Models.Any())
                return new List<UserWorkMetric>();

            int workspaceId = workspaceResponse.Models.First().Id;
            int profileId = userResponse.Models.First().Id;

            // Load member record
            var memberResponse = await _supabaseClient
                .From<Members>()
                .Where(m => m.ProfileId == profileId)
                .Get();

            if (!memberResponse.Models.Any())
                return new List<UserWorkMetric>();

            int memberId = memberResponse.Models.First().Id;

            // Load mapping of projects under workspace
            var mappingResult = await _supabaseClient
                .From<ProjectWorkspaceMapping>()
                .Where(m => m.WorkspaceId == workspaceId)
                .Get();

            var mappedProjects = mappingResult.Models.ToList();

            // Load teams where user is a member
            var teamResponse = await _supabaseClient
                .From<TeamMemberMapping>()
                .Where(t => t.MemberId == memberId)
                .Get();

            var userTeams = teamResponse.Models.Select(t => t.TeamId).ToList();

            List<UserWorkMetric> metrics = new List<UserWorkMetric>();

            foreach (var map in mappedProjects)
            {
                int projectId = map.ProjectId;

                // 1️⃣ Tickets
                var tickets = await _supabaseClient
                    .From<Ticket>()
                    .Where(t => t.AssignedTo == profileId)
                    .Where(t => t.ProjectId == projectId)
                    .Get();

                // 2️⃣ Tasks
                var tasks = await _supabaseClient
                    .From<Task>()
                    .Where(t => t.AssignedTo == profileId)
                    .Where(t => t.ProjectId == projectId)
                    .Get();

                // 3️⃣ Sprints — Fix: IN query
                var sprintQuery = _supabaseClient
                    .From<Sprint>()
                    .Where(s => s.ProjectId == projectId);

                if (userTeams.Any())
                {
                    string teamIdList = string.Join(",", userTeams);
                    sprintQuery = sprintQuery.Filter("working_team_id",Supabase.Postgrest.Constants.Operator.In, teamIdList);
                }

                var sprints = await sprintQuery.Get();

                // 4️⃣ Project object loaded?
                // If not auto-joined, fetch manually
                var project = map.Project ?? (await _supabaseClient
                    .From<Project>()
                    .Where(p => p.ProjectId == projectId)
                    .Get()).Models.FirstOrDefault();

                metrics.Add(new UserWorkMetric
                {
                    ProjectId = projectId,
                    ProjectName = project?.ProjectName ?? "Unknown",
                    NumberOfTicketsAssigned = tickets.Models.Count,
                    NumberOfTasks = tasks.Models.Count,
                    NumberOfSprintIncluded = sprints.Models.Count
                });
            }

            return metrics;
        }

        public async Task<OrganizationMetric> GetOrganizationMetric(string workspaceGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            if (workspaceResponse != null)
            {
                int workspaceId = workspaceResponse.Models.FirstOrDefault().Id;
                var organizationMetric = await _supabaseClient.From<OrganizationMetric>().Where(userMetric => userMetric.WorkspaceId == workspaceId).Get();
                if (organizationMetric != null)
                {
                    return organizationMetric.Models.FirstOrDefault();
                }
            }
            return null;
        }

        public async Task<List<DailyLogging>> GetWeeklyDailyLoggingMetrics(string workspaceGuid,string userGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(w => w.WorkspaceGuid == workspaceGuid).Get();
            var userResponse = await _supabaseClient.From<Profile>().Where(u => u.Guid == userGuid).Get();
            if(workspaceResponse != null && userResponse != null)
            {
                int workspaceId = workspaceResponse.Models.FirstOrDefault().Id;
                int userId = userResponse.Models.FirstOrDefault().Id;

                DateTime sevenDaysAgo = DateTime.Today.AddDays(-6); // Includes today

                var dailyLoggingMetric = await _supabaseClient.From<DailyLogging>().Where(dailyLogging => dailyLogging.WorkspaceId == workspaceId && dailyLogging.UserId == userId && dailyLogging.CheckingDate >= sevenDaysAgo)
                    .Order(d => d.CheckingDate,Supabase.Postgrest.Constants.Ordering.Ascending)
                    .Get();
                var dailyLogs = dailyLoggingMetric.Models;
                return dailyLogs;
            }
            return new List<DailyLogging>();
        }
    }
}
