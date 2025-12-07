using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterprise.Flowstate.Controllers
{
    [Route("leaderboard")]
    public class LeaderboardController : AuthBaseController
    {
        public IOmniService _omniService;
        public LeaderboardController(IOmniService omniService)
        {
            _omniService = omniService;
        }
        [HttpGet]
        public async Task<LeaderboardResponse> GetLeaderboardWithComparisonAsync([FromQuery]string workspaceId,[FromQuery]int pageNumber,[FromQuery]int pageSize)
        {  
            try
            {
                var leaderboardResponse = await _omniService.LeaderboardComparisonService.GetLeaderboardWithComparisonAsync(workspaceId, pageNumber, pageSize);
                return leaderboardResponse;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        [HttpGet("ranking-history")]
        public async Task<ApiResponseModel<object>> GetUserRankingHistory([FromQuery]string workspaceGuid)
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
                var leaderboardHistory = await _omniService.LeaderboardComparisonService.GetUserRankingHistory(workspaceGuid,userId.ToString());
                if(leaderboardHistory == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = leaderboardHistory,
                    Message = "User ranking history retrieved successfully.",
                    Success = true,
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
    }
}
