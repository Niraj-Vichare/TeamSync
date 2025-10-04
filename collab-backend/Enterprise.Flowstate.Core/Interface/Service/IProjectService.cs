using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IProjectService
    {
        Task<Datatable<ProjectDto>> GetUserProjects(string userClaims,string search,string status,int pageNumber,int pageSize);
        Task<List<ProjectDto>> GetOngoingProject(string userClaims);
        Task<(bool,ErrorStatus)> CreateProject(string workspaceGuid, ProjectDto project);
        Task<(bool,ErrorStatus)> UpdateProject(string projectGuid, ProjectDto project);
        Task<ProjectDto> GetProjectById(string workspaceId,string projectGuid);
        Task<(bool, ErrorStatus)> DeleteProject(string workspaceId,string projectGuid);
        Task<bool> UpdateProjectStatus(string projectGuid, int projectStatus);
        Task<List<ProjectDropdownModel>> GetProjectDropDown(string workspaceGuid);
    }
}
