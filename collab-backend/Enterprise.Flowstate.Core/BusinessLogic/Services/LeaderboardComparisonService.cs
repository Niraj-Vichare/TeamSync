using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class LeaderboardComparisonService : ILeaderboardComparisonService
    {
        private readonly ICache _cache;
        private readonly IOmniRepository _omniRepository;

        public LeaderboardComparisonService(ICache cache,IOmniRepository omniRepository)
        {
            _cache = cache;
            _omniRepository = omniRepository;
        }


        public async Task<LeaderboardResponse> GetLeaderboardWithComparisonAsync(string workspaceId, int pageNumber,int pageSize=10)
        {
            try
            {
                var (currentStart, currentEnd) = PeriodHelper.GetCurrentWeekPeriod();
                var (prevStart, prevEnd) = PeriodHelper.GetPreviousWeekPeriod();

                // Get current week rankings from Redis
                var currentRankings = await _cache.GetWorkspaceRankingsAsync(workspaceId,pageNumber,pageSize);

                if(currentRankings == null || currentRankings.Count <= 0)
                {
                    var dbRankings = await _omniRepository.LeaderBoardRepository.GetWorkspaceWeekRankings(workspaceId, currentStart, currentEnd);
                    if (dbRankings == null || dbRankings.Count == 0)
                    {
                        return new LeaderboardResponse
                        {
                            WorkspaceId = workspaceId,
                            CurrentPeriod = new PeriodInfo { StartDate = currentStart, EndDate = currentEnd },
                            PreviousPeriod = new PeriodInfo { StartDate = prevStart, EndDate = prevEnd },
                            Rankings = new List<UserRankingWithComparison>(),
                            GeneratedAt = DateTime.UtcNow
                        };
                    }
                    foreach (var ranking in dbRankings)
                    {
                        var rankMetric = ranking.Value;
                        var userId = ranking.Key;   

                        var metric = new RankingCacheModel
                        {
                            TotalHours = rankMetric.TotalHours,
                            TotalTicketCompleted = rankMetric.TotalTicketCompleted,
                            ContributionPoint = rankMetric.ContributionPoint,
                            Score = rankMetric.Score,
                            Efficiency = rankMetric.Efficiency,
                            Ranking = rankMetric.Ranking,
                            UserId = rankMetric.UserId,
                            UserName = rankMetric.UserName,
                            UserProfilePic = rankMetric.UserProfilePic
                        };

                        await _cache.UpsertUserMetricAsync(workspaceId,userId, metric);
                        await _cache.UpdateWorkspaceRankingAtomicAsync(workspaceId, userId, (double)rankMetric.Score);
                    }
                }


                var userRankings = new List<UserRankingWithComparison>();

                foreach (var entry in currentRankings)
                {
                    var comparison = await GetUserRankingWithComparisonAsync(workspaceId, entry.Key);

                    await _cache.UpsertUserMetricAsync(workspaceId,entry.Key, entry.Value);
                    if (comparison != null)
                    {
                        userRankings.Add(comparison);
                    }
                }

                return new LeaderboardResponse
                {
                    WorkspaceId = workspaceId,
                    CurrentPeriod = new PeriodInfo
                    {
                        StartDate = currentStart,
                        EndDate = currentEnd
                    },
                    PreviousPeriod = new PeriodInfo
                    {
                        StartDate = prevStart,
                        EndDate = prevEnd
                    },
                    Rankings = userRankings,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error getting leaderboard with comparison");
                return null;
            }
        }

        public async Task<UserRankingWithComparison> GetUserRankingWithComparisonAsync(string workspaceId,string userId)
        {
            try
            {
                // Get current week data from Redis
                var currentMetric = await _cache.GetUserMetricAsync(workspaceId, userId);
                var currentRank = await _cache.GetUserRankAsync(workspaceId, userId);
                var currentScore = await _cache.GetUserScore(workspaceId, userId);

                if (currentMetric == null)
                {
                    //_logger.LogWarning("No current metric found for user {UserId} in workspace {WorkspaceId}",
                    //    userId, workspaceId);
                    return null;
                }

                // Get previous week data from cache
                var prevMetric = await _cache.GetPreviousWeekMetricAsync(workspaceId, userId);
                var prevRank = await _cache.GetPreviousWeekRankAsync(workspaceId, userId);
                var prevScore = await _cache.GetPreviousWeekScoreAsync(workspaceId, userId);

                if (prevMetric == null)
                {
                    var (prevStart, prevEnd) = PeriodHelper.GetPreviousWeekPeriod();

                    var dbRankings = await _omniRepository.LeaderBoardRepository.GetUserMetricAsync(workspaceId,userId, prevStart, prevEnd);


                    if (dbRankings != null)
                    {
                        prevMetric = new RankingCacheModel
                        {
                            TotalHours = (int)dbRankings.TotalHours,
                            TotalTicketCompleted = dbRankings.TicketCompleted ?? 0,
                            ContributionPoint = dbRankings.ContributionPoints,
                            Score = dbRankings.Score,
                            Efficiency = dbRankings.Efficiency,
                            Ranking = dbRankings?.RankPosition ?? -1
                        };
                        prevRank = dbRankings?.RankPosition;
                        prevScore = dbRankings?.Score;

                        // Cache the previous week data for future requests
                        await _cache.SetAsync(
                            string.Format(FlowStateConstants.PREVIOUS_WEEK_METRIC_KEY, workspaceId, userId),
                            prevMetric,
                            TimeSpan.FromDays(7)
                        );
                    }
                }

                // Calculate comparison
                var comparison = CalculateComparison(
                    currentRank ?? 0,
                    currentScore,
                    currentMetric,
                    prevRank,
                    prevScore,
                    prevMetric);

                return new UserRankingWithComparison
                {
                    UserId = userId,
                    UserName = currentMetric.UserName,
                    UserAvatar = currentMetric.UserProfilePic,
                    CurrentRank = currentRank ?? 0,
                    CurrentScore = currentScore,
                    CurrentMetrics = new WeeklyUserStatsDto
                    {
                        TotalHours = currentMetric.TotalHours,
                        TicketsCompleted = currentMetric.TotalTicketCompleted,
                        Score = currentMetric.Score,
                        ContributionPoint = currentMetric.ContributionPoint,
                        Efficiency = currentMetric.Efficiency
                    },
                    PreviousRank = prevRank,
                    PreviousScore = prevScore,
                    PreviousMetrics = prevMetric != null ? new WeeklyUserStatsDto
                    {
                        TotalHours = prevMetric.TotalHours,
                        TicketsCompleted = prevMetric.TotalTicketCompleted,
                        Score = prevMetric.Score,
                        ContributionPoint = prevMetric.ContributionPoint,
                        Efficiency = prevMetric.Efficiency
                    } : null,
                    Comparison = comparison
                };
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error getting user ranking comparison for user {UserId} in workspace {WorkspaceId}",
                //    userId, workspaceId);
                return null;
            }
        }
        public async Task<List<RankingHistoryDto>> GetUserRankingHistory(string workspaceGuid, string userGuid)
        {
            var rankings = await _omniRepository.LeaderBoardRepository
                .GetUserRankingHistory(workspaceGuid, userGuid);

            // Build last 6-month window
            var now = DateTime.UtcNow;
            var lastSixMonths = Enumerable.Range(0, 6)
                .Select(i => new DateTime(now.Year, now.Month, 1).AddMonths(-i))
                .OrderBy(d => d)
                .ToList();

            // Prepare final list
            var result = new List<RankingHistoryDto>();

            foreach (var monthStart in lastSixMonths)
            {
                var year = monthStart.Year;
                var month = monthStart.Month;

                var recordsForMonth = rankings?
                    .Where(r => r.EndPeriod.Value.Year == year && r.EndPeriod.Value.Month == month)
                    .OrderBy(r => r.EndPeriod)
                    .ToList();

                if (recordsForMonth != null && recordsForMonth.Any())
                {
                    var last = recordsForMonth.Last();

                    result.Add(new RankingHistoryDto
                    {
                        Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                        Score = Math.Round((float)last.Score, 2),
                        Rank = last.RankPosition
                    });
                }
                else
                {
                    // Default values when no ranking exists for the month
                    result.Add(new RankingHistoryDto
                    {
                        Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                        Score = 0,
                        Rank = 0
                    });
                }
            }

            return result;
        }

        public async Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate)
        {
            var isTrue = await _omniRepository.LeaderBoardRepository.IsWeeklyUserStatsPresent(startDate, endDate);
            return isTrue;
        }

        private RankingComparison CalculateComparison(int currentRank,double currentScore,RankingCacheModel currentMetric,int? prevRank,double? prevScore,RankingCacheModel prevMetric)
        {
            var comparison = new RankingComparison();

            if (!prevRank.HasValue || prevMetric == null)
            {
                // New user this week
                comparison.RankChangeType = RankChangeType.New;
                comparison.RankChange = 0;
                comparison.RankChangeDisplay = "NEW";
                comparison.RankChangeColor = "blue";
                comparison.ScoreChange = currentScore;
                comparison.ScoreChangePercentage = 0;
            }
            else
            {
                // Calculate rank change (lower rank number = better)
                comparison.RankChange = prevRank.Value - currentRank; // Positive = improved

                if (comparison.RankChange > 0)
                {
                    comparison.RankChangeType = RankChangeType.Up;
                    comparison.RankChangeDisplay = $"↑ {comparison.RankChange}";
                    comparison.RankChangeColor = "green";
                }
                else if (comparison.RankChange < 0)
                {
                    comparison.RankChangeType = RankChangeType.Down;
                    comparison.RankChangeDisplay = $"↓ {Math.Abs(comparison.RankChange)}";
                    comparison.RankChangeColor = "red";
                }
                else
                {
                    comparison.RankChangeType = RankChangeType.Same;
                    comparison.RankChangeDisplay = "−";
                    comparison.RankChangeColor = "gray";
                }

                // Calculate score change
                comparison.ScoreChange = currentScore - (prevScore ?? 0);
                comparison.ScoreChangePercentage = prevScore > 0
                    ? (comparison.ScoreChange / prevScore.Value) * 100
                    : 0;
            }

            // Calculate metric changes
            if (prevMetric != null)
            {
                comparison.PointsChange = currentMetric.ContributionPoint - prevMetric.ContributionPoint;
                comparison.TicketsCompletedChange = currentMetric.TotalTicketCompleted - prevMetric.TotalTicketCompleted;
                comparison.HoursChange = currentMetric.TotalHours - prevMetric.TotalHours;
                comparison.EfficiencyChange = currentMetric.Efficiency - prevMetric.Efficiency;
            }
            else
            {
                comparison.PointsChange = currentMetric.ContributionPoint;
                comparison.TicketsCompletedChange = currentMetric.TotalTicketCompleted;
                comparison.HoursChange = currentMetric.TotalHours;
                comparison.EfficiencyChange = currentMetric.Efficiency;
            }

            return comparison;
        }
        


    }
}
