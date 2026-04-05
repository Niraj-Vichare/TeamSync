using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Supabase.Gotrue;
namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IProfileService
    {
        Task<bool> CreateProfile(User user,string? displayName);
        Task<string> GetCurrentWorkspaceId(string userGuid);
        Task<ProfileDto> GetProfile(string userGuid);
        Task<List<ProfileDto>> GetWorkspaceUsers(string workspaceGuid);
        System.Threading.Tasks.Task UpertWeeklyUserMetric(WeeklyUserStatsDto weeklyUserStatsDto);
        Task<bool> ProfileExists(string userGuid);
        Task<int> GetUserRole(string userGuid,string workspaceGuid);
        Task<int> GetProfileId(string userGuid);
    }
}
