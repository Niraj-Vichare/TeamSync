using Enterprise.Flowstate.BAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IProfileService
    {
        Task<bool> CreateProfile(User user,string? displayName);
        Task<string> GetCurrentWorkspaceId(string userGuid);
        Task<ProfileDto> GetProfile(string userGuid);
    }
}
