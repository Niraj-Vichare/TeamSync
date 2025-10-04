using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class SprintService:ISprintService
    {
        private IOmniRepository _omniRepository;
        public SprintService(IOmniRepository omniRepository)
        {
            _omniRepository = omniRepository;
        }

        public async Task<bool> CreateSprint(string userId, SprintDto sprintDto)
        {
            Sprint sprint = new Sprint
            {
                CreatedAt = DateTime.UtcNow,
                Title = sprintDto.Title,
                Description = sprintDto.Goal,
                UpdateDate = sprintDto.UpdateDate,
                EndDate = sprintDto.EndDate,
                ProjectId = sprintDto.ProjectId,
                StartDate = sprintDto.StartDate,
                StatusId = (int)sprintDto.Status,
                Tagline = sprintDto.Tagline,
                Tags = sprintDto.Tags,
                SprintGuid = Guid.NewGuid().ToString(),
                WorkingTeamId = sprintDto.TeamModel.TeamId
            };

            var result = await _omniRepository.SprintRepository.CreateSprint(userId, sprint);
            return result;
        }
        
        public async Task<PaginationResponse<SprintDto>> GetSprints(string workspaceGuid,string searchTerm, string statusFilter,string projectFilter, int pageNumber,int pageSize)
        {

            // Call repository with filters and pagination
            var sprints = await _omniRepository.SprintRepository.GetSprintsAsync(workspaceGuid, searchTerm,
                statusFilter,
                projectFilter,
                pageNumber,
                pageSize
            );

            List<SprintDto> result = new List<SprintDto>(); 
            foreach (var sprint in sprints)
            {
                result.Add(new SprintDto
                {
                    EndDate = sprint.EndDate,
                    Goal = sprint.Description,
                    Id = sprint.SprintId,
                    ProjectId = sprint.ProjectId,
                    ProjectName = sprint.Project.ProjectName,
                    StartDate = sprint.StartDate,
                    Tagline = sprint.Tagline,
                    Status = (SprintEnums.SprintStatus)sprint.StatusId,
                    Tags = sprint.Tags,
                    Title = sprint.Title,
                    UpdateDate = sprint.UpdateDate,
                    SprintGuid = sprint.SprintGuid,
                    TeamModel = new TeamDropdownModel
                    {
                        TeamId = sprint.Team.TeamId,
                        TeamName = sprint.Team.TeamName
                    }
                });
            }


            // Prepare pagination response
            var totalCount = await _omniRepository.SprintRepository.GetSprintsCountAsync(workspaceGuid, searchTerm, statusFilter, projectFilter);

            return new PaginationResponse<SprintDto>
            {
                Data = result,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
    }
}
