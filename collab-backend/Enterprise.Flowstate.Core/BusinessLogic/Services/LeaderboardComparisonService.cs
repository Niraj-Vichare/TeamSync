using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;
using System.Globalization;
using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Task = System.Threading.Tasks.Task;

public class LeaderboardComparisonService : ILeaderboardComparisonService
{
    private readonly ICache _cache;
    private readonly IOmniRepository _omniRepository;
    private readonly ILogger<LeaderboardComparisonService> _logger;

    public LeaderboardComparisonService(
        ICache cache,
        IOmniRepository omniRepository,
        ILogger<LeaderboardComparisonService> logger)
    {
        _cache = cache;
        _omniRepository = omniRepository;
        _logger = logger;
    }

    public async Task<LeaderboardResponse> GetLeaderboardWithComparisonAsync(
        string workspaceId, int pageNumber, int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(workspaceId))
            throw new ArgumentException("Workspace ID is required.", nameof(workspaceId));

        if (pageNumber < 1)
            throw new ArgumentOutOfRangeException(nameof(pageNumber), "Page number must be >= 1.");

        if (pageSize < 1)
            throw new ArgumentOutOfRangeException(nameof(pageSize), "Page size must be >= 1.");

        var (currentStart, currentEnd) = PeriodHelper.GetCurrentWeekPeriod();
        var (prevStart, prevEnd) = PeriodHelper.GetPreviousWeekPeriod();

        try
        {
            // Try to get the requested page from cache first.
            var cachedPage = await _cache.GetWorkspaceRankingsAsync(workspaceId, pageNumber, pageSize);

            Dictionary<string, RankingCacheModel> rankingsToUse;
            bool cameFromDatabase = false;

            if (cachedPage == null || cachedPage.Count == 0)
            {
                rankingsToUse = await WarmCacheFromDatabaseAsync(workspaceId, currentStart, currentEnd);
                cameFromDatabase = true;
            }
            else
            {
                rankingsToUse = cachedPage;
            }

            if (rankingsToUse == null || rankingsToUse.Count == 0)
            {
                return BuildEmptyResponse(workspaceId, currentStart, currentEnd, prevStart, prevEnd);
            }

            var pageRankings = cameFromDatabase
                ? rankingsToUse
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToDictionary(k => k.Key, v => v.Value)
                : rankingsToUse;

            var comparisonTasks = pageRankings.Select(async entry =>
            {
                try
                {
                    return await GetUserRankingWithComparisonAsync(workspaceId, entry.Key, entry.Value);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed building comparison for user {UserId} in workspace {WorkspaceId}",
                        entry.Key, workspaceId);
                    return null;
                }
            });

            var results = await Task.WhenAll(comparisonTasks);

