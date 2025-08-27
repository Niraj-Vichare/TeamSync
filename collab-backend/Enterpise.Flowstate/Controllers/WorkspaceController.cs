using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterpise.Flowstate.Controllers
{
    [Route("workspace")]
    public class WorkspaceController : AuthBaseController
    {
        private readonly IOmniService _omniService;
        public WorkspaceController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpPost]
        [Route("create-workspace")]
        public async Task<ApiResponseModel<object>> CreateWorkspace(string workspaceName, string workspaceDescription)
        {
            try
            {
                if (workspaceName == null || workspaceDescription == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Workspace name and description cannot be null"
                    };
                }

                // Can user create the workspaces.
                
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
                bool isCreated = await _omniService.WorkspaceService.CreateWorkspace(userId.ToString(), workspaceName, workspaceDescription);
                if (!isCreated)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Failed to create workspace"
                    };

                }
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully created an workspace for the user"
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

        [HttpGet("workspaces")]
        public async Task<ApiResponseModel<object>> GetWorkspaces()
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
                var workspaces = await _omniService.WorkspaceService.GetAllWorkspaces(userId.ToString());
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully get an workspace user workspace",
                    Data = workspaces

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

        [HttpGet]
        [Route("{workspaceId}")]
        public async Task<ApiResponseModel<object>> GetWorkspace(string workspaceId)
        {
            try
            {

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully get an workspace user workspace",
                    Data = null

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

        [HttpDelete]
        [Route("delete-workspace/{workspaceId}")]
        public async Task<ApiResponseModel<object>> DeleteWorkspace(string workspaceId)
        {
            try
            {

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully deleted an workspace.",
                    Data = null

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

        [HttpPost]
        [Route("join-workspace/{workspaceId}")]
        public async Task<ApiResponseModel<object>> JoinWorkspace(string workspaceId)
        {
            try
            {

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully get an workspace user workspace",
                    Data = null

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

        [HttpPost("update-workspace")]
        public async Task<ApiResponseModel<object>> UpdateWorkspaceConfigs()
        {
            try
            {

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully updated an workspace user workspace",
                    Data = null

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
