using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;
using System.Security.Claims;
using Enterprise.Flowstate.BAL.Interface.Service;

namespace Enterpise.Flowstate.Controllers
{
    [Route("teams")]
    public class TeamController : AuthBaseController
    {
        private IOmniService _omniService;
        public TeamController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpPost]
        public async Task<ApiResponseModel<object>> AddMember(string workspaceGuid, TeamMemberWorkspaceMapping mapping)
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
                

                var result = await _omniService.TeamService.AddMember(workspaceGuid, mapping);

                if (result)
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
        [Route("/members")]
        public async Task<ApiResponseModel<object>> GetMembers([FromQuery] string workspaceGuid, [FromQuery] string? search = null, [FromQuery] string? filter = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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


                var result = await _omniService.TeamService.GetTeamMembers(workspaceGuid);

                if (result == null)
                {
                    return ApiResponseHelper.FromErrorStatus<object>(
                        ErrorStatus.FAILURE,
                        StatusCodes.Status400BadRequest
                    );
                }

                return ApiResponseHelper.FromErrorStatus<object>(
                    ErrorStatus.SUCCESS,
                    StatusCodes.Status200OK,
                    result
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
        //public async Task<ApiResponseModel<object>> DeleteMember()
        //{

        //}

        //public async Task<ApiResponseModel<object>> RemoveMemberFromTeam()
        //{

        //}

        //public async Task<ApiResponseModel<object>> EditMember()
        //{

        //}

        //public async Task<ApiResponseModel<object>> UpdateTeam()
        //{

        //}
        //public async Task<ApiResponseModel<object>> CreateTeam()
        //{

        //}
    }
}
