using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Task = System.Threading.Tasks.Task;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    /// <summary>
    /// Rebuilds Redis scores from raw DB data (events_logs + daily_logging).
    /// Called on cold start and on new week rollover.
    /// Uses the same scoring formula as MessageProcessor so values are consistent.
    /// </summary>
    public class ScoreRecalculationService : IScoreRecalculationService
    {
        private readonly ICache _cache;
        private readonly IOmniRepository _omniRepository;
        private readonly ILogger<ScoreRecalculationService> _logger;

        public ScoreRecalculationService(
            ICache cache,
            IOmniRepository omniRepository,
            ILogger<ScoreRecalculationService> logger)
        {
            _cache = cache;
            _omniRepository = omniRepository;
            _logger = logger;
        }

        public async System.Threading.Tasks.Task RecalculateAllWorkspacesAsync(CancellationToken ct = default)
        {
            var workspaces = await _omniRepository.WorkspaceRepository.GetAllWorkspaceInfo();
            if (workspaces == null || !workspaces.Any()) return;

            var (weekStart, weekEnd) = PeriodHelper.GetCurrentWeekPeriod();
            _logger.LogInformation("Recalculating {Count} workspaces for week {WeekStart:yyyy-MM-dd}", workspaces.Count, weekStart);

            foreach (var ws in workspaces)
            {
                if (ct.IsCancellationRequested) break;
                try { await RecalculateWorkspaceAsync(ws.WorkspaceGuid, weekStart, weekEnd, ct); }
                catch (Exception ex) { _logger.LogError(ex, "Recalc failed for workspace {Guid}", ws.WorkspaceGuid); }
            }
        }

        public async Task RecalculateWorkspaceAsync(string workspaceGuid, DateTime weekStart, DateTime weekEnd, CancellationToken ct = default)
        {
            int workspaceId = await _omniRepository.WorkspaceRepository.GetWorkspaceId(workspaceGuid);

            // Returns List<WorkspaceUserMapping> with Profile navigation property loaded
            var members = await _omniRepository.WorkspaceRepository.GetAllActiveWorkspaceUser(workspaceId);
            if (!members.Any()) return;

            int done = 0;
            foreach (var member in members) // member is WorkspaceUserMapping
            {
                if (ct.IsCancellationRequested) break;

                // Guard: Profile navigation property must be loaded
                if (member.Profile == null)
                {
                    _logger.LogWarning("Profile not loaded for UserId {UserId} — skipping", member.UserId);
                    continue;
                }

                try
                {
                    await RecalculateMemberAsync(workspaceGuid, member, weekStart, weekEnd); // ← pass full mapping
                    done++;
                }
                catch (Exception ex) { _logger.LogError(ex, "Recalc failed for user {Guid}", member.Profile.Guid); }
            }

            _logger.LogInformation("Workspace {Guid}: recalculated {Done}/{Total}", workspaceGuid, done, members.Count);
        }

        private async Task RecalculateMemberAsync(string workspaceGuid, WorkspaceUserMapping member, DateTime weekStart, DateTime weekEnd)
        {
            var userGuid = member.Profile.Guid; //Guid for Redis keys and event queries

            // Events use WorkspaceGuid + user Guid (string)
            var events = await _omniRepository.LeaderBoardRepository.GetUserWeeklyEventsAsync(workspaceGuid, userGuid, weekStart, weekEnd);

            // Daily logs also use Guid
            var dailyLogs = await _omniRepository.LeaderBoardRepository.GetUserWeeklyLoggingAsync(workspaceGuid, userGuid, weekStart, weekEnd);

            var existing = await _cache.GetUserMetricAsync(workspaceGuid, userGuid);

            // Pass member.Profile (Profile type) into BuildMetric — not the mapping
            var metric = BuildMetric(events, dailyLogs, member.Profile);

            metric.ReputationPoints = existing?.ReputationPoints ?? 0;
            metric.CumulativeScore = existing?.CumulativeScore ?? 0;

            var (newRank, _) = await _cache.UpdateWorkspaceRankingAtomicAsync(workspaceGuid, userGuid, (double)(metric.Score));
            metric.Ranking = newRank;

            await _cache.UpsertUserMetricAsync(workspaceGuid, userGuid, metric);
            await _cache.AddPendingUpdateAsync(workspaceGuid, userGuid);
        }



        private static RankingCacheModel BuildMetric(List<EventsLog> events, List<DailyLogging> logs, Profile member)
        {
            var m = new RankingCacheModel
            {
                UserId = member.Id,
                UserName = member.DisplayName ?? "Unknown",
                UserProfilePic = member.ProfileImageUrl ?? string.Empty
            };

            foreach (var evt in events)
            {
                if (!evt.EventTypeId.HasValue) continue;
                switch (evt.EventTypeId.Value)
                {
                    case (int)GeneralEnums.EventType.TicketCompleted:
                        m.ContributionPoint += ParseFloat(evt.Metadata, "points");
                        m.TotalTicketCompleted++;
                        break;
                    case (int)GeneralEnums.EventType.SprintCompleted:
                        m.ContributionPoint += ParseFloat(evt.Metadata, "reward");
                        break;
                    case (int)GeneralEnums.EventType.CheckIn:
                        m.ContributionPoint += 0.5f;
                        break;
                }
            }

            double totalHours = 0;
            foreach (var log in logs)
            {
                if (log.CheckIn.HasValue && log.CheckOut.HasValue)
                {
                    var h = (log.CheckOut.Value - log.CheckIn.Value).TotalHours;
                    if (h > 0 && h <= 24) totalHours += h;
                }
            }

            m.TotalHours = (int)Math.Round(totalHours);
            m.ContributionPoint += (float)(totalHours * 0.5);
            m.Efficiency = totalHours > 0 ? (float)Math.Min(m.TotalTicketCompleted / totalHours, 1.0) : 0;
            m.Score = ComputeScore(m);

            return m;
        }

        private static float ComputeScore(RankingCacheModel m) =>
            (float)Math.Round(((m.ContributionPoint) * 0.75) + (m.Efficiency * 0.2) + (m.TotalHours * 0.05), 2);

        private static float ParseFloat(string metadata, string key)
        {
            if (string.IsNullOrEmpty(metadata)) return 0;
            try
            {
                var d = JsonSerializer.Deserialize<Dictionary<string, object>>(metadata);
                if (d != null && d.TryGetValue(key, out var v)) return Convert.ToSingle(v);
            }
            catch { }
            return 0;
        }
    }
}