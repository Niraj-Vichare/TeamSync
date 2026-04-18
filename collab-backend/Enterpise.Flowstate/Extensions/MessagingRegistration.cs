using Enterprise.Flowstate.BAL.BusinessLogic.BGService;
using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;

namespace Enterprise.Flowstate.Extensions
{
    public static class MessagingRegistration
    {
        public static IServiceCollection AddMessaging(this IServiceCollection services)
        {
            // Rabbitmq TopologySetup
            services.AddSingleton<IRabbitMqTopologySetup, RabbitMqTopologySetup>();

            // Publisher
            services.AddSingleton<IEventPublisher, MessagePublisher>();
            services.AddSingleton<INotificationPublisher, NotificationPublisher>();

            // Consumers
            services.AddHostedService<MessageConsumer>();
            services.AddHostedService<NotificationConsumer>();
            // Hosted Service
            services.AddHostedService<DatabaseSyncService>();
            //services.AddHostedService<WeeklyPeriodResetService>();
            services.AddHostedService<DeadlineNotificationService>();

            // Processors
            services.AddScoped<INotificationProcessor, NotificationProcessor>();
            services.AddScoped<IMessageProcessor, MessageProcessor>();  

            // Hubs
            services.AddScoped<INotificationHubService, NotificationHubService>();
            services.AddScoped<ILeaderboardHubService, LeaderboardHubService>();    
            return services;
        }
    }
}
