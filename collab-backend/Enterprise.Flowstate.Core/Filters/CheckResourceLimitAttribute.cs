using Enterprise.Flowstate.BAL.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.BAL.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class CheckResourceLimitAttribute : Attribute, IAsyncActionFilter
    {
        private readonly ResourceType _resourceType;

        public CheckResourceLimitAttribute(ResourceType resourceType)
        {
            _resourceType = resourceType;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var workspaceId = context.HttpContext.User.FindFirst("workspaceId")?.Value;

            if (string.IsNullOrEmpty(workspaceId))
            {
                context.Result = new BadRequestObjectResult(new
                {
                    success = false,
                    message = "Workspace not found"
                });
                return;
            }

            var authService = context.HttpContext.RequestServices
                .GetRequiredService<IAuthorizationService>();

            bool canCreate = _resourceType switch
            {
                ResourceType.Project => await authService.CanCreateProject(workspaceId),
                ResourceType.TeamMember => await authService.CanAddMember(workspaceId),
                ResourceType.Sprint => await authService.CanCreateSprint(workspaceId),
                _ => false
            };

            if (!canCreate)
            {
                var limitMessage = _resourceType switch
                {
                    ResourceType.Project => "Project limit reached",
                    ResourceType.TeamMember => "Team member limit reached",
                    ResourceType.Sprint => "Sprint limit reached",
                    _ => "Resource limit reached"
                };

                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = limitMessage,
                    upgradeUrl = "/settings/billing"
                })
                {
                    StatusCode = StatusCodes.Status402PaymentRequired
                };
                return;
            }

            await next();
        }
    }
}
