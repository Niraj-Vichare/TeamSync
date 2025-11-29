using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
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
        public MessageProcessor(ICache cacheRepository,IOmniService omniService)
        {
            _cache = cacheRepository;
            _omniService = omniService;
        }
        public async Task<bool> ProcessMessageAsync(EventsLogDto eventLogDto)
        {
            if (eventLogDto == null)
            {
                throw new InvalidOperationException("Invalid message payload");
            }

            // Get or create metric from cache
            RankingCacheModel metric = await _cache.GetUserMetricAsync(eventLogDto.UserId, eventLogDto.WorkspaceId);

            if (metric == null)
            {
                var userDbMetric = await _omniService.DashboardService.GetUserMetric(eventLogDto.WorkspaceId, eventLogDto.UserId);
                var rankingMetric = await _omniService.WorkspaceService.GetUserRanking(eventLogDto.WorkspaceId, eventLogDto.UserId);

                if (userDbMetric == null || rankingMetric == null)
                {
                    //_logger.LogWarning("User metric not found for UserId={UserId}, WorkspaceId={WorkspaceId}", eventLogDto.UserId, eventLogDto.WorkspaceId);
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

                // Add to cache
                await _cache.UpsertUserMetricAsync(eventLogDto.WorkspaceId, eventLogDto.UserId, metric);
            }
            // Get the updated score
            double newMetricScore = ComputeScore(metric);

            // Update the ranking cache
            var rank = await _cache.UpdateWorkspaceRankingAsync(eventLogDto.WorkspaceId, eventLogDto.UserId, newMetricScore);

            RankingCacheModel rankingModel = new RankingCacheModel
            {
                Efficiency = metric.Efficiency,
                Point = metric.Point,
                Ranking = rank,
                TotalHours = metric.TotalHours,
                TotalTaskCompleted = metric.TotalTaskCompleted,
                ContributionScore = metric.ContributionScore,
            };

            // Update metric according to event
            UpdateRankingMetric(eventLogDto, rankingModel);

            // Update the User Metric Cache
            await _cache.UpsertUserMetricAsync(eventLogDto.WorkspaceId, eventLogDto.UserId, rankingModel);
            return true;

        }
        private static double ComputeScore(RankingCacheModel m)
        {
            double eff = m.Efficiency ?? 0;
            double pts = m.Point ?? 0;
            double cs = m.ContributionScore ?? 0;
            double hrs = m.TotalHours ?? 0;

            var score =
                (eff * 0.4) +
                (pts * 0.3) +
                (cs * 0.2) +
                (hrs * 0.1);

            return Math.Round(score, 2);
        }



        private void UpdateRankingMetric(EventsLogDto? eventLog, RankingCacheModel rankingCacheModel)
        {
            if (eventLog == null) return;

            switch (eventLog.EventTypeId)
            {
                case (int)GeneralEnums.EventType.TicketCompleted:
                    rankingCacheModel.Point += 10;
                    rankingCacheModel.TotalTaskCompleted += 1;
                    break;
                case (int)GeneralEnums.EventType.SprintCompleted:
                    rankingCacheModel.Point += 50;
                    break;
                case (int)GeneralEnums.EventType.CheckIn:
                    rankingCacheModel.Point += 1;
                    break;
                case (int)GeneralEnums.EventType.TaskCompleted:
                    rankingCacheModel.TotalTaskCompleted += 1;
                    break;
                default:
                    break;
            }
        }
    }

}
