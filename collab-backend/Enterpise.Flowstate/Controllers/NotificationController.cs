using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Enterprise.Flowstate.Configuration;

namespace Enterprise.Flowstate.Controllers
{
    [Route("notifications")]
    public class NotificationController : AuthBaseController
    {
        private readonly IOmniService _omniService;

        public NotificationController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpGet]
        public async Task<ApiResponseModel<object>> GetNotifications(
            [FromQuery] int   pageNumber = 1,
            [FromQuery] int   pageSize   = 20,
            [FromQuery] bool? isRead     = null)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized401<object>();

            int profileId = await _omniService.ProfileService.GetProfileId(userId);
            if(profileId <= 0)
            {
                return Unauthorized401<object>();
            }

            var notifications = await _omniService.NotificationService.GetUserNotificationsAsync(profileId, pageNumber, pageSize);
            if (!notifications.Any())
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    Message = "No notification",
                    Success = false,
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            return new ApiResponseModel<object>
            {
                Success    = true,
                StatusCode = StatusCodes.Status200OK,
                Data       = notifications
            };
        }

        [HttpGet("unread-count")]
        public async Task<ApiResponseModel<object>> GetUnreadCount()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized401<object>();

            int profileId = await _omniService.ProfileService.GetProfileId(userId);
            if (profileId <= 0)
                return NotFound404<object>("Profile not found");

            int count = await _omniService.NotificationService.GetUnreadCountAsync(profileId);

            return new ApiResponseModel<object>
            {
                Success    = true,
                StatusCode = StatusCodes.Status200OK,
                Data       = new { count }
            };
        }


        [HttpPatch("{id:long}/read")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> MarkRead([FromRoute] long id)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized401<object>();

            int profileId = await _omniService.ProfileService.GetProfileId(userId);
            if (profileId <= 0)
                return NotFound404<object>("Profile not found");

            await _omniService.NotificationService.MarkAsReadAsync(id);
            return new ApiResponseModel<object>
            {
                Success    = true,
                StatusCode = StatusCodes.Status200OK,
                Message    = "Notification marked as read."
            };
        }

        [HttpPatch("read-all")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> MarkAllRead()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized401<object>();

            int profileId = await _omniService.ProfileService.GetProfileId(userId);
            if (profileId <= 0)
                return NotFound404<object>("Profile not found");

            await _omniService.NotificationService.MarkAllAsReadAsync(profileId);

            return new ApiResponseModel<object>
            {
                Success    = true,
                StatusCode = StatusCodes.Status200OK,
                Message    = $"Notification(s) marked as read."
            };
        }


        private string? GetUserId()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            var claim    = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out _) ? claim : null;
        }

        private static ApiResponseModel<T> Unauthorized401<T>() => new()
        {
            Success    = false,
            StatusCode = StatusCodes.Status401Unauthorized,
            Message    = "Authentication failed."
        };

        private static ApiResponseModel<T> NotFound404<T>(string msg) => new()
        {
            Success    = false,
            StatusCode = StatusCodes.Status404NotFound,
            Message    = msg
        };
    }
}