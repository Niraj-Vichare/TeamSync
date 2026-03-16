using Enterprise.Flowstate.BAL.BusinessLogic.BGService;
using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using Enterprise.Flowstate.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using Supabase;
using System.Text;
using DotNetEnv;

Env.Load();

var SUPABASE_KEY = Environment.GetEnvironmentVariable("Supabase_SUPABASE_KEY");
var JWT_KEY = Environment.GetEnvironmentVariable("JwtSetting_SecretKey");
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var JwtToken = new JwtSetting();
builder.Configuration.GetSection("JwtSetting").Bind(JwtToken);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<Supabase.Client>(provider =>
{
    return new Supabase.Client(
        builder.Configuration["Supabase:SUPABASE_URL"],
        SUPABASE_KEY,
        new SupabaseOptions
        {
            AutoConnectRealtime = true,
            AutoRefreshToken = true,
        }
    );
});
builder.Services.AddSignalR();
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();

    var redisOptions = new ConfigurationOptions
    {
        EndPoints =
        {
            { config["RedisConnection:HostName"], int.Parse(config["RedisConnection:Port"]) }
        },
        User = config["RedisConnection:UserName"],
        Password = config["RedisConnection:Password"],
        AbortOnConnectFail = false
    };

    return ConnectionMultiplexer.Connect(redisOptions);
});


builder.Services.AddHttpClient();
builder.Services.AddSingleton<IRabbitMqTopologySetup, RabbitMqTopologySetup>();
builder.Services.AddScoped<IOmniRepository, OmniRepository>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();
builder.Services.AddScoped<IOmniService, OmniService>();
builder.Services.AddSingleton<ICache,CacheService>();
builder.Services.AddSingleton<ILeaderboardHubService, LeaderboardHubService>();
builder.Services.AddScoped<IMessageProcessor, MessageProcessor>();
builder.Services.AddSingleton<IEventPublisher, MessagePublisher>();
builder.Services.AddHostedService<MessageConsumer>();
builder.Services.AddHostedService<DatabaseSyncService>();
builder.Services.AddHostedService<WeeklyPeriodResetService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174") // specify allowed origins
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            // What we need to validate
            options.TokenValidationParameters = new TokenValidationParameters
            {
                // What we need to validate
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                // Configure the issuer that we learn in part-1 under jwt structure. 
                ValidIssuer = JwtToken.Issuer,
                ValidAudience = JwtToken.Audience,
                // Remember the sign that we need to have to know authenticity when visiting bank again?
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JWT_KEY))
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    // If the request is for our SignalR hub AND there's a token in query string
                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/hubs/leaderboard"))
                    {
                        context.Token = accessToken;
                    }
                    else
                    {
                        // Fall back to cookie for regular API requests
                        context.Token = context.Request.Cookies["authToken"];
                    }

                    return System.Threading.Tasks.Task.CompletedTask;
                }
            };
        });

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapHub<LeaderboardHub>("/hubs/leaderboard");
app.UseCors("AllowSpecificOrigins");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
