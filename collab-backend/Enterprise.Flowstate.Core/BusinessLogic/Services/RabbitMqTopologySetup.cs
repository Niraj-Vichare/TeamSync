using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class RabbitMqTopologySetup : IRabbitMqTopologySetup
    {
        private readonly IConfiguration _config;
        private readonly ILogger<RabbitMqTopologySetup> _logger;
        private readonly int _retryDelayMs = 5000;

        public RabbitMqTopologySetup(
            IConfiguration config,
            ILogger<RabbitMqTopologySetup> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SetupAsync()
        {
            _logger.LogInformation("Setting up RabbitMQ topology...");

            var factory = new ConnectionFactory()
            {
                HostName = _config.GetSection("RabbitMqConnection:Host").Value,
                Port = Convert.ToInt32(_config.GetSection("RabbitMqConnection:Port").Value),
                Password = _config.GetSection("RabbitMqConnection:Password").Value,
                UserName = _config.GetSection("RabbitMqConnection:UserName").Value,
            };

            using var connection = await factory.CreateConnectionAsync("TopologySetup");
            using var channel = await connection.CreateChannelAsync();

            // Declare Exchanges
            await channel.ExchangeDeclareAsync(
                FlowStateConstants.RANKING_EXCHANGE,
                ExchangeType.Direct,
                durable: true);

            await channel.ExchangeDeclareAsync(
                FlowStateConstants.RANKING_RETRY_EXCHANGE,
                ExchangeType.Direct,
                durable: true);

            await channel.ExchangeDeclareAsync(
                FlowStateConstants.RANKING_DLX_EXCHANGE,
                ExchangeType.Direct,
                durable: true);

            // Main Queue
            var mainArgs = new Dictionary<string, object>
            {
                { "x-dead-letter-exchange", FlowStateConstants.RANKING_RETRY_EXCHANGE },
                { "x-dead-letter-routing-key", FlowStateConstants.RANKING_RETRY_ROUTING_KEY }
            };
            await channel.QueueDeclareAsync(
                FlowStateConstants.RANKING_QUEUE,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: mainArgs);

            await channel.QueueBindAsync(
                FlowStateConstants.RANKING_QUEUE,
                FlowStateConstants.RANKING_EXCHANGE,
                FlowStateConstants.RANKING_ROUTING_KEY);

            // Retry Queue
            var retryArgs = new Dictionary<string, object>
            {
                { "x-dead-letter-exchange", FlowStateConstants.RANKING_EXCHANGE },
                { "x-dead-letter-routing-key", FlowStateConstants.RANKING_ROUTING_KEY },
                { "x-message-ttl", _retryDelayMs }
            };
            await channel.QueueDeclareAsync(
                FlowStateConstants.RANKING_RETRY_QUEUE,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: retryArgs);

            await channel.QueueBindAsync(
                FlowStateConstants.RANKING_RETRY_QUEUE,
                FlowStateConstants.RANKING_RETRY_EXCHANGE,
                FlowStateConstants.RANKING_RETRY_ROUTING_KEY);

            // Dead Letter Queue
            await channel.QueueDeclareAsync(
                FlowStateConstants.RANKING_DLX_QUEUE,
                durable: true,
                exclusive: false,
                autoDelete: false);

            await channel.QueueBindAsync(
                FlowStateConstants.RANKING_DLX_QUEUE,
                FlowStateConstants.RANKING_DLX_EXCHANGE,
                FlowStateConstants.RANKING_DLX_ROUTING_KEY);

            _logger.LogInformation("RabbitMQ topology setup completed successfully");
        }
    }
}
