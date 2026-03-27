

using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace Enterprise.Flowstate.BAL.Filters
{
    /// <summary>
    /// Combined authorization: Checks both Role AND Plan features
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireAuthorizationAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly AuthEnums.RoleEnum[] _allowedRoles;
        private readonly PlanEnums.PlanFeature? _requiredFeature;

        /// <summary>
        /// Role-only authorization
        /// </summary>
        public RequireAuthorizationAttribute(params AuthEnums.RoleEnum[] roles)
        {
            _allowedRoles = roles;
            _requiredFeature = null;
        }

        /// <summary>
        /// Role + Plan feature authorization
        /// </summary>
        public RequireAuthorizationAttribute(PlanEnums.PlanFeature feature, params AuthEnums.RoleEnum[] roles)
        {
            _allowedRoles = roles;
            _requiredFeature = feature;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // Guard 1: Reject any request that has not been authenticated.
            // Previously these context.Result assignments were commented out,
            // meaning unauthenticated callers silently fell through the filter.
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = "User not authenticated"
                })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;

            }

            //var userId = user.FindFirst("sub")?.Value;

            // workspaceId is carried in the X-Workspace-ID request header and
            // added to claims by the auth middleware, or extracted from the token.
            // If it is missing the request context is incomplete — reject it.
            var workspaceId = context.HttpContext.Request.Headers["X-Workspace-ID"].FirstOrDefault()
                              ?? user.FindFirst("workspaceId")?.Value;

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Guard 2: Reject requests where user identity or workspace context is missing.
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(workspaceId))
            {
                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = "Invalid user context: userId or workspaceId is missing"
                })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }

            var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthorizationService>();

            // 1. Check Role Permission
            if (_allowedRoles != null && _allowedRoles.Length > 0)
            {
                var userRoleClaim = user.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(userRoleClaim) || !int.TryParse(userRoleClaim, out int userRole))
                {
                    context.Result = new ForbidResult();
                    return;
                }

                bool hasRolePermission = _allowedRoles.Any(r => (int)r == userRole);

                if (!hasRolePermission)
                {
                    context.Result = new ObjectResult(new
                    {
                        success = false,
                        message = "Insufficient role permissions",
                        requiredRoles = _allowedRoles,
                        userRole = userRole
                    })
                    {
                        StatusCode = StatusCodes.Status403Forbidden
                    };
                    return;
                }
            }

            // 2. Check Plan Feature
            if (_requiredFeature.HasValue)
            {
                bool hasFeature = await authService.HasFeature(workspaceId, _requiredFeature.Value);

                if (!hasFeature)
                {
                    context.Result = new ObjectResult(new
                    {
                        success = false,
                        message = "Plan upgrade required",
                        requiredFeature = _requiredFeature.Value.ToString(),
                        upgradeUrl = "/settings/billing"
                    })
                    {
                        StatusCode = StatusCodes.Status402PaymentRequired
                    };
                    return;
                }
            }
        }
    }
}
