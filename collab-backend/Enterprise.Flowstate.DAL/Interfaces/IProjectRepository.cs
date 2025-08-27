using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    public interface IProjectRepository
    {
        Task<(List<Project> Projects, int TotalCount)> GetUserProjectsAsync(string workspaceGuid, string search, string status, int pageNumber, int pageSize);
        Task<List<Project>> GetOngoingProjects(string workspaceId, int limit=3);
        Task<(bool,GeneralEnums.ErrorStatus)> CreateProject(string workspaceGuid, Project project);
    }
}
