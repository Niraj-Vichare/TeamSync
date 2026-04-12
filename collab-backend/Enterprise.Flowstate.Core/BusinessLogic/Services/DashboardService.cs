using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Interfaces;
using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class DashboardService : IDashboardService
    {
        private IOmniRepository _omniRepository;
        private IEventPublisher _eventPublisher;
        public DashboardService(IOmniRepository omniRepository,IEventPublisher eventPublisher)
        {
            _omniRepository = omniRepository;
            _eventPublisher = eventPublisher;
        }
        public async Task<OrganizationMetricDto> GetOrganizationMetric(string workspaceGuid)
        {
            var orgMetric = await _omniRepository.DashboardRepository.GetOrganizationMetric(workspaceGuid);
            OrganizationMetricDto organizationMetricDto = new OrganizationMetricDto
            {
                ActiveProject = orgMetric.ActiveProject,
                ActiveSprints = orgMetric.ActiveSprints,
                ActiveTask = orgMetric.ActiveTask,
                CompletedTask = orgMetric.CompletedTask,
                ActiveTickets = orgMetric.ActiveTickets
            };
            return organizationMetricDto;

        }

        public async Task<List<WeeklyUserStatsDto>> GetUserMetric(string workspaceGuid, string userGuid)
        {

            var userMetrics = await _omniRepository.DashboardRepository.GetUserMetric(workspaceGuid, userGuid);

            if (userMetrics == null || userMetrics.Count == 0)
                return null;

            List<WeeklyUserStatsDto> weeklyDto = new List<WeeklyUserStatsDto>();
            foreach(var stat in userMetrics)
            {
                var dto = new WeeklyUserStatsDto
                {
                    Id = stat.Id,
                    CreatedAt = stat.CreatedAt,
                    TotalHours = stat.TotalHours,
                    TicketsCompleted = stat.TicketCompleted,
                    ContributionPoint = stat.ContributionPoints,
                    Score = stat.Score,
                    UserId = stat.UserId,
                    WorkspaceId = stat.WorkspaceId,
                    Efficiency = stat.Efficiency,
                };
                weeklyDto.Add(dto);
            }

            return weeklyDto;
        }

        public async Task<Dictionary<string, double>> GetWeeklyDailyLoggingMetrics(string workspaceGuid, string userGuid)
            {
            var dailyLogging = await _omniRepository.DashboardRepository
                .GetWeeklyDailyLoggingMetrics(workspaceGuid, userGuid);

            // Pre-seed all 7 days with 0
            Dictionary<string, double> pairs = Enum.GetNames(typeof(DayOfWeek))
                .ToDictionary(d => d, d => 0.0);

            foreach (var dailyLog in dailyLogging)
            {
                // Skip if checkout is missing
                if (!dailyLog.CheckOut.HasValue) continue;

                string dayOfWeek = dailyLog.CheckingDate.DayOfWeek.ToString();
                TimeSpan workedTime = dailyLog.CheckOut.Value - dailyLog.CheckIn.Value;

                // Cross-midnight handling
                if (workedTime.TotalHours < 0)
                    workedTime = workedTime.Add(TimeSpan.FromHours(24));

                double totalHours = workedTime.TotalHours;

                // Add hours to pre-seeded value
                pairs[dayOfWeek] += totalHours;
            }

            return pairs;
        }

        public async Task<ClockStatusDto> GetCurrentStatus(string workspaceGuid, string userGuid)
        {
            return await _omniRepository.DashboardRepository.GetCurrentStatus(workspaceGuid, userGuid);
        }
        public async Task<DailyLogging> GetTodayLogging(string workspaceId, string userId)
        {
            var result = await _omniRepository.DashboardRepository.GetTodayLogging(workspaceId, userId);
            return result;
        }

        #region Clock In/Out    
        public async Task<ClockActionResult> ClockOut(string workspaceGuid, string userGuid, bool isAutomatic)
        {
            var result = await _omniRepository.DashboardRepository.ClockOut(workspaceGuid, userGuid, isAutomatic);

            if (result != ClockActionResult.Success)
                return result;

            // Get today's log
            var todayLog = await _omniRepository.DashboardRepository.GetTodayLogging(workspaceGuid, userGuid);

            float sessionHours = 0f;

            if (todayLog?.CheckIn != null && todayLog.CheckOut != null)
            {
                var timeSpan = todayLog.CheckOut.Value - todayLog.CheckIn.Value;

                // Handle cross-midnight safely
                if (timeSpan.TotalSeconds < 0)
                    timeSpan = timeSpan.Add(TimeSpan.FromHours(24));

                sessionHours = (float)timeSpan.TotalHours;
            }
            var eventGuid = Guid.NewGuid().ToString();

            EventsLog eventLog = new EventsLog
            {
                EventGuid = eventGuid,
                CreatedAt = DateTime.UtcNow,
                EventDescription = "User Clock out",
                EventTypeId = (int)EventType.CheckOut,
                UserGuid = userGuid,
                WorkspaceGuid = workspaceGuid,
                Metadata = System.Text.Json.JsonSerializer.Serialize(new
                {
                    sessionHours = sessionHours,
                    isAutomatic = isAutomatic
                })
            };

            await _omniRepository.ProfileRepository.AddEventLog(eventLog);

            
            EventsLogDto eventLogDto = new EventsLogDto
            {
                EventGuid = eventGuid, // SAME GUID → idempotency safe
                EventTypeId = (int)EventType.CheckOut,
                UserGuid = userGuid,
                WorkspaceGuid = workspaceGuid,
                CreatedAt = DateTime.UtcNow,
                EventDescription = $"Clocked out after {sessionHours:F1}h",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new
                {
                    sessionHours = sessionHours,
                    isAutomatic = isAutomatic
                })
            };

            await _eventPublisher.PublishAsync(eventLogDto, 0);

            return result;
        }
        public async Task<ClockActionResult> ClockIn(string workspaceGuid, string userGuid)
        {
            ClockActionResult result = await _omniRepository.DashboardRepository.ClockIn(workspaceGuid, userGuid);
            if (result == ClockActionResult.Success)
            {

                EventsLog eventLog = new EventsLog
                {
                    EventTypeId = (int)EventType.CheckIn,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "User Clock in",
                    UserGuid = userGuid,
                    WorkspaceGuid = workspaceGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                };

                
                await _omniRepository.ProfileRepository.AddEventLog(eventLog);

                #region Event Publishing
                EventsLogDto eventLogDto = new EventsLogDto
                {
                    EventTypeId = (int)EventType.CheckIn,
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "User Clock in",
                    UserGuid = userGuid,
                    WorkspaceGuid = workspaceGuid,
                    EventGuid = Guid.NewGuid().ToString(),
                };
                string json = System.Text.Json.JsonSerializer.Serialize(eventLogDto);
                byte[] body = Encoding.UTF8.GetBytes(json);
                await _eventPublisher.PublishAsync(eventLogDto,0);
                #endregion
            }
            return result;
        }
        #endregion
        
        public async Task<List<UserWorkMetric>> GetUserWorkMetric(string workspaceGuid, string userGuid)
        {
            var userWorkMetric = await _omniRepository.DashboardRepository.GetUserWorkMetric(workspaceGuid, userGuid);
            return userWorkMetric;
        }
        public async Task<List<UserContributionMetric>> GetUserContribution(string workspaceGuid, string userGuid)
        {
            var userContributionMetric = await _omniRepository.DashboardRepository.GetUserContribution(workspaceGuid, userGuid);
            return userContributionMetric;
        }

    }
}
