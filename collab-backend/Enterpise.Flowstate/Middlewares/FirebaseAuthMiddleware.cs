namespace Enterpise.Flowstate.Middlewares
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<FirebaseAuthMiddleware> _logger;
        public FirebaseAuthMiddleware(RequestDelegate next,ILogger<FirebaseAuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public void Invoke(HttpContext context)
        {
            
        }
    }
}