            return new LeaderboardResponse
            {
                WorkspaceId = workspaceId,
                CurrentPeriod = new PeriodInfo { StartDate = currentStart, EndDate = currentEnd },
                PreviousPeriod = new PeriodInfo { StartDate = prevStart, EndDate = prevEnd },
                Rankings = results.Where(x => x != null).OrderBy(x => x!.CurrentRank).ToList()!,
                TotalCount = cameFromDatabase ? rankingsToUse.Count : await _cache.GetWorkspaceRankingCountAsync(workspaceId),
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build leaderboard for workspace {WorkspaceId}", workspaceId);
            return BuildEmptyResponse(workspaceId, currentStart, currentEnd, prevStart, prevEnd);
        }
    }

    public async Task<UserRankingWithComparison?> GetUserRankingWithComparisonAsync(
    string workspaceId,
    string userId,
    RankingCacheModel? currentMetric = null)
    {
        if (string.IsNullOrWhiteSpace(workspaceId))
            throw new ArgumentException("Workspace ID is required.", nameof(workspaceId));

        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID is required.", nameof(userId));

        try
        {
            // --- CURRENT DATA ---
            currentMetric ??= await _cache.GetUserMetricAsync(workspaceId, userId);

            if (currentMetric == null)
            {
                _logger.LogWarning(
                    "Current metric missing for user {UserId} in workspace {WorkspaceId}",
                    userId, workspaceId);
                return null;
            }

            int currentRank = (await _cache.GetUserRankAsync(workspaceId, userId)) ?? 0;
            double currentScore = await _cache.GetUserScore(workspaceId, userId);

            // --- PREVIOUS DATA (CACHE FIRST) ---
            var prevMetric = await _cache.GetPreviousWeekMetricAsync(workspaceId, userId);
            var prevRank = await _cache.GetPreviousWeekRankAsync(workspaceId, userId);
            var prevScore = await _cache.GetPreviousWeekScoreAsync(workspaceId, userId);

            // --- FALLBACK TO DB IF CACHE MISS ---
            if (prevMetric == null && !prevRank.HasValue && !prevScore.HasValue)
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
                        Ranking = dbPrev.RankPosition,
                        UserName = dbPrev.User?.DisplayName,
                        UserProfilePic = dbPrev.User?.ProfileImageUrl
                    };

                    prevRank = dbPrev.RankPosition;
                    prevScore = dbPrev.Score;

                    // Write-through cache
                    await _cache.SetAsync(
                        string.Format(FlowStateConstants.Cache.UserMetricPrevious, workspaceId, userId),
                        prevMetric,
                        TimeSpan.FromDays(7));
                }
            }

            // --- NORMALIZATION (CRITICAL FIX) ---
            int prevRankSafe = prevRank ?? 0;
            double prevScoreSafe = prevScore ?? 0;
            var prevMetricSafe = prevMetric ?? new RankingCacheModel();

            bool hasPreviousData = prevMetric != null || prevRank.HasValue || prevScore.HasValue;

            // --- COMPARISON ---
            var comparison = new RankingComparison();

            if (!hasPreviousData)
            {
                comparison.RankChangeType = RankChangeType.New;
                comparison.RankChange = 0;
                comparison.RankChangeDisplay = "NEW";
                comparison.RankChangeColor = "blue";
                comparison.ScoreChange = currentScore;
                comparison.ScoreChangePercentage = currentScore > 0 ? 100 : 0;
            }
            else
            {
                comparison.RankChange = (prevRankSafe > 0 && currentRank > 0)
                    ? prevRankSafe - currentRank
                    : 0;

                (comparison.RankChangeType, comparison.RankChangeDisplay, comparison.RankChangeColor) =
                    comparison.RankChange switch
                    {
                        > 0 => (RankChangeType.Up, $"↑ {comparison.RankChange}", "green"),
                        < 0 => (RankChangeType.Down, $"↓ {Math.Abs(comparison.RankChange)}", "red"),
                        _ => (RankChangeType.Same, "−", "gray")
                    };

                comparison.ScoreChange = currentScore - prevScoreSafe;

                comparison.ScoreChangePercentage =
                    prevScoreSafe != 0
                        ? (comparison.ScoreChange / prevScoreSafe) * 100
                        : (currentScore > 0 ? 100 : 0);
            }

            // --- METRIC DELTAS ---
            comparison.PointsChange =(float)(currentMetric.ContributionPoint - prevMetricSafe.ContributionPoint);

            comparison.TicketsCompletedChange =
                currentMetric.TotalTicketCompleted - prevMetricSafe.TotalTicketCompleted;

            comparison.HoursChange =
                currentMetric.TotalHours - prevMetricSafe.TotalHours;

            comparison.EfficiencyChange =
                currentMetric.Efficiency - prevMetricSafe.Efficiency;

            // --- FINAL DTO ---
            return new UserRankingWithComparison
            {
                UserId = userId,
                UserName = currentMetric.UserName,
                UserAvatar = currentMetric.UserProfilePic,

                CurrentRank = currentRank,
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
            _logger.LogError(ex,
                "Failed to build comparison for user {UserId} in workspace {WorkspaceId}",
                userId, workspaceId);
            return null;
        }
    }

    public async Task<List<RankingHistoryDto>> GetUserRankingHistory(
        string workspaceGuid, string userGuid)
    {
        try
        {
            var rankings = await _omniRepository.LeaderBoardRepository
                .GetUserRankingHistory(workspaceGuid, userGuid);

            var now = DateTime.UtcNow;
            var months = Enumerable.Range(0, 6)
                .Select(i => new DateTime(now.Year, now.Month, 1).AddMonths(-i))
                .OrderBy(d => d)
                .ToList();

            return months.Select(monthStart =>
            {
                var monthRecords = rankings?
                    .Where(r => r.EndPeriod.HasValue &&
                                r.EndPeriod.Value.Year == monthStart.Year &&
                                r.EndPeriod.Value.Month == monthStart.Month)
                    .OrderBy(r => r.EndPeriod)
                    .ToList();

                var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthStart.Month);

                if (monthRecords != null && monthRecords.Any())
                {
                    var last = monthRecords.Last();
                    return new RankingHistoryDto
                    {
                        Month = monthName,
                        Score = Math.Round((float)(last.Score), 2),
                        Rank = last.RankPosition
                    };
                }

                return new RankingHistoryDto
                {
                    Month = monthName,
                    Score = 0,
                    Rank = 0
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to load ranking history for workspace {WorkspaceGuid}, user {UserGuid}",
                workspaceGuid, userGuid);

            return new List<RankingHistoryDto>();
        }
    }

    public Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate)
        => _omniRepository.LeaderBoardRepository.IsWeeklyUserStatsPresent(startDate, endDate);

    private async Task<Dictionary<string, RankingCacheModel>> WarmCacheFromDatabaseAsync(
        string workspaceId, DateTime currentStart, DateTime currentEnd)
    {
        var dbRankings = await _omniRepository.LeaderBoardRepository
            .GetWorkspaceWeekRankings(workspaceId, currentStart, currentEnd);

        if (dbRankings == null || dbRankings.Count == 0)
            return new Dictionary<string, RankingCacheModel>();

        var writeTasks = dbRankings.Select(async kvp =>
        {
            await _cache.UpsertUserMetricAsync(workspaceId, kvp.Key, kvp.Value);
            await _cache.UpdateWorkspaceRankingAtomicAsync(
                workspaceId, kvp.Key, (double)kvp.Value.Score);
        });

        await Task.WhenAll(writeTasks);

        return dbRankings;
    }

    private static WeeklyUserStatsDto MapToDto(RankingCacheModel model) => new()
    {
        TotalHours = model.TotalHours,
        TicketsCompleted = model.TotalTicketCompleted,
        Score = model.Score,
        ContributionPoint = model.ContributionPoint,
        Efficiency = model.Efficiency
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
        int currentRank,
        double currentScore,
        RankingCacheModel currentMetric,
        int? prevRank,
        double? prevScore,
        RankingCacheModel? prevMetric)
    {
        if (currentMetric == null)
            throw new ArgumentNullException(nameof(currentMetric));

        var comparison = new RankingComparison();

        bool isNew = !prevRank.HasValue && prevMetric == null && !prevScore.HasValue;

        if (isNew)
        {
            comparison.RankChangeType = RankChangeType.New;
            comparison.RankChange = 0;
            comparison.RankChangeDisplay = "NEW";
            comparison.RankChangeColor = "blue";
            comparison.ScoreChange = currentScore;
            comparison.ScoreChangePercentage = currentScore > 0 ? 100 : 0;
        }
        else
        {
            comparison.RankChange = (prevRank.HasValue && prevRank.Value > 0 && currentRank > 0)
                ? prevRank.Value - currentRank
                : 0;

            (comparison.RankChangeType, comparison.RankChangeDisplay, comparison.RankChangeColor) =
                comparison.RankChange switch
                {
                    > 0 => (RankChangeType.Up, $"↑ {comparison.RankChange}", "green"),
                    < 0 => (RankChangeType.Down, $"↓ {Math.Abs(comparison.RankChange)}", "red"),
                    _ => (RankChangeType.Same, "−", "gray")
                };

            comparison.ScoreChange = currentScore - (prevScore ?? 0);

            comparison.ScoreChangePercentage =
                prevScore.HasValue && prevScore.Value != 0
                    ? (comparison.ScoreChange / prevScore.Value) * 100
                    : (currentScore > 0 ? 100 : 0);
        }

        var prev = prevMetric ?? new RankingCacheModel();

        comparison.PointsChange = (float)(currentMetric.ContributionPoint - prev.ContributionPoint);
        comparison.TicketsCompletedChange = currentMetric.TotalTicketCompleted - prev.TotalTicketCompleted;
        comparison.HoursChange = currentMetric.TotalHours - prev.TotalHours;
        comparison.EfficiencyChange = currentMetric.Efficiency - prev.Efficiency;

        return comparison;
    }
}