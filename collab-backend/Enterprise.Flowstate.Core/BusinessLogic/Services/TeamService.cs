using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Enums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class TeamService:ITeamService
    {
        public IOmniRepository _omniRepository;
        private readonly Supabase.Client _supabaseClient;
        private ICache _cache;
        public TeamService(IOmniRepository omniRepository, Supabase.Client supabaseClient,ICache cache)
        {
            _omniRepository = omniRepository;
            _supabaseClient = supabaseClient;
            _cache = cache;
        }
        public async Task<bool> AddMember(string workspaceGuid,TeamMemberDto teamMemberDto)
        {
            var encryptedPassword = EncryptionService.EncryptData(teamMemberDto.Profile.Password);
            
            var user = await _supabaseClient.Auth.SignUp(teamMemberDto.Profile.Email, encryptedPassword);
            if(user.User == null)
            {
                return false;
            }

            int workspaceId = await _omniRepository.WorkspaceRepository.GetWorkspaceId(workspaceGuid);
            Profile profile = new Profile
            {
                Bio = "",
                DisplayName = teamMemberDto.Profile.DisplayName,
                WorkspaceId = workspaceGuid,
                CreatedAt = DateTime.UtcNow,
                Email = teamMemberDto.Profile.Email,
                ProfileImageUrl = teamMemberDto.Profile.ProfileImageUrl,
                UpdatedAt = DateTime.UtcNow,
                Guid = user.User.Id,
            };
            var profileId = await _omniRepository.ProfileRepository.CreateProfileAsync(profile, teamMemberDto.RoleId);
            if(profileId <= 0)
            {
                return false;
            }
            int memberCount = await _omniRepository.WorkspaceRepository.GetWorkspaceMemberCount(workspaceGuid);
            RankingCacheModel rankingCacheMetric = new RankingCacheModel
            {
                ContributionPoint = 0,
                Efficiency = 0,
                Ranking = memberCount,
                Score = 0,
                TotalHours = 0,
                TotalTicketCompleted = 0,
                UserName = teamMemberDto.Profile.DisplayName,
                UserId = (int)profileId
            };
            await _cache.UpsertUserMetricAsync(workspaceGuid,user.User.Id,rankingCacheMetric);

            var (startDate, endDate) = PeriodHelper.GetCurrentWeekPeriod();
            WeeklyUserStats weeklyUserStats = new WeeklyUserStats
            {
                ContributionPoints = 0,
                Efficiency = 0,
                RankPosition = memberCount,
                Score = 0,
                TotalHours = 0,
                TicketCompleted = 0,
                UserId = (int)profileId,
                StartPeriod = startDate,
                EndPeriod = endDate,
                WorkspaceId = workspaceId
            };
            await _omniRepository.ProfileRepository.UpertWeeklyUserMetric(weeklyUserStats);

            Members members = new Members()
            {
                DepartmentId = teamMemberDto.DepartmentId,
                PositionId = teamMemberDto.PositionId,
                ProfileId = (int)profileId,
                Status = teamMemberDto.StatusId,
                WorkspaceGuid = workspaceGuid,
            };
            
            var result = await _omniRepository.TeamRepository.AddMember(workspaceGuid, members);
            if (result)
            {
                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Team.MemberAdded",
                    EventTypeId = (int)GeneralEnums.EventType.AddMember,
                    WorkspaceGuid = workspaceGuid,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);

            }
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

                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Team.MemberAdded",
                    EventTypeId = (int)GeneralEnums.EventType.AddCustomTeam,
                    WorkspaceGuid = team.WorkspaceGuid,
                };

                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);
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
            await _omniRepository.TeamRepository.AddTeamMemberMapping(mapping);
            EventsLog eventsLog = new EventsLog
            {
                EventGuid = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow,
                EventDescription = "Team.Update",
                EventTypeId = (int)GeneralEnums.EventType.UpdateCustomTeam,
            };
            await _omniRepository.ProfileRepository.AddEventLog(eventsLog);
            return true;
        }

        public async Task<bool> RemoveTeam(int teamId)
        {
            var isDeleted = await _omniRepository.TeamRepository.RemoveTeam(teamId);
            if (isDeleted)
            {
                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Team.Update",
                    EventTypeId = (int)GeneralEnums.EventType.UpdateCustomTeam,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);
            }
            return isDeleted;
        }
        public async System.Threading.Tasks.Task RemoveTeamMember(TeamMemberMapping teamMapping)
        {
            TeamMemberMapping mapping = new TeamMemberMapping
            {
                TeamId = teamMapping.TeamId,
                MemberId = teamMapping.MemberId,
                IsLeader = teamMapping.IsLeader,
            };
            var isRemoved = await _omniRepository.TeamRepository.RemoveTeamMemberMapping(mapping);
            if (isRemoved)
            {
                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Team.Member.Remove",
                    EventTypeId = (int)GeneralEnums.EventType.RemoveCustomTeamMember,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);
            }

        }

        public async Task<bool> DeleteMember(string workspaceGuid, int memberId)
        {
            bool isDeleted = await _omniRepository.TeamRepository.DeleteMember(workspaceGuid, memberId);
            if (isDeleted)
            {
                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Member.Remove",
                    EventTypeId = (int)GeneralEnums.EventType.RemoveMember,
                    WorkspaceGuid = workspaceGuid,
                    Metadata = $"Deleted member id: ${memberId}"
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);
            }
            return isDeleted;
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
            if (isEdited)
            {

                EventsLog eventsLog = new EventsLog
                {
                    EventGuid = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Team.Updated",
                    EventTypeId = (int)GeneralEnums.EventType.UpdateCustomTeam,
                    WorkspaceGuid = workspaceGuid,
                    Metadata = $"Updated Team with Id: ${team.TeamId}"
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventsLog);

            }
            return isEdited;
        }
    }
}
