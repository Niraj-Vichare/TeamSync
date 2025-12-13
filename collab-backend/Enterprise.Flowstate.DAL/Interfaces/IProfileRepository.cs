using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IProfileRepository
    {
        Task<bool> CreateProfile(User user, string? displayName);
        Task<int?> CreateProfileAsync(Profile profile);
        Task<string> GetCurrentWorkspaceId(string userGuid);
        Task<Profile> GetProfile(string userGuid);
        Task<int> GetProfileId(string userGuid);
        Task<List<WorkspaceUserMapping>> GetWorkspaceUsers(string workspaceGuid);
    }
}
