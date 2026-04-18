using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class MessageProcessor:IMessageProcessor
    {
        private ICache _cache;
        private IOmniService _omniService;
        private readonly ILeaderboardHubService _hubService;
        private ILogger<MessageProcessor> _logger;
        private readonly ConcurrentDictionary<string, Timer> _debounceTimers = new();
        private readonly TimeSpan _debounceDelay = TimeSpan.FromSeconds(2);
        private readonly Timer _cleanupTimer;
        public MessageProcessor(ICache cacheRepository,IOmniService omniService,ILogger<MessageProcessor> logger,ILeaderboardHubService leaderboardHubService)
        {
            _cache = cacheRepository;
            _omniService = omniService;
            _logger = logger;
            _hubService = leaderboardHubService;
            _cleanupTimer = new Timer(CleanupOldTimers, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
        }

        private void CleanupOldTimers(object state)
        {
            try
            {
                var oldTimerCount = _debounceTimers.Count;
                // In practice, timers should be removed after broadcast
                // This is a safety net for any orphaned timers
                if (oldTimerCount > 100) // Safety threshold
                {
                    _logger.LogWarning("Debounce timer dictionary has {Count} entries, clearing old ones", oldTimerCount);
                    // Could implement more sophisticated cleanup logic here if needed
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during timer cleanup");
            }
        }
        public async Task<bool> ProcessMessageAsync(EventsLogDto eventLogDto)
        {
            if (eventLogDto == null)
            {
                throw new ArgumentNullException(nameof(eventLogDto), "Invalid message payload");
            }
            if (string.IsNullOrWhiteSpace(eventLogDto.UserGuid))
            {
                throw new ArgumentException("UserId cannot be empty", nameof(eventLogDto));
            }

            if (string.IsNullOrWhiteSpace(eventLogDto.WorkspaceGuid))
            {
                throw new ArgumentException("WorkspaceId cannot be empty", nameof(eventLogDto));
            }

            if (!Enum.IsDefined(typeof(GeneralEnums.EventType), eventLogDto.EventTypeId))
            {
                _logger.LogWarning("Invalid EventTypeId: {EventTypeId} for UserId: {UserId}",
                    eventLogDto.EventTypeId, eventLogDto.UserGuid);
                throw new ArgumentException($"Invalid EventTypeId: {eventLogDto.EventTypeId}");
            }

            try
            {

                var metric = await _cache.GetUserMetricAsync(eventLogDto.WorkspaceGuid, eventLogDto.UserGuid);

                if (metric == null || metric.UserId == 0 || string.IsNullOrEmpty(metric.UserName))
                {
                    var profile = await _omniService.ProfileService.GetProfile(eventLogDto.UserGuid);

                    if (profile == null)
                    {
                        _logger.LogWarning("Profile not found for {UserGuid}; skipping metric init", eventLogDto.UserGuid);
                        return false;   // drop the message — don't cache a null-name record
                    }

                    metric ??= new RankingCacheModel
                    {
                        Score = 0,
                        Efficiency = 0,
                        ContributionPoint = 0,
                        Ranking = 0,
                        TotalHours = 0,
                        TotalTicketCompleted = 0
                    };

                    // Always refresh identity fields in case they were null previously
                    metric.UserId = profile.Id;
                    metric.UserName = profile.DisplayName ?? "Unknown";
                    metric.UserProfilePic = profile.ProfileImageUrl ?? string.Empty;
                }
                UpdateMetricFromEvent(eventLogDto, metric);


                float newScore = ComputeScore(metric);

                var (newRank, _) = await _cache.UpdateWorkspaceRankingAtomicAsync(eventLogDto.WorkspaceGuid,eventLogDto.UserGuid,newScore);

                if (newRank == -1)
                {
                    _logger.LogError(
                        "Failed to update ranking for UserId={UserId}, WorkspaceId={WorkspaceId}",
                        eventLogDto.UserGuid, eventLogDto.WorkspaceGuid);
                    throw new InvalidOperationException("Ranking update failed");
                }

                metric.Ranking = newRank;
                metric.Score = newScore;

                await _cache.UpsertUserMetricAsync(eventLogDto.WorkspaceGuid,eventLogDto.UserGuid,metric);

                // Background job will handle actual DB write
                await _cache.AddPendingUpdateAsync(eventLogDto.WorkspaceGuid, eventLogDto.UserGuid);

                // Debounced leaderboard broadcast instead of immediate
                ScheduleLeaderboardUpdate(eventLogDto.WorkspaceGuid);


                _logger.LogDebug("Processed event for UserId={UserId}, Rank={Rank}, Score={Score:F2}",eventLogDto.UserGuid, newRank, newScore);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error processing message for UserId={UserId}, WorkspaceId={WorkspaceId}",
                    eventLogDto.UserGuid, eventLogDto.WorkspaceGuid);
                throw;
            }

        }

        #region Private Methods
        private void ScheduleLeaderboardUpdate(string workspaceId)
        {
            var timer = _debounceTimers.AddOrUpdate(
                workspaceId,
                _ => new Timer(async _ => await BroadcastLeaderboard(workspaceId),
                              null, _debounceDelay, Timeout.InfiniteTimeSpan),
                (_, existingTimer) =>
                {
                    existingTimer.Change(_debounceDelay, Timeout.InfiniteTimeSpan);
                    return existingTimer;
                }
            );
        }

        private async Task BroadcastLeaderboard(string workspaceId)
        {
            var leaderboard = await _omniService.LeaderboardComparisonService
                .GetLeaderboardWithComparisonAsync(workspaceId, 1, 10);

            await _hubService.SendLeaderboardUpdateAsync(workspaceId, leaderboard);

            _debounceTimers.TryRemove(workspaceId, out _);
        }

        private static float ComputeScore(RankingCacheModel m)
        {
            double baseScore = m.ContributionPoint; // raw work
            double efficiency = m.Efficiency;
            double hours = m.TotalHours;

            var score =
                (baseScore * 0.75) +     // main driver
                (efficiency * 0.2) +     // quality
                (hours * 0.05);          // consistency

            return (float)Math.Round(score, 2);
        }

        private static void UpdateMetricFromEvent(EventsLogDto? eventLog, RankingCacheModel rankingCacheModel)
        {
            if (eventLog == null) return;

            switch (eventLog.EventTypeId)
            {

                case (int)GeneralEnums.EventType.TicketCompleted:
                    {
                        if (!string.IsNullOrEmpty(eventLog.Metadata))
                        {
                            var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(eventLog.Metadata);

                            float points = 0;

                            if (metadata != null && metadata.ContainsKey("points"))
                            {
                                points = Convert.ToSingle(metadata["points"]);
                            }

                            rankingCacheModel.ContributionPoint += points;
                            rankingCacheModel.TotalTicketCompleted += 1;
                            rankingCacheModel.Score += points;
                        }

                        break;
                    }
                case (int)GeneralEnums.EventType.SprintCompleted:
                    {
                        if (!string.IsNullOrEmpty(eventLog.Metadata))
                        {
                            var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(eventLog.Metadata);

                            float reward = 0;

                            if (metadata != null && metadata.ContainsKey("reward"))
                            {
                                reward = Convert.ToSingle(metadata["reward"]);
                            }

                            rankingCacheModel.ContributionPoint += reward;
                            rankingCacheModel.Score += reward;
                        }

                        break;
                    }

                case (int)GeneralEnums.EventType.CheckIn:
                    {
                        // Keep minimal or remove completely
                        rankingCacheModel.ContributionPoint += 0.5f;
                        rankingCacheModel.Score += 0.5f;
                        break;
                    }

                case (int)GeneralEnums.EventType.CheckOut:
                    {
                        if (!string.IsNullOrEmpty(eventLog.Metadata))
                        {
                            var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(eventLog.Metadata);

                            if (metadata != null && metadata.ContainsKey("sessionHours"))
                            {
                                float sessionHours = Convert.ToSingle(metadata["sessionHours"]);

                                rankingCacheModel.TotalHours += (int)sessionHours;

                                // OPTIONAL (low weight)
                                float scoreGain = sessionHours * 0.5f;

                                rankingCacheModel.Score += scoreGain;
                                rankingCacheModel.ContributionPoint += scoreGain;
                            }
                        }

                        break;
                    }

                default:
                    break;
            }
        }

        #endregion
    }

}
