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
        public Task<bool> AddMember(string workspaceGuid, TeamMemberWorkspaceMapping mapping)
        {
            var result = _omniRepository.TeamRepository.AddMember(workspaceGuid, mapping);
            return result;
        }

        public async Task<List<TeamMemberDto>> GetTeamMembers(string workspaceGuid)
        {
            var result = await _omniRepository.TeamRepository.GetTeamMembers(workspaceGuid);
            if (result.Count > 0)
            {
                result.Select(team => new TeamMemberDto
                {
                    Profile = null,
                    StatusId = team.StatusId,
                    CreateAt = team.CreateAt,
                });
            }
            return null;
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
                    },
                    DepartmentDto = new DepartmentDto
                    {
                        DepartmentName = item.Member.Department?.Title,
                        DepartmentId = item.Member.Department?.Id ?? 0,
                        Tagline = item.Member.Department?.Tagline,
                        PositionId = item.Member.Department.Position
                    },
                });
            }

            return team;
        }

        public async Task<List<TeamDto>> GetCustomTeams(string workspaceGuid)
        {
            var mappings = await _omniRepository.TeamRepository.GetCustomTeams(workspaceGuid);

            if (mappings == null || !mappings.Any())
                return new List<TeamDto>();

            // Group mappings by team_id
            var grouped = mappings
                .GroupBy(m => new { m.TeamId, m.Team.TeamName, m.Team.Tagline })
                .Select(group => new TeamDto
                {
                    TeamId = group.Key.TeamId,
                    Name = group.Key.TeamName,
                    Tagline = group.Key.Tagline,
                    Members = group.Select(m => new TeamMemberDto
                    {
                        StatusId = m.Member.Status,
                        DepartmentDto = m.Member.Department != null
                            ? new DepartmentDto
                            {
                                DepartmentId = m.Member.Department.Id,
                                DepartmentName = m.Member.Department.Title,
                                Tagline = m.Member.Department.Tagline,
                                PositionId = m.Member.Department.Position,
                                
                            }
                            : null,
                        Profile = m.Member.Profile != null
                            ? new ProfileDto
                            {
                                Id = m.Member.Profile.Id,
                                DisplayName = m.Member.Profile.DisplayName,
                                ProfileImageUrl = m.Member.Profile.ProfileImageUrl,
                                Guid = m.Member.Profile.Guid,
                            }
                            : null
                    }).ToList()
                })
                .ToList();

            return grouped;
        }


        public async Task<List<TeamMemberDto>> GetDepartmentWiseMembers(string workspaceGuid)
        {
            var departmentwiseMembers = await _omniRepository.TeamRepository.GetDepartmentWiseMembers(workspaceGuid);
            List<TeamMemberDto> teamMembers = new List<TeamMemberDto>();
            foreach (var m in departmentwiseMembers)
            {
                var response = new TeamMemberDto()
                {
                    DepartmentDto = m.Department != null
                            ? new DepartmentDto
                            {
                                DepartmentId = m.Department.Id,
                                DepartmentName = m.Department.Title,
                                Tagline = m.Department.Tagline,
                                PositionId = m.Department.Position,

                            }
                            : null,
                    Profile = m.Profile != null ? new ProfileDto
                    {
                        DisplayName = m.Profile.DisplayName,
                        ProfileImageUrl = m.Profile.ProfileImageUrl,
                        Bio = m.Profile.Bio,
                        Guid = m.Profile.Guid
                    }:null,
                    StatusId = m.Status,
                };
                teamMembers.Add(response);
            }
            return teamMembers;
        }



        //public async Task<List<TeamMemberDto>> GetAssignedMember(string sprintGuid)
        //{
        //    var mapping = await _omniRepository.SprintRepository.GetAssignedTeam(sprintGuid);
        //    List<Tea>
        //    foreach (var item in mapping)
        //    {

        //    }
        //}

    }
}
