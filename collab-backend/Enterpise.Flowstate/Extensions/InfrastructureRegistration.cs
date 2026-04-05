using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using StackExchange.Redis;
using Supabase;

namespace Enterprise.Flowstate.Extensions
{
    public static class InfrastructureRegistration
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,IConfiguration config,string supabaseKey)
        {
            services.AddSingleton<Supabase.Client>(_ =>
                new Supabase.Client(
                    config["Supabase:SUPABASE_URL"],
                    supabaseKey,
                    new SupabaseOptions
                    {
                        AutoConnectRealtime = true,
                        AutoRefreshToken = true
                    }));

            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                return ConnectionMultiplexer.Connect(new ConfigurationOptions
                {
                    EndPoints =
                    {
                        {
                            config["RedisConnection:HostName"],
                            int.Parse(config["RedisConnection:Port"])
                        }
                    },
                    User = config["RedisConnection:UserName"],
                    Password = config["RedisConnection:Password"],
                    AbortOnConnectFail = false
                });
            });

            services.AddSingleton<ICache, CacheService>();

            return services;
        }

    }
}
