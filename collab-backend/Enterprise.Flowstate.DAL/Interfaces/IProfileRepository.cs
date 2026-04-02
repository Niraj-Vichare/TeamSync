using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IProfileRepository
    {
        Task<int> CreateProfile(User user, string? displayName);
        Task<int?> CreateProfileAsync(Profile profile,int roleId);
        Task<string> GetCurrentWorkspaceId(string userGuid);
        Task<Profile> GetProfile(string userGuid);
        Task<string> GetProfileGuid(int profileId);
        Task<int> GetProfileId(string userGuid);
        Task<List<WorkspaceUserMapping>> GetWorkspaceUsers(string workspaceGuid);
        Task<bool> InializeUserConfiguration(int userId, DateOnly startDate, DateOnly endDate);
        Task<Profile> UpdateUserConfiguration(string userGuid,string workspaceGuid,int memberCount);
        Task AddEventLog(EventsLog eventsLog);
        Task<bool> UpertWeeklyUserMetric(WeeklyUserStats weeklyUserStats);
        Task UpdateCurrentWorkspace(string userGuid, string workspaceGuid);
        Task<int> GetUserRole(string userGuid, string workspaceGuid);
    }
}
