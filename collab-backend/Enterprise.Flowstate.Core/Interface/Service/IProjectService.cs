using Enterprise.Flowstate.BAL.DTOs;
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
    }
}
