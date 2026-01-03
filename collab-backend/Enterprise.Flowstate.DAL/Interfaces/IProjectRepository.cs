using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Interfaces
{
    /// <summary>
    /// Provides data access operations for managing projects within a workspace,
    /// including retrieval, creation, update, deletion, and status management.
    /// </summary>
    public interface IProjectRepository
    {
        /// <summary>
        /// Retrieves a paginated list of projects for a workspace with optional
        /// search and status filtering.
        /// </summary>
        Task<(List<Project> Projects, int TotalCount)> GetUserProjectsAsync(string workspaceGuid,string search,string status,int pageNumber,int pageSize);

        /// <summary>
        /// Retrieves a limited list of ongoing projects for a workspace.
        /// </summary>
        Task<List<Project>> GetOngoingProjects(string workspaceId, int limit = 3);

        /// <summary>
        /// Creates a new project within the specified workspace.
        /// </summary>
        Task<(bool, GeneralEnums.ErrorStatus)> CreateProject(string workspaceGuid,Project project);

        /// <summary>
        /// Updates an existing project using its unique identifier.
        /// </summary>
        Task<(bool, GeneralEnums.ErrorStatus)> UpdateProject(string projectGuid,Project project);

        /// <summary>
        /// Retrieves a project by its unique identifier within a workspace.
        /// </summary>
        Task<Project> GetProjectById(string workspaceId, string projectGuid);

        /// <summary>
        /// Deletes a project from the specified workspace.
        /// </summary>
        Task<(bool, GeneralEnums.ErrorStatus)> DeleteProject(
            string workspaceId,
            string projectGuid);

        /// <summary>
        /// Updates the status of an existing project.
        /// </summary>
        Task<bool> UpdateProjectStatus(string projectGuid, int projectStatus);

        /// <summary>
        /// Retrieves a lightweight list of projects intended for dropdown selection.
        /// </summary>
        Task<List<Project>> GetProjectDropdown(string workspaceGuid);
    }

}
