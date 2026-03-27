using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class WorkspaceRankingContext
    {
        private readonly string _workspaceId;
        private readonly string _key;
        private readonly string _previousKey;
        private readonly CacheService _cache;

        internal WorkspaceRankingContext(string workspaceId, CacheService cache)
        {
            _workspaceId = workspaceId;
            _key = string.Format(FlowStateConstants.Cache.WorkspaceRanking, workspaceId);
            _previousKey = string.Format(FlowStateConstants.Cache.WorkspaceRankingPrevious, workspaceId);
            _cache = cache;
        }

        public Task<(long rank, double score)> UpdateAsync(string userId, double score)
            => _cache.UpdateWorkspaceRankingAtomicAsync(_workspaceId, userId, score);

        public Task<int?> GetUserRankAsync(string userId)
            => _cache.GetUserRankAsync(_workspaceId, userId);

        public Task<double> GetUserScoreAsync(string userId)
            => _cache.GetUserScore(_workspaceId, userId);

        public Task<Dictionary<string, RankingCacheModel>> GetPageAsync(int page, int pageSize)
            => _cache.GetWorkspaceRankingsAsync(_workspaceId, page, pageSize);

        public Task<bool> ClearAsync()
            => _cache.ClearWorkspaceRankingsAsync(_workspaceId);

        // Previous week
        public Task<int?> GetPreviousWeekUserRankAsync(string userId)
            => _cache.GetPreviousWeekRankAsync(_workspaceId, userId);

        public Task<double?> GetPreviousWeekUserScoreAsync(string userId)
            => _cache.GetPreviousWeekScoreAsync(_workspaceId, userId);


        public System.Threading.Tasks.Task SnapshotToPreviousWeekAsync(TimeSpan? expiry = null)
        {
            var sourceKey = string.Format(FlowStateConstants.Cache.WorkspaceRanking, _workspaceId);
            var destKey = string.Format(FlowStateConstants.Cache.WorkspaceRankingPrevious, _workspaceId);
            return _cache.CopySortedSetAsync(sourceKey, destKey, expiry ?? TimeSpan.FromDays(8));
        }


    }
}
