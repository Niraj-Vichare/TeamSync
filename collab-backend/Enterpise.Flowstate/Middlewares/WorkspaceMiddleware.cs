namespace Enterpise.Flowstate.Middlewares
{
    public class WorkspaceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<WorkspaceMiddleware> _logger;

        public WorkspaceMiddleware(RequestDelegate next, ILogger<WorkspaceMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Check if route requires workspace context
            var workspaceId = context.Request.Headers["X-Workspace-Id"].FirstOrDefault() ??
                             context.Request.Query["workspaceId"].FirstOrDefault();

            if (!string.IsNullOrEmpty(workspaceId))
            {
                var firebaseUid = context.Items["FirebaseUid"]?.ToString();
                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    try
                    {
                        //var userRole = await workspaceService.GetUserRoleInWorkspaceAsync(firebaseUid, workspaceId);
                        //if (userRole != null)
                        //{
                        //    context.Items["WorkspaceId"] = workspaceId;
                        //    context.Items["UserRole"] = userRole;
                        //}
                        //else
                        //{
                        //    context.Response.StatusCode = 403;
                        //    await context.Response.WriteAsync("Access denied to workspace");
                        //    return;
                        //}
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error checking workspace access for user {firebaseUid}");
                        context.Response.StatusCode = 500;
                        await context.Response.WriteAsync("Workspace access check failed");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
