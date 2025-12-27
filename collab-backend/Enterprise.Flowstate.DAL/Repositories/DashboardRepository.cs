using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Newtonsoft.Json;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;
using static Supabase.Postgrest.Constants;
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
        public async Task<List<WeeklyUserStats>> GetUserMetric(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null ||
                userResponse?.Models.FirstOrDefault() == null)
                return new List<WeeklyUserStats>(); // Return empty list, not null

            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            var (previousStartDate, previousEndDate) = PeriodHelper.GetPreviousWeekPeriod();
            var (currentStartDate, currentEndDate) = PeriodHelper.GetCurrentWeekPeriod();

            // Query both current and previous week - FIXED FILTER SYNTAX
            var userMetricsResponse = await _supabaseClient
                .From<WeeklyUserStats>()
                .Where(m => m.WorkspaceId == workspaceId && m.UserId == userId)
                .Filter("start_period", Operator.GreaterThanOrEqual, previousStartDate.ToString("yyyy-MM-dd"))
                .Filter("start_period", Operator.LessThanOrEqual, currentStartDate.ToString("yyyy-MM-dd"))
                .Get();

            if (userMetricsResponse?.Models.Count > 0)
            {
                // Return sorted by start_period to ensure correct order
                return userMetricsResponse.Models
                    .OrderBy(m => m.StartPeriod) // Order by period, not CreatedAt
                    .ToList();
            }

            return new List<WeeklyUserStats>();
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

            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");

            var logging = await _supabaseClient.From<DailyLogging>()
                                .Where(d => d.WorkspaceId == workspaceId && d.UserId == userId)
                                .Filter("checking_date", Operator.Equals, today)
                                .Get();

            return logging.Models.FirstOrDefault();

        }

        public async Task<ClockStatusDto> GetCurrentStatus(string workspaceGuid, string userGuid)
        {
            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (userResponse?.Models.FirstOrDefault() == null)
            {
                return new ClockStatusDto
                {
                    IsClockedIn = false,
                    ElapsedSeconds = 0,
                    AutoCheckoutCount = 0,
                    IsValidDay = true,
                    RemainingWarnings = FlowStateConstants.MAX_AUTO_CLOCKOUTS,
                };
            }

            int userId = userResponse.Models.First().Id;
            var todayRecord = await GetTodayLogging(workspaceGuid, userGuid);

            if (todayRecord == null || todayRecord.CheckIn == null)
            {
                return new ClockStatusDto
                {
                    IsClockedIn = false,
                    ElapsedSeconds = 0,
                    AutoCheckoutCount = 0,
                    IsValidDay = true,
                    RemainingWarnings = FlowStateConstants.MAX_AUTO_CLOCKOUTS
                };
            }

            if (todayRecord.CheckOut != null)
            {
                // Already clocked out
                var totalSeconds = (int)(todayRecord.CheckOut.Value - todayRecord.CheckIn.Value).TotalSeconds;
                return new ClockStatusDto
                {
                    IsClockedIn = false,
                    ElapsedSeconds = totalSeconds,
                    CheckInTime = todayRecord.CheckIn,
                    CheckOutTime = todayRecord.CheckOut,
                    AutoCheckoutCount = todayRecord.AutoCheckout,
                    IsValidDay = todayRecord.IsValidDay,
                    RemainingWarnings = Math.Max(0, FlowStateConstants.MAX_AUTO_CLOCKOUTS - todayRecord.AutoCheckout),
                };
            }

            // Currently clocked in
            var elapsed = (int)(DateTime.UtcNow - todayRecord.CheckIn.Value).TotalSeconds;
            return new ClockStatusDto
            {
                IsClockedIn = true,
                ElapsedSeconds = elapsed,
                CheckInTime = todayRecord.CheckIn,
                AutoCheckoutCount = todayRecord.AutoCheckout,
                IsValidDay = todayRecord.IsValidDay,
                RemainingWarnings = Math.Max(0, FlowStateConstants.MAX_AUTO_CLOCKOUTS - todayRecord.AutoCheckout),
            };
        }

        public async Task<ClockActionResult> ClockIn(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null ||
                userResponse?.Models.FirstOrDefault() == null)
                return ClockActionResult.InvalidWorkspaceOrUser;

            var today = DateTime.UtcNow.Date;
            var todayRecord = await GetTodayLogging(workspaceGuid, userGuid);
            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            if (todayRecord == null)
            {
                todayRecord = new DailyLogging
                {
                    WorkspaceId = workspaceId,
                    UserId = userId,
                    CheckingDate = today,
                    CheckIn = DateTime.UtcNow,
                    AutoCheckout = 0,
                    IsValidDay = true
                };
                await _supabaseClient.From<DailyLogging>().Insert(todayRecord);
                return ClockActionResult.Success;
            }

            // Already clocked in
            if (todayRecord.CheckIn != null && todayRecord.CheckOut == null)
                return ClockActionResult.AlreadyClockedIn;

            // Already clocked out
            if (todayRecord.CheckOut != null)
                return ClockActionResult.AlreadyClockedOut;

            // Update existing record
            todayRecord.CheckIn = DateTime.UtcNow;
            await _supabaseClient.From<DailyLogging>().Update(todayRecord);

            return ClockActionResult.Success;
        }




        public async Task<ClockActionResult> ClockOut(string workspaceGuid, string userGuid, bool isAutomatic)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            if (workspaceResponse?.Models.FirstOrDefault() == null ||
                userResponse?.Models.FirstOrDefault() == null)
                return ClockActionResult.InvalidWorkspaceOrUser;

            var todayRecord = await GetTodayLogging(workspaceGuid, userGuid);

            if (todayRecord == null || todayRecord.CheckIn == null)
                return ClockActionResult.NotClockedIn;

            if (todayRecord.CheckOut != null)
                return ClockActionResult.AlreadyClockedOut;

            todayRecord.CheckOut = DateTime.UtcNow;
            if (isAutomatic)
                todayRecord.AutoCheckout++;

            await _supabaseClient.From<DailyLogging>().Update(todayRecord);
            return ClockActionResult.Success;
        }



        public async Task<List<UserWorkMetric>> GetUserWorkMetric(string workspaceGuid, string userGuid)
        {
            var userResponse = await _supabaseClient.From<Profile>().Where(profile => profile.Guid == userGuid).Get();
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if (userResponse == null || !userResponse.Models.Any())
            {
                return new List<UserWorkMetric>();
            }
            int workspaceId = workspaceResponse.Models.FirstOrDefault().Id;
            int userId = userResponse.Models.FirstOrDefault().Id;
            var result = await _supabaseClient.Rpc("get_user_work_metrics", new Dictionary<string, object?>
                    {
                { "p_user_id", userId },
                { "p_workspace_id", workspaceId }
            });
            var metrics = JsonConvert.DeserializeObject<List<UserWorkMetric>>(result.Content);
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

        public async Task<List<DailyLogging>> GetWeeklyDailyLoggingMetrics(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(u => u.Guid == userGuid)
                .Get();

            var workspace = workspaceResponse?.Models?.FirstOrDefault();
            var user = userResponse?.Models?.FirstOrDefault();

            if (workspace == null || user == null) return new List<DailyLogging>();

            int workspaceId = workspace.Id;
            int userId = user.Id;

            // Get data for the current week (Sunday to Saturday)
            DateTime today = DateTime.UtcNow.Date;
            int daysFromSunday = (int)today.DayOfWeek;
            DateTime startOfWeek = today.AddDays(-daysFromSunday); // This Sunday (or last Sunday)

            var dailyLoggingMetric = await _supabaseClient
                .From<DailyLogging>()
                .Filter("workspace_id", Supabase.Postgrest.Constants.Operator.Equals, workspaceId.ToString())
                .Filter("user_id", Supabase.Postgrest.Constants.Operator.Equals, userId.ToString())
                .Filter("checking_date", Operator.GreaterThanOrEqual, startOfWeek.ToString("yyyy-MM-dd"))
                .Order("checking_date", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();

            return dailyLoggingMetric?.Models ?? new List<DailyLogging>();
        }


        public async Task<List<UserContributionMetric>> GetUserContribution(string workspaceGuid, string userGuid)
        {
            // Load workspace
            var workspace = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Single();

            if (workspace == null)
                return new List<UserContributionMetric>();

            // Load profile
            var profile = await _supabaseClient
                .From<Profile>()
                .Where(p => p.Guid == userGuid)
                .Single();

            if (profile == null)
                return new List<UserContributionMetric>();

            // Load member ID tied to workspace
            var member = await _supabaseClient
                .From<Members>()
                .Where(x => x.ProfileId == profile.Id)
                .Where(x => x.WorkspaceGuid == workspaceGuid)
                .Single();

            if (member == null)
                return new List<UserContributionMetric>();

            // Project mappings
            var projectMaps = await _supabaseClient
                .From<ProjectWorkspaceMapping>()
                .Where(x => x.WorkspaceId == workspace.Id)
                .Get();

            var projectIds = projectMaps.Models.Select(x => x.ProjectId).ToList();

            if (!projectIds.Any())
                return new List<UserContributionMetric>();

            // Load all projects
            var projects = await _supabaseClient
                .From<Project>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.In, "{" + string.Join(",", projectIds) + "}")
                .Get();

            // USER TASKS (tasks done by user)
            var userTasks = await _supabaseClient
                .From<Task>()
                .Filter("assigned_to", Supabase.Postgrest.Constants.Operator.Equals, profile.Id.ToString())
                .Filter("is_done", Supabase.Postgrest.Constants.Operator.Equals, "true")
                .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, "{" + string.Join(",", projectIds) + "}")
                .Get();

            // ALL PROJECT TASKS (done by all users)
            var allTasks = await _supabaseClient
                .From<Task>()
                .Filter("is_done", Supabase.Postgrest.Constants.Operator.Equals, "true")
                .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, "{" + string.Join(",", projectIds) + "}")
                .Get();

            // Team memberships → Sprints
            var teamMap = await _supabaseClient
                .From<TeamMemberMapping>()
                .Where(t => t.MemberId == member.Id)
                .Get();

            var teamIds = teamMap.Models.Select(t => t.TeamId).ToList();

            List<Sprint> sprints = new();

            if (teamIds.Any())
            {
                var sprintResponse = await _supabaseClient
                    .From<Sprint>()
                    .Filter("working_team_id", Supabase.Postgrest.Constants.Operator.In, "{" + string.Join(",", teamIds) + "}")
                    .Filter("project_id", Supabase.Postgrest.Constants.Operator.In, "{" + string.Join(",", projectIds) + "}")
                    .Get();

                sprints = sprintResponse.Models;
            }

            // Transform final metrics
            var result = new List<UserContributionMetric>();

            foreach (var project in projects.Models)
            {
                int projectId = project.ProjectId;

                int tasksDoneByUser = userTasks.Models.Count(t => t.ProjectId == projectId);
                int totalTasksDone = allTasks.Models.Count(t => t.ProjectId == projectId);

                double percent = totalTasksDone == 0
                    ? 0
                    : Math.Round(((double)tasksDoneByUser / totalTasksDone) * 100, 2);

                result.Add(new UserContributionMetric
                {
                    ProjectId = projectId,
                    ProjectName = project.ProjectName,
                    ContributionPercent = percent,
                    TasksDoneByUser = tasksDoneByUser,
                    TotalTasksDone = totalTasksDone,
                    SprintsParticipated = sprints.Count(s => s.ProjectId == projectId)
                });
            }

            return result;
        }

    }
}
