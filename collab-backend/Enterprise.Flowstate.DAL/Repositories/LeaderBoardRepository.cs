using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Repositories
{
    public class LeaderBoardRepository : ILeaderBoardRepository
    {
        private readonly Supabase.Client _supabaseClient;
        public LeaderBoardRepository(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }
        public async Task<WeeklyUserStats> GetUserRankingAsync(string workspaceGuid, string userGuid, DateTime startPeriod, DateTime endPeriod)
        {
            var workspaceResponse =await _supabaseClient.From<Workspace>().Where(workspace=>workspace.WorkspaceGuid == workspaceGuid).Get();
            var userResponse =await _supabaseClient.From<Profile>().Where(workspace=>workspace.Guid == userGuid).Get();
            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
            {
                return null;
            }
            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var userIdInt = userResponse.Models.FirstOrDefault().Id;
            var rankingResponse = await _supabaseClient.From<WeeklyUserStats>()
                .Where(ranking => ranking.WorkspaceId == organizationId && ranking.UserId == userIdInt && ranking.StartPeriod == startPeriod && ranking.EndPeriod == endPeriod)
                .Get();

            return rankingResponse.Models.Any() ? rankingResponse.Models.FirstOrDefault() :null;
        }

        public async Task<List<WeeklyUserStats>> GetUserRankingHistory(string workspaceGuid, string userGuid)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            var userResponse = await _supabaseClient.From<Profile>().Where(workspace => workspace.Guid == userGuid).Get();
            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
            {
                return null;
            }
            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var userId = userResponse.Models.FirstOrDefault().Id;
            var cutoff = DateTime.UtcNow.AddMonths(-6);
            var rankingResponse = await _supabaseClient.From<WeeklyUserStats>()
                .Where(weeklyUserStats=>weeklyUserStats.WorkspaceId == organizationId && weeklyUserStats.UserId == userId).
                Filter(ranking=>ranking.EndPeriod,Supabase.Postgrest.Constants.Operator.GreaterThanOrEqual,cutoff.ToString()).Get();
            return rankingResponse.Models.ToList();
        }

        public async Task<WeeklyUserStats> GetUserMetricAsync(string workspaceGuid, string userId, DateTime startPeriod, DateTime endPeriod)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            var userResponse = await _supabaseClient.From<Profile>().Where(user => user.Guid == userId).Get();
            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
            {
                return null;
            }
            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var userIdInt = userResponse.Models.FirstOrDefault().Id;
            var metricResponse = await _supabaseClient.From<WeeklyUserStats>()
                .Where(um => um.WorkspaceId == organizationId
                             && um.UserId == userIdInt
                             && um.StartPeriod == startPeriod.Date
                             && um.EndPeriod == endPeriod.Date)
                .Get();
            return metricResponse.Models.Any() ? metricResponse.Models.FirstOrDefault() : null;
        }
        public async Task<Dictionary<string, RankingCacheModel>> GetWorkspaceWeekRankings(string workspaceGuid,DateTime startPeriod,DateTime endPeriod)
        {
            // 1️. Resolve workspace → workspaceId
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(w => w.WorkspaceGuid == workspaceGuid)
                .Get();

            if (!workspaceResponse.Models.Any())
                return new Dictionary<string, RankingCacheModel>();

            var workspaceId = workspaceResponse.Models.First().Id;

            // 2️. Pull weekly user stats (ranking + metrics)
            var statsResponse = await _supabaseClient.From<WeeklyUserStats>().Where(s => s.WorkspaceId == workspaceId)
                .Filter(s => s.StartPeriod, Supabase.Postgrest.Constants.Operator.Equals, startPeriod.Date.ToString("MM-dd-yyyy"))
                .Filter(s => s.EndPeriod, Supabase.Postgrest.Constants.Operator.Equals, endPeriod.Date.ToString("MM-dd-yyyy")).Order("rank", Supabase.Postgrest.Constants.Ordering.Ascending).Get();

            var stats = statsResponse.Models;
            if (!stats.Any())
                return new Dictionary<string, RankingCacheModel>();

            // 3️. Resolve profile.guid
            var userIds = stats
                .Select(s => s.UserId)
                .Distinct()
                .ToList();

            var profileResponse = await _supabaseClient
                .From<Profile>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.In, userIds)
                .Get();

            var result = new Dictionary<string, RankingCacheModel>();

            foreach(var stat in stats)
            {
                var profile = profileResponse.Models.FirstOrDefault(p => p.Id == stat.UserId);
                var rankingCacheModel = new RankingCacheModel
                {
                    Score = stat.Score.HasValue ? stat.Score.Value : 0,
                    Efficiency = stat.Efficiency,
                    ContributionPoint = stat.ContributionPoints,
                    Ranking = stat.RankPosition,
                    TotalHours = stat.TotalHours.HasValue ? stat.TotalHours.Value : 0,
                    TotalTaskCompleted = stat.TasksCompleted.HasValue ? stat.TasksCompleted.Value : 0,
                    UserId = profile.Id,
                    UserName = profile.DisplayName,
                    UserProfilePic = profile.ProfileImageUrl
                };
                result.Add(profile.Guid,rankingCacheModel);
            }

            return result;
        }


    }
}
