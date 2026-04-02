using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.BAL.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireAuthorizationAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly AuthEnums.RoleEnum[] _allowedRoles;
        private readonly PlanEnums.PlanFeature? _requiredFeature;

        public RequireAuthorizationAttribute(params AuthEnums.RoleEnum[] roles)
        {
            _allowedRoles = roles;
            _requiredFeature = null;
        }

        public RequireAuthorizationAttribute(PlanEnums.PlanFeature feature, params AuthEnums.RoleEnum[] roles)
        {
            _allowedRoles = roles;
            _requiredFeature = feature;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // Guard 1: not authenticated at all
            if (!(user.Identity?.IsAuthenticated ?? false))
            {
                context.Result = new ObjectResult(new { success = false, message = "User not authenticated" })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }

            // userId comes from the Supabase JWT "sub" claim (mapped to NameIdentifier by JwtBearer)
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? user.FindFirst("sub")?.Value;

            // workspaceId comes from the X-Workspace-ID request header (set by axiosInstance interceptor)
            var workspaceId = context.HttpContext.Request.Headers["X-Workspace-ID"].FirstOrDefault()
                           ?? user.FindFirst("workspaceId")?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(workspaceId))
            {
                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = "Invalid request context: userId or workspaceId is missing"
                })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }


            var cache = context.HttpContext.RequestServices.GetRequiredService<ICache>();

            string? cachedRole = await cache.GetUserRoleAsync(userId, workspaceId);

            int userRoleId = 0;

            // Try cache first
            if (!string.IsNullOrEmpty(cachedRole) &&
                Enum.TryParse<RoleEnum>(cachedRole, true, out var role))
            {
                userRoleId = (int)role;
            }
            else
            {
                // Cache miss OR invalid cache → fetch from DB
                var omniService = context.HttpContext.RequestServices
                    .GetRequiredService<IOmniService>();

                userRoleId = await omniService.ProfileService
                    .GetUserRole(userId, workspaceId);

                if (userRoleId <= 0)
                {
                    context.Result = new ObjectResult(new
                    {
                        success = false,
                        message = "User is not a member of this workspace"
                    })
                    {
                        StatusCode = StatusCodes.Status403Forbidden
                    };
                    return;
                }

                // Cache the value (store as string)
                await cache.SetUserRoleAsync(userId, workspaceId, userRoleId.ToString());
            }

            // 1. Role check
            if (_allowedRoles != null && _allowedRoles.Length > 0)
            {
                bool hasRole = _allowedRoles.Any(r => (int)r == userRoleId);

                if (!hasRole)
                {
                    context.Result = new ObjectResult(new
                    {
                        success = false,
                        message = "Insufficient permissions",
                        requiredRoles = _allowedRoles.Select(r => r.ToString()),
                        yourRole = ((AuthEnums.RoleEnum)userRoleId).ToString()
                    })
                    {
                        StatusCode = StatusCodes.Status403Forbidden
                    };
                    return;
                }
            }

            // 2. Plan feature check
            if (_requiredFeature.HasValue)
            {
                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthorizationService>();
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