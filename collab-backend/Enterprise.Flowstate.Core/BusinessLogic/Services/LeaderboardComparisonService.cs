using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;
using System.Globalization;

public class LeaderboardComparisonService : ILeaderboardComparisonService
{
    private readonly ICache _cache;
    private readonly IOmniRepository _omniRepository;

    public LeaderboardComparisonService(ICache cache, IOmniRepository omniRepository)
    {
        _cache = cache;
        _omniRepository = omniRepository;
    }

    public async Task<LeaderboardResponse> GetLeaderboardWithComparisonAsync(
        string workspaceId, int pageNumber, int pageSize = 10)
    {
        try
        {
            var (currentStart, currentEnd) = PeriodHelper.GetCurrentWeekPeriod();
            var (prevStart, prevEnd) = PeriodHelper.GetPreviousWeekPeriod();

            // Try Redis first
            var currentRankings = await _cache.GetWorkspaceRankingsAsync(workspaceId, pageNumber, pageSize);
            bool fromRedis = currentRankings != null && currentRankings.Count > 0 && currentRankings.Count <= pageSize;
            var pagedRankings = fromRedis
                ? currentRankings
                : currentRankings.Skip((pageNumber - 1) * pageSize).Take(pageSize)
                    .ToDictionary(k => k.Key, v => v.Value);
            // Cache miss — load from DB and warm the cache atomically
            if (currentRankings == null || currentRankings.Count == 0)
            {
                currentRankings = await WarmCacheFromDatabaseAsync(workspaceId, currentStart, currentEnd);
            }

            if (currentRankings == null || currentRankings.Count == 0)
            {
                return BuildEmptyResponse(workspaceId, currentStart, currentEnd, prevStart, prevEnd);
            }

            // Page the in-memory result (already paged if from Redis, apply manually if from DB)
            

            var userRankings = new List<UserRankingWithComparison>();

            // Run comparisons in parallel — each user is independent
            var tasks = pagedRankings.Select(entry =>
                GetUserRankingWithComparisonAsync(workspaceId, entry.Key, entry.Value));

            var results = await System.Threading.Tasks.Task.WhenAll(tasks);
            userRankings.AddRange(results.Where(r => r != null));

            return new LeaderboardResponse
            {
                WorkspaceId = workspaceId,
                CurrentPeriod = new PeriodInfo { StartDate = currentStart, EndDate = currentEnd },
                PreviousPeriod = new PeriodInfo { StartDate = prevStart, EndDate = prevEnd },
                Rankings = userRankings.OrderBy(r => r.CurrentRank).ToList(),
                TotalCount = currentRankings.Count,
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            // TODO: inject and use ILogger
            return null;
        }
    }

    // Pass currentMetric in so GetUserRankingWithComparisonAsync doesn't re-fetch from cache
    public async Task<UserRankingWithComparison> GetUserRankingWithComparisonAsync(
        string workspaceId, string userId, RankingCacheModel currentMetric = null)
    {
        try
        {
            // Use passed-in metric or fetch if called standalone
            currentMetric ??= await _cache.GetUserMetricAsync(workspaceId, userId);
            var currentRank = await _cache.GetUserRankAsync(workspaceId, userId);
            var currentScore = await _cache.GetUserScore(workspaceId, userId);

            if (currentMetric == null) return null;

            // Try previous week from cache first
            var prevMetric = await _cache.GetPreviousWeekMetricAsync(workspaceId, userId);
            var prevRank = await _cache.GetPreviousWeekRankAsync(workspaceId, userId);
            var prevScore = await _cache.GetPreviousWeekScoreAsync(workspaceId, userId);

            // Previous week cache miss — hit DB once and write back
            if (prevMetric == null)
            {
                var (prevStart, prevEnd) = PeriodHelper.GetPreviousWeekPeriod();
                var dbPrev = await _omniRepository.LeaderBoardRepository
                    .GetUserMetricAsync(workspaceId, userId, prevStart, prevEnd);

                if (dbPrev != null)
                {
                    prevMetric = new RankingCacheModel
                    {
                        TotalHours = (int)(dbPrev.TotalHours ?? 0),
                        TotalTicketCompleted = dbPrev.TicketCompleted ?? 0,
                        ContributionPoint = dbPrev.ContributionPoints,
                        Score = dbPrev.Score,
                        Efficiency = dbPrev.Efficiency,
                        Ranking = dbPrev.RankPosition
                    };
                    prevRank = dbPrev.RankPosition;
                    prevScore = dbPrev.Score;

                    // Write back so next call is cache-only
                    await _cache.SetAsync(
                        string.Format(FlowStateConstants.Cache.UserMetricPrevious, workspaceId, userId),
                        prevMetric,
                        TimeSpan.FromDays(7));
                }
            }

            var comparison = CalculateComparison(
                currentRank ?? 0, currentScore, currentMetric,
                prevRank, prevScore, prevMetric);

            return new UserRankingWithComparison
            {
                UserId = userId,
                UserName = currentMetric.UserName,
                UserAvatar = currentMetric.UserProfilePic,
                CurrentRank = currentRank ?? 0,
                CurrentScore = currentScore,
                CurrentMetrics = MapToDto(currentMetric),
                PreviousRank = prevRank,
                PreviousScore = prevScore,
                PreviousMetrics = prevMetric != null ? MapToDto(prevMetric) : null,
                Comparison = comparison
            };
        }
        catch (Exception ex)
        {
            return null;
        }
    }

    public async Task<List<RankingHistoryDto>> GetUserRankingHistory(
        string workspaceGuid, string userGuid)
    {
        var rankings = await _omniRepository.LeaderBoardRepository
            .GetUserRankingHistory(workspaceGuid, userGuid);

        var now = DateTime.UtcNow;
        var lastSixMonths = Enumerable.Range(0, 6)
            .Select(i => new DateTime(now.Year, now.Month, 1).AddMonths(-i))
            .OrderBy(d => d)
            .ToList();

        return lastSixMonths.Select(monthStart =>
        {
            var monthRecords = rankings?
                .Where(r => r.EndPeriod?.Year == monthStart.Year
                         && r.EndPeriod?.Month == monthStart.Month)
                .OrderBy(r => r.EndPeriod)
                .ToList();

            var monthName = CultureInfo.CurrentCulture.DateTimeFormat
                .GetMonthName(monthStart.Month);

            if (monthRecords != null && monthRecords.Any())
            {
                var last = monthRecords.Last();
                return new RankingHistoryDto
                {
                    Month = monthName,
                    Score = Math.Round((float)(last.Score ?? 0), 2),
                    Rank = last.RankPosition
                };
            }

            return new RankingHistoryDto { Month = monthName, Score = 0, Rank = 0 };
        }).ToList();
    }

    public async Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate)
        => await _omniRepository.LeaderBoardRepository
            .IsWeeklyUserStatsPresent(startDate, endDate);

