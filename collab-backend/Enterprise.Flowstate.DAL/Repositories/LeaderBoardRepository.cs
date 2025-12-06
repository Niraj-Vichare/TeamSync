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
        public async Task<Ranking> GetUserRankingAsync(string workspaceGuid, string userGuid, DateTime startPeriod, DateTime endPeriod)
        {
            var workspaceResponse =await _supabaseClient.From<Workspace>().Where(workspace=>workspace.WorkspaceGuid == workspaceGuid).Get();
            var userResponse =await _supabaseClient.From<Profile>().Where(workspace=>workspace.Guid == userGuid).Get();
            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
            {
                return null;
            }
            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var userIdInt = userResponse.Models.FirstOrDefault().Id;
            var rankingResponse = await _supabaseClient.From<Ranking>()
                .Where(ranking => ranking.OrganizationId == organizationId && ranking.UserId == userIdInt && ranking.StartPeriod == startPeriod && ranking.EndPeriod == endPeriod)
                .Get();

            return rankingResponse.Models.Any() ? rankingResponse.Models.FirstOrDefault() :null;
        }

        public async Task<List<Ranking>> GetUserRankingHistory(string workspaceGuid, string userGuid)
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
            var rankingResponse = await _supabaseClient.From<Ranking>()
                .Where(ranking => ranking.OrganizationId == organizationId && ranking.UserId == userId).
                Filter(ranking=>ranking.EndPeriod,Supabase.Postgrest.Constants.Operator.GreaterThanOrEqual,cutoff.ToString()).Get();
            return rankingResponse.Models.ToList();
        }


        public async Task<UserMetric> GetUserMetricAsync(string workspaceGuid, string userId, DateTime startPeriod, DateTime endPeriod)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            var userResponse = await _supabaseClient.From<Profile>().Where(user => user.Guid == userId).Get();
            if (userResponse.Models.Count == 0 || workspaceResponse.Models.Count == 0)
            {
                return null;
            }
            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var userIdInt = userResponse.Models.FirstOrDefault().Id;
            var metricResponse = await _supabaseClient.From<UserMetric>()
                .Where(um => um.WorkspaceId == organizationId
                             && um.UserId == userIdInt
                             && um.StartPeriod == startPeriod.Date
                             && um.EndPeriod == endPeriod.Date)
                .Get();
            return metricResponse.Models.Any() ? metricResponse.Models.FirstOrDefault() : null;
        }
        public async Task<List<RankingCacheModel>> GetWorkspaceWeekRankings(string workspaceGuid, DateTime startPeriod, DateTime endPeriod)
        {
            var workspaceResponse = await _supabaseClient.From<Workspace>().Where(workspace => workspace.WorkspaceGuid == workspaceGuid).Get();
            if (!workspaceResponse.Models.Any())
            {
                return null;
            }

            var organizationId = workspaceResponse.Models.FirstOrDefault().Id;
            var rankingResponse = await _supabaseClient.From<Ranking>()
                .Where(ranking => ranking.OrganizationId == organizationId
                && ranking.StartPeriod >= startPeriod
                && ranking.EndPeriod <= endPeriod)
                .Order("rank_position", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();
            var rankingRows = rankingResponse.Models;

            if (!rankingRows.Any())
                return new List<RankingCacheModel>();

            // 3️⃣ Extract all userIds from ranking (for join)
            var userIds = rankingRows.Select(r => r.UserId).ToList();

            // 4️⃣ Fetch user_metric rows for the same users + period
            var metricResponse = await _supabaseClient
                .From<UserMetric>()
                .Filter("user_id", Supabase.Postgrest.Constants.Operator.In, userIds)
                .Where(um => um.WorkspaceId == organizationId
                             && um.StartPeriod == startPeriod.Date
                             && um.EndPeriod == endPeriod.Date)
                .Get();

            var metricMap = metricResponse.Models.ToDictionary(x => x.UserId, x => x);

            // 5️⃣ Build your RankingCacheModel list
            var result = new List<RankingCacheModel>();

            foreach (var ranking in rankingRows)
            {
                if (!metricMap.ContainsKey(ranking.UserId))
                    continue;

                var m = metricMap[ranking.UserId];

                result.Add(new RankingCacheModel
                {
                    Point = m.Points ?? 0,
                    TotalTaskCompleted = m.TasksCompleted ?? 0,
                    TotalHours = m.TotalHours ?? 0,
                    Efficiency = m.Efficiency,
                    ContributionScore = m.ContributionScore ?? 0,
                    Ranking = ranking.RankPosition
                });
            }

            return result;
        }
    }
}
