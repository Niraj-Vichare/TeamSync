using Enterprise.Flowstate.DAL.Interfaces;

namespace Enterprise.Flowstate.Extensions
{
    public static class RepositoryRegistration
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {

            services.Scan(scan=>scan.FromAssembliesOf(typeof(IOmniRepository))
                .AddClasses(classes => classes.Where(type => type.Name.EndsWith("Repository")))
                .AsImplementedInterfaces()
                .WithScopedLifetime());

            return services;
        }
    }
}
