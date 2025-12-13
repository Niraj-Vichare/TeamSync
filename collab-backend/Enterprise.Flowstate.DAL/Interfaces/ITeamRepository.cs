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
        Task<bool> AddMember(string workspaceId, Members mapping);
        Task<bool> EditMember(string workspaceId, Members mapping);
        Task<bool> DeleteMember(string workspaceId,int member);
        Task<List<Members>> GetTeamMembers(string workspaceId);
        Task<List<TeamDropdownModel>> GetTeamDropDown(string workspaceGuid);
        Task<List<TeamMemberMapping>> GetAssignedMember(string sprintGuid);
        Task<List<TeamDto>> GetCustomTeams(string workspaceGuid);
        Task<List<DepartmentWithMembersDto>> GetDepartmentWiseMembers(string workspaceGuid);
        Task<int> AddTeam(Team team);
        Task<bool> RemoveTeam(int teamId);
        Task<bool> EditTeam(Team team);
        System.Threading.Tasks.Task AddTeamMemberMapping(TeamMemberMapping mapping);
        System.Threading.Tasks.Task<bool> RemoveTeamMemberMapping(TeamMemberMapping mapping);
    }
}
