using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IDashboardService
    {
        Task<UserMetricDto> GetUserMetric(string workspaceGuid, string userGuid);
        Task<OrganizationMetricDto> GetOrganizationMetric(string workspaceGuid);
        Task<Dictionary<string, double>> GetWeeklyDailyLoggingMetrics(string workspaceGuid, string userGuid);
        Task<DailyLogging> GetTodayLogging(string workspaceId, string userId);
        Task<bool> ClockOut(string workspaceId, string userId);
        Task<bool> ClockIn(string workspaceGuid, string userId);
        Task<List<UserWorkMetric>> GetUserWorkMetric(string workspaceGuid, string userGuid);
        Task<List<UserContributionMetric>> GetUserContribution(string workspaceGuid, string userGuid);
    }
}
