using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterpise.Flowstate.Controllers
{
    [Route("project")]
    public class ProjectController : AuthBaseController
    {
        private readonly IOmniService _omniService;
        public ProjectController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpGet("ongoing-projects")]
        public async Task<ApiResponseModel<object>> GetOngoingProject()
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim,out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                var ongoingProject = await _omniService.ProjectService.GetOngoingProject(userId.ToString());
                if(ongoingProject == null)
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
            }catch(Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message,
                };
            }
        }

        [HttpPost("create-project")]
        public async Task<ApiResponseModel<object>> CreateProject(string workspaceGuid, ProjectDto project)
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



        [HttpGet("projects")]
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

    }
}
