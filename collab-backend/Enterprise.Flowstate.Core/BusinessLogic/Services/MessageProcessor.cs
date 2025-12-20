using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class MessageProcessor:IMessageProcessor
    {
        private ICache _cache;
        private IOmniService _omniService;
        private readonly ILeaderboardHubService _hubService;
        private ILogger<MessageProcessor> _logger;
        public MessageProcessor(ICache cacheRepository,IOmniService omniService,ILogger<MessageProcessor> logger,ILeaderboardHubService leaderboardHubService)
        {
            _cache = cacheRepository;
            _omniService = omniService;
            _logger = logger;
            _hubService = leaderboardHubService;
        }
        public async Task<bool> ProcessMessageAsync(EventsLogDto eventLogDto)
        {
            if (eventLogDto == null)
            {
                throw new InvalidOperationException("Invalid message payload");
            }
            /*
            #region First Version
            try
            {
                // Get or create metric from cache
                RankingCacheModel metric = await _cache.GetUserMetricAsync(eventLogDto.UserId, eventLogDto.WorkspaceId);

                if (metric == null)
                {
                    var userDbMetric = await _omniService.DashboardService.GetUserMetric(eventLogDto.WorkspaceId, eventLogDto.UserId);
                    var rankingMetric = await _omniService.WorkspaceService.GetUserRanking(eventLogDto.WorkspaceId, eventLogDto.UserId);

                    if (userDbMetric == null || rankingMetric == null)
                    {
                        _logger.LogWarning("User metric not found for UserId={UserId}, WorkspaceId={WorkspaceId}", eventLogDto.UserId, eventLogDto.WorkspaceId);
                        // NACK the message to requeue it
                        //await _channel.BasicNackAsync(@event.DeliveryTag, false, true);
                        return false;
                    }

                    // FIX: Assign the created model to 'metric'
                    metric = new RankingCacheModel
                    {
                        ContributionScore = userDbMetric.ContributionScore,
                        Efficiency = userDbMetric.Efficiency,
                        Point = userDbMetric.Points,
                        Ranking = rankingMetric.RankPosition,
                        TotalHours = userDbMetric.TotalHours,
                        TotalTaskCompleted = userDbMetric.TasksCompleted,
                    };
                }
            
                double newMetricScore = ComputeScore(metric);

                // Update metric based on event
                UpdateRankingMetric(eventLogDto, metric);

                var rank = await _cache.UpdateWorkspaceRankingAsync(eventLogDto.WorkspaceId, eventLogDto.UserId, newMetricScore);

                // Create or Update the existing metric in cache
                await _cache.UpsertUserMetricAsync(eventLogDto.WorkspaceId, eventLogDto.UserId,metric);

            
                return true;
            }
            #endregion
            */


            var metric = await _cache.GetUserMetricAsync(eventLogDto.WorkspaceId, eventLogDto.UserId);

            if (metric == null)
            {
                metric = new RankingCacheModel
                {
                    Score = 0,
                    Efficiency = 0,
                    ContributionPoint = 0,
                    Ranking = 0,
                    TotalHours = 0,
                    TotalTaskCompleted = 0
                };
            }

            UpdateMetricFromEvent(eventLogDto, metric);


            double newScore = ComputeScore(metric);

            var newRank = await _cache.UpdateWorkspaceRankingAsync(eventLogDto.WorkspaceId, eventLogDto.UserId, newScore);
            if (newRank == -1)
            {

            }
            metric.Ranking = newRank;

            await _cache.UpsertUserMetricAsync(eventLogDto.WorkspaceId,eventLogDto.UserId,metric);

            // Background job will handle actual DB write
            await _cache.AddPendingUpdateAsync(eventLogDto.WorkspaceId,eventLogDto.UserId);

            var leaderboard = await _omniService.LeaderboardComparisonService.GetLeaderboardWithComparisonAsync(
                    eventLogDto.WorkspaceId,0,10);

            await _hubService.SendLeaderboardUpdateAsync(
                eventLogDto.WorkspaceId,
                leaderboard);

            _logger.LogDebug("Processed event for UserId={UserId}, Rank={Rank}, Score={Score:F2}",eventLogDto.UserId, newRank, newScore);

            return true;

        }

        #region Private Methods
        private static double ComputeScore(RankingCacheModel m)
        {
            double eff = m.Efficiency;
            double pts = m.ContributionPoint;
            double cs = (double)m.Score;
            double hrs = m.TotalHours;

            var score =
                (eff * 0.4) +
                (pts * 0.3) +
                (cs * 0.2) +
                (hrs * 0.1);

            return Math.Round(score, 2);
        }

        private static void UpdateMetricFromEvent(EventsLogDto? eventLog, RankingCacheModel rankingCacheModel)
        {
            if (eventLog == null) return;

            switch (eventLog.EventTypeId)
            {
                case (int)GeneralEnums.EventType.TicketCompleted:
                    rankingCacheModel.ContributionPoint += 10;
                    rankingCacheModel.TotalTaskCompleted += 1;
                    break;
                case (int)GeneralEnums.EventType.SprintCompleted:
                    rankingCacheModel.ContributionPoint += 50;
                    break;
                case (int)GeneralEnums.EventType.CheckIn:
                    rankingCacheModel.ContributionPoint += 1;
                    break;
                case (int)GeneralEnums.EventType.TaskCompleted:
                    rankingCacheModel.TotalTaskCompleted += 1;
                    break;
                default:
                    break;
            }
        }
        
        #endregion
    }

}
