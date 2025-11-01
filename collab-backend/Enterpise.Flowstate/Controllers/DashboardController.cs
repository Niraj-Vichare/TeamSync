using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpGet("timer/status")]
        public async Task<ApiResponseModel<object>> GetTimerStatus([FromQuery] string workspaceGuid)
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
                var activeTimer = await _omniService.DashboardService.GetTodayLogging(workspaceGuid, userIdClaim);

                if (activeTimer == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = new { IsRunning = false },
                        Success = true,
                        StatusCode = StatusCodes.Status200OK
                    };
                }

                return new ApiResponseModel<object>
                {
                    Data = new
                    {
                        IsRunning = true,
                        ClockInTime = activeTimer.CheckIn,
                        TimerId = activeTimer.Id
                    },
                    Success = true,
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

                // Check if the user has an active timer
                var activeTimer = await _omniService.DashboardService.ClockIn(workspaceGuid, userIdClaim);

                return new ApiResponseModel<object>
                {
                    Success = activeTimer,
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
        public async Task<ApiResponseModel<object>> ClockOut([FromQuery] string workspaceGuid)
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
                var activeTimer = await _omniService.DashboardService.ClockOut(workspaceGuid, userIdClaim);

                return new ApiResponseModel<object>
                {
                    Success = activeTimer,
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
