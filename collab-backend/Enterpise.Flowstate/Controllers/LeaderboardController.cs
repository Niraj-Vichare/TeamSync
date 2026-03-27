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
        private readonly IOmniService _omniService;

        public LeaderboardController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaderboard(
            [FromQuery] string workspaceId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null || string.IsNullOrEmpty(workspaceId))
                return Unauthorized();

            var result = await _omniService.LeaderboardComparisonService
                .GetLeaderboardWithComparisonAsync(workspaceId, pageNumber, pageSize);

            if (result == null)
                return StatusCode(500);

            return Ok(result);
        }

        [HttpGet("ranking-history")]
        public async Task<IActionResult> GetUserRankingHistory([FromQuery] string workspaceGuid)
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null)
                return Unauthorized();

            var history = await _omniService.LeaderboardComparisonService
                .GetUserRankingHistory(workspaceGuid, userId);

            if (history == null)
                return NotFound(new ApiResponseModel<object> { Success = false });

            return Ok(new ApiResponseModel<object>
            {
                Data = history,
                Message = "User ranking history retrieved successfully.",
                Success = true
            });
        }

        // Centralize claim extraction — not repeated in every action
        private string GetAuthenticatedUserId()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            var claim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out _) ? claim : null;
        }
    }
}
