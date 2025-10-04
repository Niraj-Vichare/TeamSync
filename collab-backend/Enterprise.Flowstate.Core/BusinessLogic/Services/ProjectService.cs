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
        public ProjectService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }

        public Task<bool> CreateProject(int workspaceId, string name, string description)
        {
            return null;
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

        public Task<(bool, ErrorStatus)> DeleteProject(string workspaceId, string projectGuid)
        {
            return _omniRepository.ProjectRepository.DeleteProject(workspaceId,projectGuid);
        }

        public Task<bool> UpdateProjectStatus(string projectGuid,int projectStatus)
        {
            return _omniRepository.ProjectRepository.UpdateProjectStatus(projectGuid, projectStatus);
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