    // --- Private helpers ---

    private async Task<Dictionary<string, RankingCacheModel>> WarmCacheFromDatabaseAsync(
        string workspaceId, DateTime currentStart, DateTime currentEnd)
        {
        var dbRankings = await _omniRepository.LeaderBoardRepository
            .GetWorkspaceWeekRankings(workspaceId, currentStart, currentEnd);

        if (dbRankings == null || dbRankings.Count == 0)
            return new Dictionary<string, RankingCacheModel>();

        // Write all users to cache atomically before returning
        var writeTasks = dbRankings.Select(async kvp =>
        {
            await _cache.UpsertUserMetricAsync(workspaceId, kvp.Key, kvp.Value);
            await _cache.UpdateWorkspaceRankingAtomicAsync(
                workspaceId, kvp.Key, (double)kvp.Value.Score);
        });

        await System.Threading.Tasks.Task.WhenAll(writeTasks);

        return dbRankings;
    }

    private static WeeklyUserStatsDto MapToDto(RankingCacheModel m) => new()
    {
        TotalHours = m.TotalHours,
        TicketsCompleted = m.TotalTicketCompleted,
        Score = m.Score,
        ContributionPoint = m.ContributionPoint,
        Efficiency = m.Efficiency
    };

    private static LeaderboardResponse BuildEmptyResponse(
        string workspaceId,
        DateTime currentStart, DateTime currentEnd,
        DateTime prevStart, DateTime prevEnd) => new()
        {
            WorkspaceId = workspaceId,
            CurrentPeriod = new PeriodInfo { StartDate = currentStart, EndDate = currentEnd },
            PreviousPeriod = new PeriodInfo { StartDate = prevStart, EndDate = prevEnd },
            Rankings = new List<UserRankingWithComparison>(),
            TotalCount = 0,
            GeneratedAt = DateTime.UtcNow
        };

    private static RankingComparison CalculateComparison(
        int currentRank, double currentScore, RankingCacheModel currentMetric,
        int? prevRank, double? prevScore, RankingCacheModel prevMetric)
    {
        var comparison = new RankingComparison();

        if (!prevRank.HasValue || prevMetric == null)
        {
            comparison.RankChangeType = RankChangeType.New;
            comparison.RankChange = 0;
            comparison.RankChangeDisplay = "NEW";
            comparison.RankChangeColor = "blue";
            comparison.ScoreChange = currentScore;
            comparison.ScoreChangePercentage = 0;
        }
        else
        {
            comparison.RankChange = prevRank.Value - currentRank;

            (comparison.RankChangeType, comparison.RankChangeDisplay, comparison.RankChangeColor) =
                comparison.RankChange switch
                {
                    > 0 => (RankChangeType.Up, $"↑ {comparison.RankChange}", "green"),
                    < 0 => (RankChangeType.Down, $"↓ {Math.Abs(comparison.RankChange)}", "red"),
                    _ => (RankChangeType.Same, "−", "gray")
                };

            comparison.ScoreChange = currentScore - (prevScore ?? 0);
            comparison.ScoreChangePercentage = prevScore > 0
                ? (comparison.ScoreChange / prevScore.Value) * 100
                : 0;
        }

        if (prevMetric != null)
        {
            comparison.PointsChange = (float)(currentMetric.ContributionPoint - prevMetric.ContributionPoint);
            comparison.TicketsCompletedChange = currentMetric.TotalTicketCompleted - prevMetric.TotalTicketCompleted;
            comparison.HoursChange = currentMetric.TotalHours - prevMetric.TotalHours;
            comparison.EfficiencyChange = currentMetric.Efficiency - prevMetric.Efficiency;
        }
        else
        {
            comparison.PointsChange = (float)currentMetric.ContributionPoint;
            comparison.TicketsCompletedChange = currentMetric.TotalTicketCompleted;
            comparison.HoursChange = currentMetric.TotalHours;
            comparison.EfficiencyChange = currentMetric.Efficiency;
        }

        return comparison;
    }
}