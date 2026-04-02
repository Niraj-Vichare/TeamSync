using Enterprise.Flowstate.BAL.BusinessLogic.BGService;
using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Configuration;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using Enterprise.Flowstate.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using Supabase;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.HttpOverrides;

Env.Load();

var SUPABASE_KEY = Environment.GetEnvironmentVariable("Supabase_SUPABASE_KEY");
var JWT_KEY = Environment.GetEnvironmentVariable("JwtSetting_SecretKey");

if (string.IsNullOrEmpty(JWT_KEY))
    throw new InvalidOperationException("JwtSetting_SecretKey is not set. Add it to your .env file.");

if (string.IsNullOrEmpty(SUPABASE_KEY))
    throw new InvalidOperationException("Supabase_SUPABASE_KEY is not set. Add it to your .env file.");

var builder = WebApplication.CreateBuilder(args);

var JwtToken = new JwtSetting();
builder.Configuration.GetSection("JwtSetting").Bind(JwtToken);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<Supabase.Client>(_ =>
    new Supabase.Client(
        builder.Configuration["Supabase:SUPABASE_URL"],
        SUPABASE_KEY,
        new SupabaseOptions { AutoConnectRealtime = true, AutoRefreshToken = true }));

builder.Services.AddSignalR();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return ConnectionMultiplexer.Connect(new ConfigurationOptions
    {
        EndPoints = { { config["RedisConnection:HostName"], int.Parse(config["RedisConnection:Port"]) } },
        User = config["RedisConnection:UserName"],
        Password = config["RedisConnection:Password"],
        AbortOnConnectFail = false
    });
});

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IRabbitMqTopologySetup, RabbitMqTopologySetup>();
builder.Services.AddScoped<IOmniRepository, OmniRepository>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();
builder.Services.AddScoped<IOmniService, OmniService>();
builder.Services.AddSingleton<ICache, CacheService>();
builder.Services.AddSingleton<ILeaderboardHubService, LeaderboardHubService>();
builder.Services.AddScoped<IMessageProcessor, MessageProcessor>();
builder.Services.AddSingleton<IEventPublisher, MessagePublisher>();
builder.Services.AddHostedService<MessageConsumer>();
builder.Services.AddHostedService<DatabaseSyncService>();
builder.Services.AddHostedService<WeeklyPeriodResetService>();

builder.Services.AddCors(options =>
    options.AddPolicy("AllowSpecificOrigins", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = JwtToken.Issuer,
            ValidAudience = JwtToken.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JWT_KEY))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                // SignalR hub reads token from query string; everything else uses the cookie
                context.Token = (!string.IsNullOrEmpty(accessToken) &&
                                  path.StartsWithSegments("/hubs/leaderboard"))
                    ? accessToken.ToString()
                    : context.Request.Cookies["authToken"];

                return System.Threading.Tasks.Task.CompletedTask;
            }
        };
    });

builder.Services.AddFlowstateRateLimiting();

var app = builder.Build();

try
{
    var topologySetup = app.Services.GetRequiredService<IRabbitMqTopologySetup>();
    await topologySetup.SetupAsync();
    Console.WriteLine("RabbitMQ topology setup completed");
}
catch (Exception ex)
{
    Console.WriteLine($"Failed to setup RabbitMQ topology: {ex.Message}");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapHub<LeaderboardHub>("/hubs/leaderboard");
app.MapControllers();

app.Run();