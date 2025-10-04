using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterpise.Flowstate.Controllers
{
    [Route("projects")]
    public class ProjectController : AuthBaseController
    {
        private readonly IOmniService _omniService;

        public ProjectController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpGet("ongoing")]
        public async Task<ApiResponseModel<object>> GetOngoingProject()
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                var ongoingProject = await _omniService.ProjectService.GetOngoingProject(userId.ToString());
                if (ongoingProject == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status200OK,
                        Success = true,
                        Data = null,
                        Message = "There is no project for the user."
                    };
                }
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully get projects for user a workspace",
                    Data = ongoingProject

                };
            } catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message,
                };
            }
        }

        [HttpPost]
        public async Task<ApiResponseModel<object>> CreateProject([FromQuery] string workspaceGuid, ProjectDto project)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status401Unauthorized
                    );
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.WORKSPACEGUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }

                    var (isSuccess, status) = await _omniService.ProjectService.CreateProject(workspaceGuid, project);

                if (!isSuccess)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        status,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status201Created

                );
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Status = ErrorStatus.FAILURE.ToString(),
                    Message = ex.Message,
                    Data = null
                };
            }
        }

        [HttpPut]
        public async Task<ApiResponseModel<object>> UpdateProject([FromQuery] string projectGuid, ProjectDto project)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status401Unauthorized
                    );
                }

                if (string.IsNullOrEmpty(projectGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.WORKSPACEGUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }

                var (isSuccess, status) = await _omniService.ProjectService.UpdateProject(projectGuid, project);

                if (!isSuccess)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        status,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status200OK

                );
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Status = ErrorStatus.FAILURE.ToString(),
                    Message = ex.Message,
                    Data = null
                };
            }
        }

        [HttpGet("{projectGuid}")]
        public async Task<ApiResponseModel<object>> GetProject(string workspaceGuid,[FromRoute] string projectGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status401Unauthorized
                    );
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.WORKSPACEGUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }
                if (string.IsNullOrEmpty(projectGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.PROJECT_GUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }

                ProjectDto project = await _omniService.ProjectService.GetProjectById(workspaceGuid, projectGuid);

                if (project == null)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status200OK,
                    project
                );
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Status = ErrorStatus.FAILURE.ToString(),
                    Message = ex.Message,
                    Data = null
                };
            }
        }

        [HttpDelete]
        public async Task<ApiResponseModel<object>> DeleteProject([FromQuery] string workspaceGuid,[FromQuery] string projectGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status401Unauthorized
                    );
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.WORKSPACEGUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }
                if (string.IsNullOrEmpty(projectGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.PROJECT_GUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                }

                var (isSuccess, status) = await _omniService.ProjectService.DeleteProject(workspaceGuid,projectGuid);

                if (!isSuccess)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        status,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status200OK

                );
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Status = ErrorStatus.FAILURE.ToString(),
                    Message = ex.Message,
                    Data = null
                };
            }
        }

        [HttpPatch("{projectGuid}/status")]
        public async Task<ApiResponseModel<object>> UpdateProjectStatus([FromRoute] string projectGuid, int status)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status401Unauthorized
                    );
                }

                if (string.IsNullOrEmpty(projectGuid))
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.PROJECT_GUID_NOT_FOUND,
                        StatusCodes.Status404NotFound
                    );
                };
                

                var result = await _omniService.ProjectService.UpdateProjectStatus(projectGuid, status);

                if (!result)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status200OK

                );
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Status = ErrorStatus.FAILURE.ToString(),
                    Message = ex.Message,
                    Data = null
                };
            }
        }

        [HttpGet]
        public async Task<ApiResponseModel<object>> GetProjects([FromQuery] string workspaceGuid, [FromQuery] string? search = null,[FromQuery] string? status = null,[FromQuery] int pageNumber = 1,[FromQuery] int pageSize = 10)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Not a valid workspace id",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }
                var result = await _omniService.ProjectService.GetUserProjects(
                    workspaceGuid, search, status, pageNumber, pageSize
                );

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully retrieved projects.",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message,
                };
            }
        }

        [HttpGet("dropdown")]
        public async Task<List<ProjectDropdownModel>> GetProjectDropdowns([FromQuery]string workspaceGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return null;
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return null;
                }
                var result = await _omniService.ProjectService.GetProjectDropDown(workspaceGuid);

                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        } 
    }
}
