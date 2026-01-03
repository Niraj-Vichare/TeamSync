using Enterprise.Flowstate.BAL.BusinessLogic.BGService;
using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Enterprise.Flowstate.DAL.Repositories;
using Enterprise.Flowstate.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using System.Text;

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
        builder.Configuration["Supabase:SUPABASE_KEY"],
        new SupabaseOptions
        {
            AutoConnectRealtime = true,
            AutoRefreshToken = true,
        }
    );
});
builder.Services.AddSignalR();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IRabbitMqTopologySetup, RabbitMqTopologySetup>();
builder.Services.AddScoped<IOmniRepository, OmniRepository>();
builder.Services.AddScoped<IOmniService, OmniService>();
builder.Services.AddScoped<ICache,CacheService>();
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
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtToken.SecretKey))
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    context.Token = context.Request.Cookies["authToken"]; // Read token from cookie
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
