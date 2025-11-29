using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class MessageConsumer : BackgroundService, IMessageConsumer, IDisposable
    {
        private IConnection _connection;
        private IChannel _channel;
        private readonly IConfiguration _config;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<MessageConsumer> _logger;
        private readonly int _maxRetries = 3;
        private readonly int _retryDelayMs = 5000;

        public MessageConsumer(
            IConfiguration config,
            ILogger<MessageConsumer> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            _config = config;
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await InitializeConnectionAsync();

                stoppingToken.Register(() => _logger.LogInformation("MessageConsumer stopping"));

                await _channel.BasicQosAsync(0, 25, false);

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += HandleMessageAsync;

                await _channel.BasicConsumeAsync(
                    queue: FlowStateConstants.RANKING_QUEUE,
                    autoAck: false,
                    consumer: consumer);

                _logger.LogInformation("MessageConsumer started and listening");

                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("MessageConsumer cancelled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fatal error in MessageConsumer");
                throw;
            }
        }

        private async Task HandleMessageAsync(object sender, BasicDeliverEventArgs @event)
        {
            if (@event?.Body == null)
            {
                _logger.LogWarning("Received null message");
                if (@event != null)
                {
                    await _channel.BasicAckAsync(@event.DeliveryTag, false);
                }
                return;
            }

            var body = @event.Body.ToArray();
            var props = @event.BasicProperties;
            int currentRetryCount = 0;

            if (props?.Headers != null && props.Headers.ContainsKey("x-retry-count"))
            {
                if (props.Headers["x-retry-count"] is byte[] retryCountBytes)
                {
                    var retryCountString = Encoding.UTF8.GetString(retryCountBytes);
                    if (int.TryParse(retryCountString, out int parsedRetryCount))
                    {
                        currentRetryCount = parsedRetryCount;
                    }
                }
            }

            // CRITICAL: Create scope OUTSIDE try block to ensure disposal
            using var scope = _serviceScopeFactory.CreateScope();

            try
            {
                _logger.LogDebug("Resolving IMessageProcessor from scope");

                // Get the processor
                var processor = scope.ServiceProvider.GetRequiredService<IMessageProcessor>();

                _logger.LogDebug("IMessageProcessor resolved successfully");

                var message = Encoding.UTF8.GetString(body);
                _logger.LogDebug("Message deserialized: {Message}", message);

                var evt = JsonSerializer.Deserialize<EventsLogDto>(message, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (evt == null)
                {
                    _logger.LogWarning("Failed to deserialize EventsLogDto");
                    await _channel.BasicAckAsync(@event.DeliveryTag, false);
                    return;
                }

                _logger.LogInformation("Processing message for UserId={UserId}", evt.UserId);

                var result = await processor.ProcessMessageAsync(evt);

                _logger.LogInformation("Message processed successfully for UserId={UserId}", evt.UserId);

                await _channel.BasicAckAsync(@event.DeliveryTag, false);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("IMessageProcessor"))
            {
                // SERVICE NOT REGISTERED!
                _logger.LogCritical(ex,
                    "CRITICAL: IMessageProcessor is not registered in DI container! " +
                    "Add this line to Program.cs: builder.Services.AddScoped<IMessageProcessor, MessageProcessor>();");

                // Don't retry this - it's a configuration error
                await _channel.BasicAckAsync(@event.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Processing failed. RetryCount={RetryCount}", currentRetryCount);

                if (currentRetryCount < _maxRetries)
                {
                    var newProps = new BasicProperties
                    {
                        Persistent = true,
                        Headers = props?.Headers ?? new Dictionary<string, object?>()
                    };
                    newProps.Headers["x-retry-count"] = Encoding.UTF8.GetBytes((currentRetryCount + 1).ToString());

                    await _channel.BasicPublishAsync(
                        exchange: FlowStateConstants.RANKING_RETRY_EXCHANGE,
                        routingKey: FlowStateConstants.RANKING_RETRY_ROUTING_KEY,
                        mandatory: true,
                        basicProperties: newProps,
                        body: body);

                    await _channel.BasicAckAsync(@event.DeliveryTag, false);
                    _logger.LogInformation("Message requeued with retryCount={RetryCount}", currentRetryCount + 1);
                }
                else
                {
                    var dlxProps = new BasicProperties
                    {
                        Persistent = true,
                        Headers = props?.Headers ?? new Dictionary<string, object?>()
                    };
                    dlxProps.Headers["x-final-error"] = Encoding.UTF8.GetBytes(ex.Message);

                    await _channel.BasicPublishAsync(
                        exchange: FlowStateConstants.RANKING_DLX_EXCHANGE,
                        routingKey: FlowStateConstants.RANKING_DLX_ROUTING_KEY,
                        mandatory: true,
                        basicProperties: dlxProps,
                        body: body);

                    await _channel.BasicAckAsync(@event.DeliveryTag, false);
                    _logger.LogWarning("Message moved to DLQ after {MaxRetries} attempts", _maxRetries);
                }
            }
        }

        //    private async Task HandleMessageAsync(object sender, BasicDeliverEventArgs @event)
        //{
        //    if (@event?.Body == null)
        //    {
        //        _logger.LogWarning("Received null message body");
        //        if (@event != null)
        //        {
        //            await _channel.BasicAckAsync(@event.DeliveryTag, false);
        //        }
        //        return;
        //    }

        //    using var scope = _serviceScopeFactory.CreateScope();
        //    var processor = scope.ServiceProvider.GetRequiredService<IMessageProcessor>();

        //    var body = @event.Body.ToArray();
        //    var props = @event.BasicProperties;
        //    int currentRetryCount = 0;

        //    if (props.Headers != null && props.Headers.ContainsKey("x-retry-count"))
        //    {
        //        if (props.Headers["x-retry-count"] is byte[] retryCountBytes)
        //        {
        //            var retryCountString = Encoding.UTF8.GetString(retryCountBytes);
        //            if (int.TryParse(retryCountString, out int parsedRetryCount))
        //            {
        //                currentRetryCount = parsedRetryCount;
        //            }
        //        }
        //    }

        //    try
        //    {
        //        var message = Encoding.UTF8.GetString(body);
        //        var evt = JsonSerializer.Deserialize<EventsLogDto>(message, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        //        var result = await processor.ProcessMessageAsync(evt);

        //        // ACK the message - ADD AWAIT
        //        await _channel.BasicAckAsync(@event.DeliveryTag, false);
        //        _logger.LogDebug("Message processed successfully for UserId={UserId}", evt.UserId);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Processing failed for message. RetryCount={retry}", currentRetryCount);

        //        if (currentRetryCount < _maxRetries)
        //        {
        //            var newProps = new BasicProperties
        //            {
        //                Persistent = true,
        //                Headers = props.Headers ?? new Dictionary<string, object?>()
        //            };
        //            newProps.Headers["x-retry-count"] = Encoding.UTF8.GetBytes((currentRetryCount + 1).ToString());

        //            // Publish to retry exchange - ADD AWAIT
        //            await _channel.BasicPublishAsync(
        //                exchange: FlowStateConstants.RANKING_RETRY_EXCHANGE,
        //                routingKey: FlowStateConstants.RANKING_RETRY_ROUTING_KEY,
        //                mandatory: true,
        //                basicProperties: newProps,
        //                body: body);

        //            // ACK original - ADD AWAIT
        //            await _channel.BasicAckAsync(@event.DeliveryTag, false);
        //            _logger.LogInformation("Message requeued to retry exchange with retryCount {retry}", currentRetryCount + 1);
        //        }
        //        else
        //        {
        //            var dlxProps = new BasicProperties
        //            {
        //                Persistent = true,
        //                Headers = props?.Headers ?? new Dictionary<string, object>()
        //            };
        //            dlxProps.Headers["x-final-error"] = ex.Message;

        //            // Publish to DLQ - ADD AWAIT
        //            await _channel.BasicPublishAsync(
        //                exchange: FlowStateConstants.RANKING_DLX_EXCHANGE,
        //                routingKey: FlowStateConstants.RANKING_DLX_ROUTING_KEY,
        //                mandatory: true,
        //                basicProperties: dlxProps,
        //                body: body);

        //            // ACK original - ADD AWAIT
        //            await _channel.BasicAckAsync(@event.DeliveryTag, false);
        //            _logger.LogWarning("Message moved to DLQ after {max} attempts", _maxRetries);
        //        }
        //    }
        //}

        private async Task InitializeConnectionAsync()
        {
            var factory = new ConnectionFactory()
            {
                HostName = _config.GetSection("RabbitMqConnection:Host").Value,
                Port = Convert.ToInt32(_config.GetSection("RabbitMqConnection:Port").Value),
                Password = _config.GetSection("RabbitMqConnection:Password").Value,
                UserName = _config.GetSection("RabbitMqConnection:UserName").Value,
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
            };

            _logger.LogInformation("Consumer connecting to RabbitMQ...");

            _connection = await factory.CreateConnectionAsync("LeaderboardConsumer");
            _channel = await _connection.CreateChannelAsync();

            _logger.LogInformation("Consumer connected successfully");

            // NO TOPOLOGY DECLARATION HERE!
        }

        protected void Dispose(bool disposing)
        {
            if (disposing)
            {
                try
                {
                    _channel?.CloseAsync().GetAwaiter().GetResult();
                    _channel?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error closing channel");
                }

                try
                {
                    _connection?.CloseAsync().GetAwaiter().GetResult();
                    _connection?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error closing connection");
                }
            }

            Dispose(disposing);
        }
    }
}