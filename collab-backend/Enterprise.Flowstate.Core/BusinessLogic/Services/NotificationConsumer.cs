using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    /// <summary>
    /// BackgroundService that listens on NOTIFICATION_QUEUE and hands each
    /// message to NotificationProcessor (scoped, resolved per message).
    ///
    /// Mirrors MessageConsumer exactly — same retry/DLQ pattern, different
    /// exchange, queue, and processor interface.
    /// </summary>
    public class NotificationConsumer : BackgroundService, IDisposable
    {
        private IConnection _connection;
        private IChannel _channel;
        private readonly IConfiguration _config;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationConsumer> _logger;
        private const int MaxRetries = 3;
        private const int RetryDelayMs = 5000;

        public NotificationConsumer(
            IConfiguration config,
            ILogger<NotificationConsumer> logger,
            IServiceScopeFactory scopeFactory)
        {
            _config = config;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await InitAsync();

                stoppingToken.Register(() =>
                    _logger.LogInformation("NotificationConsumer stopping"));

                await _channel.BasicQosAsync(0, 10, false);

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += HandleAsync;

                await _channel.BasicConsumeAsync(
                    queue: FlowStateConstants.NOTIFICATION_QUEUE,
                    autoAck: false,
                    consumer: consumer);

                _logger.LogInformation("NotificationConsumer started");

                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fatal error in NotificationConsumer");
                throw;
            }
        }

        private async Task HandleAsync(object sender, BasicDeliverEventArgs e)
        {
            if (e?.Body == null)
            {
                if (e != null) await _channel.BasicAckAsync(e.DeliveryTag, false);
                return;
            }

            var body = e.Body.ToArray();
            var props = e.BasicProperties;
            int retryCount = 0;

            if (props?.Headers?.TryGetValue("x-retry-count", out var raw) == true
                && raw is byte[] bytes
                && int.TryParse(Encoding.UTF8.GetString(bytes), out int parsed))
            {
                retryCount = parsed;
            }

            using var scope = _scopeFactory.CreateScope();
            try
            {
                var processor = scope.ServiceProvider
                    .GetRequiredService<INotificationProcessor>();

                var dto = JsonSerializer.Deserialize<NotificationDto>(
                    Encoding.UTF8.GetString(body),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (dto == null)
                {
                    _logger.LogWarning("NotificationConsumer: null deserialized payload");
                    await _channel.BasicAckAsync(e.DeliveryTag, false);
                    return;
                }

                await processor.ProcessAsync(dto);
                await _channel.BasicAckAsync(e.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationConsumer: processing failed RetryCount={R}", retryCount);

                if (retryCount < MaxRetries)
                {
                    var retryProps = new BasicProperties
                    {
                        Persistent = true,
                        Headers = new Dictionary<string, object?>
                        {
                            { "x-retry-count", Encoding.UTF8.GetBytes((retryCount + 1).ToString()) }
                        }
                    };
                    await _channel.BasicPublishAsync(
                        FlowStateConstants.NOTIFICATION_RETRY_EXCHANGE,
                        FlowStateConstants.NOTIFICATION_RETRY_ROUTING_KEY,
                        true, retryProps, body);
                }
                else
                {
                    var dlxProps = new BasicProperties
                    {
                        Persistent = true,
                        Headers = new Dictionary<string, object?>
                        {
                            { "x-final-error", Encoding.UTF8.GetBytes(ex.Message) }
                        }
                    };
                    await _channel.BasicPublishAsync(
                        FlowStateConstants.NOTIFICATION_DLX_EXCHANGE,
                        FlowStateConstants.NOTIFICATION_DLX_ROUTING_KEY,
                        true, dlxProps, body);
                    _logger.LogWarning("Notification moved to DLQ after {Max} attempts", MaxRetries);
                }

                await _channel.BasicAckAsync(e.DeliveryTag, false);
            }
        }

        private async Task InitAsync()
        {
            var factory = new ConnectionFactory
            {
                HostName = _config["RabbitMqConnection:Host"],
                Port = int.Parse(_config["RabbitMqConnection:Port"]!),
                UserName = _config["RabbitMqConnection:UserName"],
                Password = _config["RabbitMqConnection:Password"],
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
            };

            _connection = await factory.CreateConnectionAsync("NotificationConsumer");
            _channel = await _connection.CreateChannelAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposing) return;

            try { _channel?.CloseAsync(); _channel?.Dispose(); }
            catch (Exception ex) { _logger.LogError(ex, "Error closing channel"); }

            try { _connection?.CloseAsync(); _connection?.Dispose(); }
            catch (Exception ex) { _logger.LogError(ex, "Error closing connection"); }
        }
    }
}