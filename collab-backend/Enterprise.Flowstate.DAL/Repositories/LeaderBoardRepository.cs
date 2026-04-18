using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.DAL.Interfaces;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;

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
                .Filter("workspace_id", Operator.Equals, organizationId.ToString())
        .Filter("user_id", Operator.Equals, userIdInt.ToString())
        .Filter("start_period", Operator.Equals, startPeriod.ToString("yyyy-MM-dd"))
        .Filter("end_period", Operator.Equals, endPeriod.ToString("yyyy-MM-dd"))
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
                .Filter(user=>user.UserId,Supabase.Postgrest.Constants.Operator.Equals, userIdInt.ToString())
                .Filter(user=>user.WorkspaceId,Supabase.Postgrest.Constants.Operator.Equals,organizationId.ToString())
                .Filter(user=>user.StartPeriod,Supabase.Postgrest.Constants.Operator.Equals,startPeriod.Date.ToString("yyyy-MM-dd"))
                .Filter(user=>user.EndPeriod,Supabase.Postgrest.Constants.Operator.Equals,endPeriod.Date.ToString("yyyy-MM-dd"))
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
                .Filter(s => s.StartPeriod, Supabase.Postgrest.Constants.Operator.Equals, startPeriod.Date.ToString("yyyy-MM-dd"))
                .Filter(s => s.EndPeriod, Supabase.Postgrest.Constants.Operator.Equals, endPeriod.Date.ToString("yyyy-MM-dd")).Order("rank", Supabase.Postgrest.Constants.Ordering.Ascending).Get();

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
                    Score = stat.Score,
                    Efficiency = stat.Efficiency,
                    ContributionPoint = stat.ContributionPoints,
                    Ranking = stat.RankPosition,
                    TotalHours = stat.TotalHours.HasValue ? stat.TotalHours.Value : 0,
                    TotalTicketCompleted = stat.TicketCompleted.HasValue ? stat.TicketCompleted.Value : 0,
                    UserId = profile.Id,
                    UserName = profile.DisplayName,
                    UserProfilePic = profile.ProfileImageUrl
                };
                result.Add(profile.Guid,rankingCacheModel);
            }

            return result;
        }

        public async Task<bool> IsWeeklyUserStatsPresent(DateTime startDate, DateTime endDate)
        {
            try
            {
                var result= await _supabaseClient.From<WeeklyUserStats>().Filter(stat=>stat.StartPeriod,Supabase.Postgrest.Constants.Operator.Equals,startDate.ToString("yyyy-MM-dd"))
                    .Filter(stat => stat.EndPeriod, Supabase.Postgrest.Constants.Operator.Equals, endDate.ToString("yyyy-MM-dd")).Get();

                return result.Models.Any();
            }catch(Exception ex)
            {
                return false;
            }
            
        }

        public async System.Threading.Tasks.Task CopyPreviousStats(int workspaceId,DateTime startPeriod,DateTime endPeriod)
        {
            var (previousStart,previousEnd) = PeriodHelper.GetPreviousWeekPeriod();

            var weeklyStatsResponse = await _supabaseClient.From<WeeklyUserStats>()
                .Where(stat => stat.WorkspaceId == workspaceId)

                .Get();

            var previousRecords = weeklyStatsResponse.Models;
        }

        public async Task<List<EventsLog>> GetUserWeeklyEventsAsync(string workspaceGuid,string userGuid,DateTime weekStart,DateTime weekEnd)
        {
            var response = await _supabaseClient
                .From<EventsLog>()
                .Where(x => x.WorkspaceGuid == workspaceGuid && x.UserGuid == userGuid)
                .Filter(x => x.CreatedAt.ToString("yyyy-MM-dd"), Operator.GreaterThanOrEqual, weekStart.ToString("yyyy-MM-dd"))
                .Filter(x => x.CreatedAt.ToString("yyyy-MM-dd"), Operator.LessThanOrEqual, weekEnd.ToString("yyyy-MM-dd"))
                .Get();

            return response.Models;
        }


        public async Task<List<DailyLogging>> GetUserWeeklyLoggingAsync(string workspaceGuid,string userGuid,DateTime weekStart,DateTime weekEnd)
        {
            var workspaceResponse = await _supabaseClient
                .From<Workspace>()
                .Where(x => x.WorkspaceGuid == workspaceGuid)
                .Get();

            var userResponse = await _supabaseClient
                .From<Profile>()
                .Where(x => x.Guid == userGuid)
                .Get();

            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
                return new List<DailyLogging>(); // avoid nulls in APIs

            int workspaceId = workspaceResponse.Models.First().Id;
            int userId = userResponse.Models.First().Id;

            var response = await _supabaseClient
                .From<DailyLogging>()
                .Where(x => x.WorkspaceId == workspaceId && x.UserId == userId)
                .Filter(x => x.CheckingDate.ToString("yyyy-MM-dd"), Operator.GreaterThanOrEqual, weekStart.ToString("yyyy-MM-dd"))
                .Filter(x => x.CheckingDate.ToString("yyyy-MM-dd"), Operator.LessThanOrEqual, weekEnd.ToString("yyyy-MM-dd"))
                .Order(x => x.CheckingDate, Ordering.Ascending)
                .Get();

            return response.Models;
        }
    }
}
