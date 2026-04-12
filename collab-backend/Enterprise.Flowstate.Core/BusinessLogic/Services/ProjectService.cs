using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class ProjectService:IProjectService
    {
        private IOmniRepository _omniRepository;
        private IEventPublisher _eventPublisher;
        public ProjectService(IOmniRepository omniRepository,IEventPublisher eventPublisher)
        {
            _omniRepository = omniRepository;
            _eventPublisher = eventPublisher;   
        }


        public async Task<List<ProjectDto>> GetOngoingProject(string userClaims)
        {
            var ongoingProject = await _omniRepository.ProjectRepository.GetOngoingProjects(userClaims);
            if(ongoingProject == null)
            {
                return new List<ProjectDto>();
            }
            var projectDtos = ongoingProject.Select(project => new ProjectDto
            {
                ProjectId = project.ProjectId,
                ProjectTitle = project.ProjectName,
                ProjectDescription = project.ProjectDescription,
                ProjectGuid = project.ProjectGuid,
                Status = (ProjectEnums.ProjectStatus)project.ProjectStatus
            }).ToList();

            return projectDtos;
        }

        public async Task<Datatable<ProjectDto>> GetUserProjects(string workspaceGuid,string search,string status,int pageNumber,int pageSize)
        {
            var (projects, totalCount) = await _omniRepository.ProjectRepository.GetUserProjectsAsync(workspaceGuid, search, status, pageNumber, pageSize);

            var items = projects.Select(p => new ProjectDto
            {
                ProjectId = p.ProjectId,
                ProjectTitle = p.ProjectName,
                Status = (ProjectEnums.ProjectStatus)p.ProjectStatus,
                ProjectDescription = p.ProjectDescription,  
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                DueDate = p.DueDate,
                ProjectGuid = p.ProjectGuid,
                Category = (ProjectEnums.ProjectCategory)p.ProjectCategory,
                ProjectLogo = p.ProjectLogo,
                ProjectTagline = p.ProjectTagline
            
            }).ToList();

            return new Datatable<ProjectDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<(bool,ErrorStatus)> CreateProject(string workspaceGuid, ProjectDto projectDto)
        {
            if(projectDto == null)
            {
                return (false,ErrorStatus.PROJECT_DETAILS_NOT_FOUND);
            }

            var project = new Project
            {
                DueDate = projectDto.DueDate,
                EndDate = projectDto.EndDate,
                StartDate = projectDto.StartDate,
                ProjectCategory = (int)projectDto.Category,
                ProjectDescription = projectDto.ProjectDescription,
                ProjectTagline = projectDto.ProjectTagline,
                ProjectName = projectDto.ProjectTitle,
                ProjectLogo = projectDto.ProjectLogo,
                ProjectStatus = (int)projectDto.Status,
                ProjectGuid = projectDto.ProjectGuid
            };

            var (isSuccess,status) = await _omniRepository.ProjectRepository.CreateProject(workspaceGuid, project);
            if (isSuccess)
            {
                EventsLog eventLogs = new EventsLog
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Project.Created",
                    EventTypeId = (int)EventType.ProjectCreated,
                    EventGuid = Guid.NewGuid().ToString(),  
                    WorkspaceGuid = workspaceGuid,
                };

                await _omniRepository.ProfileRepository.AddEventLog(eventLogs);
            }
            return (isSuccess, status);
        }

        public async Task<(bool, ErrorStatus)> UpdateProject(string projectGuid, ProjectDto projectDto)
        {
            if(projectDto == null)
            {
                return (false, ErrorStatus.PROJECT_DETAILS_NOT_FOUND);
            }
            var updateProject = new Project
            {
                DueDate = projectDto.DueDate,
                EndDate = projectDto.EndDate,
                StartDate = projectDto.StartDate,
                ProjectCategory = (int)projectDto.Category,
                ProjectDescription = projectDto.ProjectDescription,
                ProjectTagline = projectDto.ProjectTagline,
                ProjectName = projectDto.ProjectTitle,
                ProjectLogo = projectDto.ProjectLogo,
                ProjectStatus = (int)projectDto.Status
            };
            var (isSuccess, status) = await _omniRepository.ProjectRepository.UpdateProject(projectGuid, updateProject);
            if (isSuccess)
            {
                EventsLog eventLogs = new EventsLog
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Project.Updated",
                    EventTypeId = (int)EventType.ProjectUpdated,
                    EventGuid = Guid.NewGuid().ToString(),
                    ProjectGuid = projectGuid,
                    Metadata = $"Project '{projectDto.ProjectTitle}' updated."
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventLogs);

            }
            return (isSuccess, status);
        }

        public async Task<ProjectDto> GetProjectById(string workspaceguid,string projectGuid)
        {
            var project = _omniRepository.ProjectRepository.GetProjectById(workspaceguid,projectGuid);
            if(project == null)
            {
                return null;
            }
            var projectDto = new ProjectDto
            {
                ProjectId = project.Result.ProjectId,
                ProjectTitle = project.Result.ProjectName,
                Status = (ProjectEnums.ProjectStatus)project.Result.ProjectStatus,
                ProjectDescription = project.Result.ProjectDescription,
                StartDate = project.Result.StartDate,
                EndDate = project.Result.EndDate,
                DueDate = project.Result.DueDate,
                ProjectGuid = project.Result.ProjectGuid,
                Category = (ProjectEnums.ProjectCategory)project.Result.ProjectCategory,
                ProjectLogo = project.Result.ProjectLogo,
                ProjectTagline = project.Result.ProjectTagline
            };
            return projectDto;
        }

        public async Task<ProjectCard> GetProjectDashboardCard(string projectGuid)
        {
            var sprintDtos = await _omniRepository.SprintRepository.GetProjectSprintStats(projectGuid);

            List<int> sprintIds = sprintDtos.Select(s => s.Id).ToList();

            var ticketDtos = await _omniRepository.TicketRepository.GetSprintTicketsDtos(sprintIds);

            SprintStats sprintStats = new SprintStats
            {
                ActiveSprint = sprintDtos.Count(s => s.Status == SprintEnums.SprintStatus.Active),
                TotalSprints = sprintDtos.Count(),
                CompletedSprint = sprintDtos.Count(s => s.Status == SprintEnums.SprintStatus.Completed)
            };

            TicketStats ticketStats = new TicketStats
            {
                ActiveTickets = ticketDtos.Count(t => t.Status == TicketEnums.TicketStatus.Open),

                CloseTickets = ticketDtos.Count(t => t.Status == TicketEnums.TicketStatus.Closed),

                CompletedStoryPoints = ticketDtos
                    .Where(t => t.Status == TicketEnums.TicketStatus.Closed)
                    .Sum(t => t.Points ?? 0),

                TotalStoryPoints = ticketDtos.Sum(t => t.Points ?? 0),

                TotalTickets = ticketDtos.Count(),

                TotalBugs = ticketDtos.Count(t => t.TypeId == TicketEnums.TicketType.Bug),

                TotalUserStories = ticketDtos.Count(t => t.TypeId == TicketEnums.TicketType.UserStories),
            };

            return new ProjectCard
            {
                SprintStats = sprintStats,
                TicketStats = ticketStats
            };
        }

        public async Task<List<TeamSummaryDto>> GetProjectTeams(string projectGuid)
        {
            var sprintDtos = await _omniRepository.SprintRepository.GetProjectSprintStats(projectGuid);

            List<int> workingTeamIds = sprintDtos.Select(s => s.WorkingTeamId).ToList();
            var teamDtos = await _omniRepository.TeamRepository.GetTeamsBySprintDtos(workingTeamIds);
            return teamDtos;
        }
        public async Task<(bool, ErrorStatus)> DeleteProject(string workspaceId, string projectGuid)
        {
            var (isDeleted,status) = await _omniRepository.ProjectRepository.DeleteProject(workspaceId,projectGuid);
            if(isDeleted)
            {
                EventsLog eventLogs = new EventsLog
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Project.Deleted",
                    EventTypeId = (int)EventType.ProjectDeleted,
                    EventGuid = Guid.NewGuid().ToString(),
                    ProjectGuid = projectGuid,
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventLogs);
                return (true, status);
            }
            return (false, status); 
        }

        public async Task<bool> UpdateProjectStatus(string projectGuid,int projectStatus)
        {
            var isUpdated = await _omniRepository.ProjectRepository.UpdateProjectStatus(projectGuid, projectStatus);
            if(projectStatus == (int)ProjectEnums.ProjectStatus.Completed)
            {
                EventsLog eventLogs = new EventsLog
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Project.Completed",
                    EventTypeId = (int)EventType.ProjectCompleted,
                    EventGuid = Guid.NewGuid().ToString(),
                    ProjectGuid = projectGuid,
                    Metadata = "Project marked as completed."
                };

                EventsLogDto eventLogsDto = new EventsLogDto
                {
                    CreatedAt = DateTime.UtcNow,
                    EventDescription = "Project.Completed",
                    EventTypeId = (int)EventType.ProjectCompleted,
                    EventGuid = Guid.NewGuid().ToString(),
                    ProjectGuid = projectGuid,
                    Metadata = "Project marked as completed."
                };
                await _omniRepository.ProfileRepository.AddEventLog(eventLogs);
                await _eventPublisher.PublishAsync(eventLogsDto, 0);
            }
            return isUpdated;
        }

        public async Task<List<SprintDto>> GetProjectSprints(string projectGuid)
        {
            var result = await _omniRepository.ProjectRepository.GetProjectSprintsAsync(projectGuid);
            return result;
        }

        public async Task<List<ProjectDropdownModel>> GetProjectDropDown(string workspaceGuid)
        {
            var projects = await _omniRepository.ProjectRepository.GetProjectDropdown(workspaceGuid);
            List<ProjectDropdownModel> projectDropdown = new List<ProjectDropdownModel>();

            foreach (var project in projects)
            {
                projectDropdown.Add(new ProjectDropdownModel
                {
                    Name = project.ProjectName,
                    ProjectId = project.ProjectId
                });
            }

            return projectDropdown;

        }
    }
}
