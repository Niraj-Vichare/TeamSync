using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class DashboardService : IDashboardService
    {
        private IOmniRepository _omniRepository;
        public DashboardService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
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
            // Get all metrics for current + previous week from repository
            var userMetrics = await _omniRepository.DashboardRepository.GetUserMetric(workspaceGuid, userGuid);

            if (userMetrics == null || userMetrics.Count == 0)
                return null;

            // Sort by CreatedAt descending
            var orderedMetrics = userMetrics.OrderByDescending(m => m.CreatedAt).ToList();

            List<WeeklyUserStatsDto> weeklyDto = new List<WeeklyUserStatsDto>();
            foreach(var stat in orderedMetrics)
            {
                var dto = new WeeklyUserStatsDto
                {
                    Id = stat.Id,
                    CreatedAt = stat.CreatedAt,
                    TotalHours = stat.TotalHours,
                    TasksCompleted = stat.TasksCompleted,
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
        public async Task<ClockActionResult> ClockOut(string workspaceId, string userId,bool isAutomatic)
        {
            var result = await _omniRepository.DashboardRepository.ClockOut(workspaceId, userId, isAutomatic);
            return result;
        }
        public async Task<ClockActionResult> ClockIn(string workspaceGuid, string userId)
        {
            var result = await _omniRepository.DashboardRepository.ClockIn(workspaceGuid, userId);
            return result;
        }

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
