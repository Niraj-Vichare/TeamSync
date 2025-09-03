using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TeamService:ITeamService
    {
        public IOmniRepository _omniRepository;
        public TeamService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }
        public Task<bool> AddMember(string workspaceGuid, UserDto user)
        {
            Profile profile = new Profile
            {

            };
            var result = _omniRepository.TeamRepository.AddMember(workspaceGuid, profile);
            return result;
        }

        public async Task<List<TeamMemberDto>> GetTeamMembers(string workspaceGuid)
        {
            //var result = _omniRepository.TeamRepository.GetTeamMembers(workspaceGuid);
            return null;
        }

    }
}
