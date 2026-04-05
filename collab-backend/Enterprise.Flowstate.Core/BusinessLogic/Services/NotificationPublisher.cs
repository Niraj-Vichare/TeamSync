using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class NotificationPublisher:INotificationPublisher,IDisposable
    {
        private IConnection connection;
        private readonly ConcurrentBag<IChannel> _channelPool;
        private readonly SemaphoreSlim _channelSemaphore;
        private readonly SemaphoreSlim _initLock = new SemaphoreSlim(1, 1);
        private IConfiguration _config;
        private readonly ILogger<NotificationPublisher> _logger;
        private bool _isInitialized = false;
        private int _channelPoolSize = 5;

        public NotificationPublisher(IConfiguration config,ILogger<NotificationPublisher> logger)
        {
            _config = config;
            _logger = logger;
            
            if (int.TryParse(_config.GetSection("RabbitMqConnection:ChannelPoolSize").Value, out int poolSize))
            {
                _channelPoolSize = poolSize;
            }

            _channelPool = new ConcurrentBag<IChannel>();
            _channelSemaphore = new SemaphoreSlim(_channelPoolSize, _channelPoolSize);
        }

        private async Task EnsureInitializedAsync()
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
                };

                connection = await factory.CreateConnectionAsync("NotificationPublisher");
                for (int i = 0; i < _channelPoolSize; i++)
                    _channelPool.Add(await connection.CreateChannelAsync());

                _isInitialized = true;
                _logger.LogInformation("NotificationPublisher initialised ({Pool} channels)", _channelPoolSize);
            }
            finally
            {
                _initLock.Release();
            }
        }

        public async Task<bool> PublishAsync(NotificationDto notification, int retryCount = 0)
        {
            await EnsureInitializedAsync();

            IChannel? channel = null;
            try
            {
                await _channelSemaphore.WaitAsync();
                if (!_channelPool.TryTake(out channel))
                {
                    _logger.LogError("NotificationPublisher: no channel available");
                    return false;
                }

                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(notification));

                var props = new BasicProperties
                {
                    Persistent = true,
                    MessageId = Guid.NewGuid().ToString(),
                    Headers = new Dictionary<string, object?>
                    {
                        { "x-retry-count", Encoding.UTF8.GetBytes(retryCount.ToString()) }
                    }
                };

                await channel.BasicPublishAsync(
                    exchange: FlowStateConstants.NOTIFICATION_EXCHANGE,
                    routingKey: FlowStateConstants.NOTIFICATION_ROUTING_KEY,
                    mandatory: true,
                    basicProperties: props,
                    body: body);

                _logger.LogDebug(
                    "Notification published Type={Type} Recipient={Recipient}",
                    notification.NotificationType, notification.RecipientProfileId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationPublisher.PublishAsync failed");
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
            while (_channelPool.TryTake(out var ch))
            {
                try { ch.CloseAsync().GetAwaiter().GetResult(); ch.Dispose(); } catch { }
            }
            try { connection?.CloseAsync().GetAwaiter().GetResult(); connection?.Dispose(); } catch { }
            _channelSemaphore.Dispose();
            _initLock.Dispose();
        }
    }
}
