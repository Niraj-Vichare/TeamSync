using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IDashboardRepository
    {
        Task<List<WeeklyUserStats>> GetUserMetric(string workspaceGuid, string userGuid);
        Task<OrganizationMetric> GetOrganizationMetric(string workspaceGuid);
        Task<List<DailyLogging>> GetWeeklyDailyLoggingMetrics(string workspaceGuid, string userGuid);
        Task<DailyLogging> GetTodayLogging(string workspaceId, string userId);
        Task<ClockActionResult> ClockIn(string workspaceGuid, string userGuid);
        Task<ClockActionResult> ClockOut(string workspaceGuid, string userGuid,bool isAutomatic);
        Task<List<UserWorkMetric>> GetUserWorkMetric(string workspaceGuid, string userGuid);
        Task<List<UserContributionMetric>> GetUserContribution(string workspaceGuid, string userGuid);
        Task<ClockStatusDto> GetCurrentStatus(string workspaceGuid, string userGuid);
    }
}
