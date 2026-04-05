using Enterprise.Flowstate.BAL.Interface.Service;
using Microsoft.Extensions.Hosting; // add this

namespace Enterprise.Flowstate.Extensions
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddBusinessServices(
            this IServiceCollection services)
        {
            services.Scan(scan => scan
                .FromAssemblies(typeof(IOmniService).Assembly)
                .AddClasses(c => c.Where(t =>
                    t.Name.EndsWith("Service") &&
                    !typeof(IHostedService).IsAssignableFrom(t)))
                .AsImplementedInterfaces()
                .WithScopedLifetime());

            return services;
        }
    }
}