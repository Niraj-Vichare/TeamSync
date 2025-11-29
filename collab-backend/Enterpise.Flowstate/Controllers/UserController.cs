using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterpise.Flowstate.Controllers
{
    [Route("[controller]")]
    public class UserController : AuthBaseController
    {
        private IOmniService _omniService;
        public UserController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpGet("profile")]
        public async Task<ApiResponseModel<object>> GetProfile()
        {
            try
            {
                // Get user ID from the JWT token
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

                var profile = await _omniService.ProfileService.GetProfile(userIdClaim);

                if (profile == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "User profile not found",
                        Success = false
                    };
                }

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Message = "Profile retrieved successfully",
                    Success = true,
                    Data = profile
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error retrieving user profile");

                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }

        [HttpGet("work")]
        public async Task<ApiResponseModel<object>> GetUserWork([FromQuery] string workspaceGuid)
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
                var result = await _omniService.DashboardService.GetUserWorkMetric(workspaceGuid,userId.ToString());
                if(result == null || result.Count == 0)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status404NotFound,
                        Message = "No work metrics found",
                        Success = false
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = result,
                    Message = "User work metrics retrieved successfully",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true
                };


            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error retrieving user profile");

                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }
    }
}
    