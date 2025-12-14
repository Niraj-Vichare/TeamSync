using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.Controllers
{
    [Route("dashboard")]
    public class DashboardController : AuthBaseController
    {
        public IOmniService _omniService;
        public DashboardController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpGet]
        [Route("metrics")]
        public async Task<ApiResponseModel<object>> GetDashboardCards([FromQuery] string workspaceGuid)
        {
            try
            {

                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return null;
                }
                var result = await _omniService.DashboardService.GetUserMetric(workspaceGuid,userIdClaim);
                if(result == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        StatusCode = StatusCodes.Status204NoContent,
                        Success = false,
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = result,
                    Success = true,
                    StatusCode = StatusCodes.Status200OK,
                };
                  
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status204NoContent,
                    Data = ex.Data
                };
            }
        }

        [HttpGet]
        [Route("weekly-logs")]
        public async Task<ApiResponseModel<object>> GetWeeklyLogging([FromQuery] string workspaceGuid)
        {
            try
            {

                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return null;
                }
                var result = await _omniService.DashboardService.GetWeeklyDailyLoggingMetrics(workspaceGuid, userIdClaim);
                if (result == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        StatusCode = StatusCodes.Status204NoContent,
                        Success = false,
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = result,
                    Success = true,
                    StatusCode = StatusCodes.Status200OK,
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status204NoContent,
                    Data = ex.Data
                };
            }
        }


        [HttpPost("timer/clockin")]
        public async Task<ApiResponseModel<object>> ClockIn([FromQuery] string workspaceGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                // Call repository
                var result = await _omniService.DashboardService.ClockIn(workspaceGuid, userIdClaim);

                // Get current status for frontend
                var status = await _omniService.DashboardService.GetCurrentStatus(workspaceGuid, userIdClaim);

                // Map enum to user-friendly message
                string message = result switch
                {
                    ClockActionResult.Success => "Clocked in successfully.",
                    ClockActionResult.AlreadyClockedIn => "Already clocked in.",
                    ClockActionResult.AlreadyClockedOut => "Already clocked out for today.",
                    ClockActionResult.InvalidWorkspaceOrUser => "Invalid workspace or user.",
                    _ => "Unknown error."
                };

                return new ApiResponseModel<object>
                {
                    Success = result == ClockActionResult.Success,
                    Data = status,
                    Message = message,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    Success = false,
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        [HttpPost("timer/clockout")]
        public async Task<ApiResponseModel<object>> ClockOut([FromQuery] string workspaceGuid, [FromQuery] bool isAutomatic = false)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                var result = await _omniService.DashboardService.ClockOut(workspaceGuid, userIdClaim, isAutomatic);
                var status = await _omniService.DashboardService.GetCurrentStatus(workspaceGuid, userIdClaim);

                string message = result switch
                {
                    ClockActionResult.Success => "Clocked in successfully.",
                    ClockActionResult.AlreadyClockedIn => "Already clocked in.",
                    ClockActionResult.AlreadyClockedOut => "Already clocked out for today.",
                    ClockActionResult.InvalidWorkspaceOrUser => "Invalid workspace or user.",
                    _ => "Unknown error."
                };

                return new ApiResponseModel<object>
                {
                    Success = result == ClockActionResult.Success,
                    Data = status,
                    Message = message,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    Success = false,
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        [HttpGet("timer/status")]
        public async Task<ApiResponseModel<ClockStatusDto>> GetTimerStatus([FromQuery] string workspaceGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return new ApiResponseModel<ClockStatusDto>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<ClockStatusDto>
                    {
                        Data = null,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                var status = await _omniService.DashboardService.GetCurrentStatus(workspaceGuid, userIdClaim);

                return new ApiResponseModel<ClockStatusDto>
                {
                    Success = true,
                    Data = status,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<ClockStatusDto>
                {
                    Data = null,
                    Success = false,
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }


        [HttpGet("user-contribution")]
        public async Task<ApiResponseModel<object>> GetUserContribution(string workspaceGuid, string userGuid)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                // Check if the user has an active timer
                var userContributions = await _omniService.DashboardService.GetUserContribution(workspaceGuid, userIdClaim);

                return new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "User contributions retrieved successfully.",
                    Data = userContributions,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    Success = false,
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
