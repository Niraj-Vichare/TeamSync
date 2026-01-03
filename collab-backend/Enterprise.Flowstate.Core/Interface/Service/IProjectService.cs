using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    /// <summary>
    /// Defines project-related operations such as creation, retrieval, update,
    /// deletion, status management, and user-specific project queries.
    /// </summary>
    public interface IProjectService
    {
        /// <summary>
        /// Retrieves a paginated list of projects associated with the current user,
        /// with optional filtering by search keyword and project status.
        /// </summary>
        /// <param name="userClaims">Serialized user identity and authorization claims.</param>
        /// <param name="search">Search keyword to filter projects by name or description.</param>
        /// <param name="status">Project status filter (e.g., Active, Completed).</param>
        /// <param name="pageNumber">Page number for pagination (1-based index).</param>
        /// <param name="pageSize">Number of records per page.</param>
        /// <returns>Paginated project data wrapped in a datatable structure.</returns>
        Task<Datatable<ProjectDto>> GetUserProjects(string userClaims,string search,string status,int pageNumber,int pageSize);

        /// <summary>
        /// Retrieves all ongoing projects associated with the current user.
        /// </summary>
        /// <param name="userClaims">Serialized user identity and authorization claims.</param>
        /// <returns>List of ongoing projects.</returns>
        Task<List<ProjectDto>> GetOngoingProject(string userClaims);

        /// <summary>
        /// Creates a new project within the specified workspace.
        /// </summary>
        /// <param name="workspaceGuid">Unique identifier of the workspace.</param>
        /// <param name="project">Project details to be created.</param>
        /// <returns>
        /// A tuple indicating success or failure along with an error status if the operation fails.
        /// </returns>
        Task<(bool, ErrorStatus)> CreateProject(string workspaceGuid,ProjectDto project);

        /// <summary>
        /// Updates an existing project using its unique identifier.
        /// </summary>
        /// <param name="projectGuid">Unique identifier of the project.</param>
        /// <param name="project">Updated project details.</param>
        /// <returns>
        /// A tuple indicating success or failure along with an error status if the operation fails.
        /// </returns>
        Task<(bool, ErrorStatus)> UpdateProject(string projectGuid,ProjectDto project);

        /// <summary>
        /// Retrieves a project by its unique identifier within a workspace.
        /// </summary>
        /// <param name="workspaceId">Unique identifier of the workspace.</param>
        /// <param name="projectGuid">Unique identifier of the project.</param>
        /// <returns>Project details if found; otherwise null.</returns>
        Task<ProjectDto> GetProjectById(string workspaceId,string projectGuid);

        /// <summary>
        /// Deletes a project from the specified workspace.
        /// </summary>
        /// <param name="workspaceId">Unique identifier of the workspace.</param>
        /// <param name="projectGuid">Unique identifier of the project.</param>
        /// <returns>
        /// A tuple indicating success or failure along with an error status if the operation fails.
        /// </returns>
        Task<(bool, ErrorStatus)> DeleteProject(string workspaceId,string projectGuid);

        /// <summary>
        /// Updates the status of an existing project.
        /// </summary>
        /// <param name="projectGuid">Unique identifier of the project.</param>
        /// <param name="projectStatus">New status value of the project.</param>
        /// <returns>True if the status was updated successfully; otherwise false.</returns>
        Task<bool> UpdateProjectStatus(string projectGuid,int projectStatus);

        /// <summary>
        /// Retrieves a lightweight list of projects for dropdown selection
        /// within the specified workspace.
        /// </summary>
        /// <param name="workspaceGuid">Unique identifier of the workspace.</param>
        /// <returns>List of projects formatted for dropdown usage.</returns>
        Task<List<ProjectDropdownModel>> GetProjectDropDown(string workspaceGuid);
    }


}
