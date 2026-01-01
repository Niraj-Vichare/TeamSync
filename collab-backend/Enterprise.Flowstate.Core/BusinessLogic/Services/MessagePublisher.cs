using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class MessagePublisher:IEventPublisher,IDisposable
    {
        private IConnection _connection;
        private readonly ConcurrentBag<IChannel> _channelPool;
        private readonly SemaphoreSlim _channelSemaphore;
        private readonly IConfiguration _config;
        private readonly ILogger<MessagePublisher> _logger;
        private readonly SemaphoreSlim _initLock = new SemaphoreSlim(1, 1);
        private bool _isInitialized = false;
        private int _channelPoolSize = 10;

        public MessagePublisher(
            IConfiguration config,
            ILogger<MessagePublisher> logger)
        {
            _config = config;
            _logger = logger;

            // Get pool size from config
            if (int.TryParse(_config.GetSection("RabbitMqConnection:ChannelPoolSize").Value, out int poolSize))
            {
                _channelPoolSize = poolSize;
            }

            _channelPool = new ConcurrentBag<IChannel>();
            _channelSemaphore = new SemaphoreSlim(_channelPoolSize, _channelPoolSize);
        }

        private async System.Threading.Tasks.Task EnsureInitializedAsync()
        {
            if (_isInitialized) return;

            await _initLock.WaitAsync();
            try
            {
                if (_isInitialized) return;

                var factory = new ConnectionFactory()
                {
                    HostName = _config.GetSection("RabbitMqConnection:Host").Value,
                    Port = Convert.ToInt32(_config.GetSection("RabbitMqConnection:Port").Value),
                    Password = _config.GetSection("RabbitMqConnection:Password").Value,
                    UserName = _config.GetSection("RabbitMqConnection:UserName").Value,
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                };

                _logger.LogInformation("Initializing Publisher with {PoolSize} channels", _channelPoolSize);

                _connection = await factory.CreateConnectionAsync("LeaderboardPublisher");

                // Create channel pool (NO TOPOLOGY DECLARATION)
                for (int i = 0; i < _channelPoolSize; i++)
                {
                    var channel = await _connection.CreateChannelAsync();
                    _channelPool.Add(channel);
                }

                _isInitialized = true;
                _logger.LogInformation("Publisher initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Publisher");
                throw;
            }
            finally
            {
                _initLock.Release();
            }
        }

        public async Task<bool> PublishAsync(EventsLog eventLogs,int initalizeRetryCount)
        {
            await EnsureInitializedAsync();

            IChannel channel = null;
            try
            {
                await _channelSemaphore.WaitAsync();

                if (!_channelPool.TryTake(out channel))
                {
                    _logger.LogError("Failed to get channel from pool");
                    return false;
                }

                var json = System.Text.Json.JsonSerializer.Serialize(eventLogs);
                var body = Encoding.UTF8.GetBytes(json);

                var properties = new BasicProperties()
                {
                    Persistent = true,
                    MessageId = Guid.NewGuid().ToString(),
                    Headers = new Dictionary<string, object?>
                    {
                        { "x-retry-count", Encoding.UTF8.GetBytes(initalizeRetryCount.ToString()) }
                    }
                };

                await channel.BasicPublishAsync(
                    exchange: FlowStateConstants.RANKING_EXCHANGE,
                    routingKey: FlowStateConstants.RANKING_ROUTING_KEY,
                    mandatory: true,
                    basicProperties: properties,
                    body: body);

                //var confirmed = await channel.WaitForConfirmsAsync(TimeSpan.FromSeconds(5));
                //if (!confirmed)
                //{
                //    _logger.LogError("Message not confirmed by broker");
                //    return false;
                //}

                _logger.LogDebug("Message published for UserId={UserId}", eventLogs?.UserGuid);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish message");
                return false;
            }
            finally
            {
                if (channel != null)
                {
                    _channelPool.Add(channel);
                    _channelSemaphore.Release();
                }
            }
        }

        public void Dispose()
        {
            while (_channelPool.TryTake(out var channel))
            {
                try
                {
                    channel?.CloseAsync().GetAwaiter().GetResult();
                    channel?.Dispose();
                }
                catch { }
            }

            try
            {
                _connection?.CloseAsync().GetAwaiter().GetResult();
                _connection?.Dispose();
            }
            catch { }

            _channelSemaphore?.Dispose();
            _initLock?.Dispose();
        }
    }
}
