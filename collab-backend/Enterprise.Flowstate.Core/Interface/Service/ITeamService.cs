using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface ITeamService
    {
        Task<bool> AddMember(string workspaceGuid, TeamMemberDto mapping);
        Task<List<TeamMemberDto>> GetTeamMembers(string workspaceGuid);
        Task<bool> UpdateMember(string workspaceGuid, TeamMemberDto teamMemberDto); 
        Task<bool> DeleteMember(string workspaceGuid, int userGuid);
        Task<List<TeamDropdownModel>> GetTeamDropDown(string workspaceGuid);
        Task<TeamDto> GetAssignedTeam(string sprintGuid);
        Task<List<TeamDto>> GetCustomTeams(string workspaceGuid);
        Task<List<DepartmentWithMembersDto>> GetDepartmentWiseMembers(string workspaceGuid);
        Task<bool> AddCustomTeam(TeamDto team);
        Task<bool> AddTeamMember(TeamMemberMapping teamMapping);
        System.Threading.Tasks.Task RemoveTeamMember(TeamMemberMapping teamMapping);
        Task<bool> RemoveTeam(int teamId);
        Task<bool> UpdateTeam(string workspaceGuid, TeamDto teamDto);
        //Task<bool> DeleteMember(string workspaceGuid, int memberId);
        System.Threading.Tasks.Task AddTeamMemberMapping(int memberId, int teamId, bool isLeader);
        System.Threading.Tasks.Task DeleteTeamMemberMapping(int memberId, int teamId, bool isLeader);
    }
}
