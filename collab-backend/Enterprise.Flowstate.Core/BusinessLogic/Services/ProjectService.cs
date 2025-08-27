using Enterprise.Flowstate.BAL.DTOs;
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
                Status = (ProjectEnums.ProjectStatus)project.ProjectStatus
            }).ToList();

            return projectDtos;
        }

        public async Task<Datatable<ProjectDto>> GetUserProjects(string userClaims,string search,string status,int pageNumber,int pageSize)
        {
            var (projects, totalCount) = await _omniRepository.ProjectRepository.GetUserProjectsAsync(userClaims, search, status, pageNumber, pageSize);

            var items = projects.Select(p => new ProjectDto
            {
                ProjectId = p.ProjectId,
                ProjectTitle = p.ProjectName,
                Status = (ProjectEnums.ProjectStatus)p.ProjectStatus,
                ProjectDescription = p.ProjectDescription,  
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                DueDate = p.DueDate,
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
                ProjectStatus = (int)projectDto.Status
            };

            var (isSuccess,status) = await _omniRepository.ProjectRepository.CreateProject(workspaceGuid, project);
            return (isSuccess, status);
        }
    }
}
