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
        public async Task<bool> AddMember(string workspaceGuid,TeamMemberDto teamMemberDto)
        {
            // Create a new profile...
            Profile profile = new Profile
            {
                Bio = "",
                DisplayName = teamMemberDto.Profile.DisplayName,
                WorkspaceId = workspaceGuid,
                CreatedAt = DateTime.UtcNow,
                Email = teamMemberDto.Profile.Email,
                ProfileImageUrl = teamMemberDto.Profile.ProfileImageUrl,
                UpdatedAt = DateTime.UtcNow,
            };
            var profileId = await _omniRepository.ProfileRepository.CreateProfileAsync(profile);
            if(profileId <= 0)
            {
                return false;
            }

            Members members = new Members()
            {
                DepartmentId = teamMemberDto.DepartmentId,
                PositionId = teamMemberDto.PositionId,
                ProfileId = (int)profileId,
                Status = teamMemberDto.StatusId,
                WorkspaceGuid = workspaceGuid,
            };
            
            var result = await _omniRepository.TeamRepository.AddMember(workspaceGuid, members);
            return result;
        }

        public async Task<List<TeamMemberDto>> GetTeamMembers(string workspaceGuid)
        {
            var result = await _omniRepository.TeamRepository.GetTeamMembers(workspaceGuid);

            if (result == null || result.Count == 0)
                return new List<TeamMemberDto>();

            var mapped = result.Select(team => new TeamMemberDto
            {
                PositionId = team.PositionId,
                StatusId = team.Status,
                CreateAt = team.Profile.CreatedAt,
                Profile = new ProfileDto
                {
                    Id = team.ProfileId,
                    DisplayName = team.Profile.DisplayName,
                    Guid = team.Profile.Guid,
                    ProfileImageUrl = team.Profile.ProfileImageUrl,
                    CreatedAt = team.Profile.CreatedAt,
                    Email = team.Profile.Email,
                },
                DepartmentDto = new DepartmentDto
                {
                    DepartmentName = team.Department.Title,
                    DepartmentId = team.DepartmentId,
                    Tagline = team.Department.Tagline,
                }
            }).ToList();

            return mapped;
        }

        public async Task<List<TeamDropdownModel>> GetTeamDropDown(string workspaceGuid)
        {
            return await _omniRepository.TeamRepository.GetTeamDropDown(workspaceGuid);
        }

        public async Task<TeamDto> GetAssignedTeam(string sprintGuid)
        {
            var teamMemberMapping = await _omniRepository.TeamRepository.GetAssignedMember(sprintGuid);

            if (teamMemberMapping == null || !teamMemberMapping.Any())
                return null; 

            var first = teamMemberMapping.First();

            var team = new TeamDto
            {
                Name = first.Team?.TeamName,
                Tagline = first.Team?.Tagline,
                Members = new List<TeamMemberDto>()
            };

            foreach (var item in teamMemberMapping)
            {
                team.Members.Add(new TeamMemberDto
                {
                    Profile = new ProfileDto
                    {
                        DisplayName = item.Member.Profile?.DisplayName,
                        ProfileImageUrl = item.Member.Profile?.ProfileImageUrl,
                        Guid = item.Member.Profile?.Guid,
                        Id = item.Member.ProfileId,
                        IsLeader = item.IsLeader,
                    },
                    DepartmentDto = new DepartmentDto
                    {
                        DepartmentName = item.Member.Department?.Title,
                        DepartmentId = item.Member.Department?.Id ?? 0,
                        Tagline = item.Member.Department?.Tagline
                    },
                    PositionId = item.Member.PositionId
                });
            }

            return team;
        }

        public async Task<List<TeamDto>> GetCustomTeams(string workspaceGuid)
        {
            return await _omniRepository.TeamRepository.GetCustomTeams(workspaceGuid);
        }

        public async Task<List<DepartmentWithMembersDto>> GetDepartmentWiseMembers(string workspaceGuid)
        {
            return await _omniRepository.TeamRepository.GetDepartmentWiseMembers(workspaceGuid);  
        }

        public async Task<bool> AddCustomTeam(TeamDto team)
        {
            var workspaceId = await _omniRepository.WorkspaceRepository.GetWorkspaceId(team.WorkspaceGuid);
            Team teamCustom = new Team
            {
                Tagline = team.Tagline,
                TeamName = team.Name,
                TeamGuid = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow,
                WorkspaceId = workspaceId,
            };
            var teamId = await _omniRepository.TeamRepository.AddTeam(teamCustom);
            var teamMemberList = team.Members.Select(member => member.MemberId).ToList();
            if (teamId > 0)
            {
                foreach (var memberId in teamMemberList)
                {
                    TeamMemberMapping mapping = new TeamMemberMapping
                    {
                        TeamId = teamId,
                        MemberId = memberId,
                        IsLeader = false,
                    };
                    await _omniRepository.TeamRepository.AddTeamMemberMapping(mapping);
                }
                return true;
            }
            return false;

        }
        public async Task<bool> AddTeamMember(TeamMemberMapping teamMapping)
        {
            TeamMemberMapping mapping = new TeamMemberMapping
            {
                TeamId = teamMapping.TeamId,
                MemberId = teamMapping.MemberId,
                IsLeader = teamMapping.IsLeader,
            };
            _omniRepository.TeamRepository.AddTeamMemberMapping(mapping);
            return true;
        }

        public async Task<bool> RemoveTeam(int teamId)
        {
            return await _omniRepository.TeamRepository.RemoveTeam(teamId);
        }
        public async System.Threading.Tasks.Task RemoveTeamMember(TeamMemberMapping teamMapping)
        {
            TeamMemberMapping mapping = new TeamMemberMapping
            {
                TeamId = teamMapping.TeamId,
                MemberId = teamMapping.MemberId,
                IsLeader = teamMapping.IsLeader,
            };
            await _omniRepository.TeamRepository.RemoveTeamMemberMapping(mapping);

        }

        public async Task<bool> DeleteMember(string workspaceGuid, int memberId)
        {
            return await _omniRepository.TeamRepository.DeleteMember(workspaceGuid, memberId);
        }

        public async Task<bool> UpdateTeam(string workspaceGuid,TeamDto teamDto)
        {
            int workspaceId = await _omniRepository.WorkspaceRepository.GetWorkspaceId(workspaceGuid);
            Team team = new Team
            {
                UpdatedAt = DateTime.UtcNow,
                Tagline = teamDto.Tagline,
                TeamId = teamDto.TeamId,
                TeamName = teamDto.Name,
                WorkspaceId = workspaceId
            };

            var isEdited = await _omniRepository.TeamRepository.EditTeam(team);
            return isEdited;
        }
    }
}
