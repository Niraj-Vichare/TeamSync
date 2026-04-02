using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.RateLimiting;

namespace Enterprise.Flowstate.Configuration
{
    public static class RateLimitingConfiguration
    {
        // Policy names — use these as constants so controllers and Program.cs reference the same string
        public const string Auth = "auth";        // signin / signup — strictest
        public const string Api = "api";         // general authenticated API calls
        public const string Leaderboard = "leaderboard"; // leaderboard polling — slightly relaxed
        public const string Strict = "strict";      // password reset, invite — very strict
        public const string Write = "write";       // create/update/delete mutations

        public static IServiceCollection AddFlowstateRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {

                // Global fallback — applies to any endpoint without a named policy.
                // 100 requests per minute per IP.
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }));

                // 
                // AUTH policy — signin / signup
                // 10 attempts per 15 minutes per IP.
                // Sliding window so a burst of 3 doesn't reset the whole window.
                // 
                options.AddPolicy(Auth, ctx =>
                    RateLimitPartition.GetSlidingWindowLimiter(
                        partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new SlidingWindowRateLimiterOptions
                        {
                            PermitLimit = 10,
                            Window = TimeSpan.FromMinutes(15),
                            SegmentsPerWindow = 3,      // window divided into 3×5min segments
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }));

                // STRICT policy — password reset, invite links
                // 5 requests per hour per IP
                options.AddPolicy(Strict, ctx =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromHours(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        }));

                // 
                // API policy — general authenticated endpoints (GET reads)
                // Partitioned by user ID from JWT if available, else IP.
                // 200 requests per minute per user.
                // 
                options.AddPolicy(Api, ctx =>
                {
                    // Prefer user-based partitioning so one IP with many users isn't blocked
                    var identity = ctx.User.Identity as ClaimsIdentity;
                    var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var key = !string.IsNullOrEmpty(userIdClaim)
                        ? $"user:{userIdClaim}"
                        : $"ip:{ctx.Connection.RemoteIpAddress}";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: key,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 200,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 5   // allow a small queue for bursts
                        });
                });

                // ─────────────────────────────────────────────────────────────
                // WRITE policy — create / update / delete mutations
                // 60 writes per minute per user. Prevents bulk automated writes.
                // ─────────────────────────────────────────────────────────────
                options.AddPolicy(Write, ctx =>
                {
                    var userId = ctx.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    var key = !string.IsNullOrEmpty(userId)
                        ? $"user:{userId}"
                        : $"ip:{ctx.Connection.RemoteIpAddress}";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: key,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 60,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 2
                        });
                });

                // LEADERBOARD policy — board is polled frequently by the UI
                // and also pushed via SignalR, so reads can be slightly generous.
                // 120 requests per minute per user.
                options.AddPolicy(Leaderboard, ctx =>
                {
                    var userId = ctx.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    var key = !string.IsNullOrEmpty(userId)
                        ? $"user:{userId}"
                        : $"ip:{ctx.Connection.RemoteIpAddress}";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: key,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 120,
                            Window = TimeSpan.FromMinutes(1),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 0
                        });
                });

                // Standard 429 response with Retry-After header
                options.OnRejected = async (context, cancellationToken) =>
                {
                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/json";

                    var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry)
                        ? (int)retry.TotalSeconds
                        : 60;

                    context.HttpContext.Response.Headers["Retry-After"] = retryAfter.ToString();

                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Too many requests. Please slow down.",
                        retryAfter = retryAfter
                    }, cancellationToken);
                };
            });

            return services;
        }
    }
}