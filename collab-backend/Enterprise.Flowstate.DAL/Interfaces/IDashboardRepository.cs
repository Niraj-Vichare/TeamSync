using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IDashboardRepository
    {
        Task<List<UserMetric>> GetUserMetric(string workspaceGuid, string userGuid);
        Task<OrganizationMetric> GetOrganizationMetric(string workspaceGuid);
        Task<List<DailyLogging>> GetWeeklyDailyLoggingMetrics(string workspaceGuid, string userGuid);
        Task<DailyLogging> GetTodayLogging(string workspaceId, string userId);
        Task<bool> ClockOut(string workspaceId, string userId);
        Task<bool> ClockIn(string workspaceGuid, string userId);
    }
}
