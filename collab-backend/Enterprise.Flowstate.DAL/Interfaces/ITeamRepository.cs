using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface ITeamRepository
    {
        Task<bool> AddMember(string workspaceId, TeamMemberWorkspaceMapping mapping);
        Task<List<TeamMemberWorkspaceMapping>> GetTeamMembers(string workspaceId);
        Task<List<TeamDropdownModel>> GetTeamDropDown(string workspaceGuid);
        Task<List<TeamMemberMapping>> GetAssignedMember(string sprintGuid);
    }
}
