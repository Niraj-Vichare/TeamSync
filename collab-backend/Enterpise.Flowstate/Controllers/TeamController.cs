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

        #region Members Methods

        [HttpPost("member/create")]
        public async Task<ApiResponseModel<object>> AddMember([FromQuery] string workspaceGuid, [FromBody] TeamMemberDto mapping)
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
        [Route("members")]
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

        [HttpPost("member/{memberId}/delete")]
        public async Task<ApiResponseModel<object>> DeleteMember([FromQuery] string workspaceGuid,int profileId)
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
                await _omniService.TeamService.DeleteMember(workspaceGuid, profileId);

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

        [HttpGet("department")]
        public async Task<ApiResponseModel<object>> GetDepartmentWiseTeam([FromQuery] string workspaceGuid)
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


                var result = await _omniService.TeamService.GetDepartmentWiseMembers(workspaceGuid);

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


        [HttpPut("member")]
        public async Task<ApiResponseModel<object>> UpdateMember([FromQuery] string workspaceGuid,[FromBody] TeamMemberDto mapping)
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

                var result = await _omniService.TeamService.UpdateMember(workspaceGuid, mapping);
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

        #endregion

        #region Teams Methods

        [HttpGet("custom")]
        public async Task<ApiResponseModel<object>> GetCustomTeam([FromQuery] string workspaceGuid)
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


                var result = await _omniService.TeamService.GetCustomTeams(workspaceGuid);

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
        
        [HttpDelete("{teamId}/remove")]
        public async Task<ApiResponseModel<object>> RemoveMemberFromTeam([FromQuery]string workspaceGuid,[FromRoute] int teamId)
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
                var result = await _omniService.TeamService.RemoveTeam(teamId);

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

        [HttpPatch("update")]
        public async Task<ApiResponseModel<object>> UpdateTeam([FromQuery] string workspaceGuid, TeamDto team)
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
                var result = await _omniService.TeamService.UpdateTeam(workspaceGuid, team);

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

        [HttpPost("create")]
        public async Task<ApiResponseModel<object>> CreateTeam([FromQuery] string workspaceGuid, TeamDto teamDto)
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

                teamDto.WorkspaceGuid = workspaceGuid;
                var result = await _omniService.TeamService.AddCustomTeam(teamDto);

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

        [HttpPost("{teamId}/delete")]
        public async Task<ApiResponseModel<object>> DeleteTeam([FromQuery] string workspaceGuid, int teamId)
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
                var result = await _omniService.TeamService.RemoveTeam(teamId);

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

        [HttpPost("custom/member/add")]
        public async Task<ApiResponseModel<object>> AddTeamMember([FromQuery] string workspaceGuid, [FromBody] TeamMemberMapping teamMemberMapping)
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
                if (teamMemberMapping.MemberId == 0)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Member is not selected",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                if (teamMemberMapping.TeamId == 0)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Team is not selected",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                await _omniService.TeamService.AddTeamMemberMapping(teamMemberMapping.MemberId, (int)teamMemberMapping.TeamId, teamMemberMapping.IsLeader);

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


        [HttpPost("custom/member/remove")]
        public async Task<ApiResponseModel<object>> RemoveTeamMember([FromQuery] string workspaceGuid,TeamMemberMapping mapping)
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
                if (mapping.MemberId == 0)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Member is not selected",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                if (mapping.TeamId == 0)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Team is not selected",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                await _omniService.TeamService.DeleteTeamMemberMapping(mapping.MemberId, (int)mapping.TeamId, mapping.IsLeader);

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

        #endregion


        [HttpGet]
        [Route("dropdown")]
        public async Task<List<TeamDropdownModel>> TeamDropdown([FromQuery]string workspaceGuid)
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
                var result = await _omniService.TeamService.GetTeamDropDown(workspaceGuid);

                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
