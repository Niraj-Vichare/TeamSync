using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserMetricCacheContext
    {
        private readonly string _workspaceId;
        private readonly string _userId;
        private readonly string _key;
        private readonly string _previousKey;
        private readonly CacheService _cache;

        internal UserMetricCacheContext(string workspaceId, string userId, CacheService cache)
        {
            _workspaceId = workspaceId;
            _userId = userId;
            _key = string.Format(FlowStateConstants.Cache.UserMetric, workspaceId, userId);
            _previousKey = string.Format(FlowStateConstants.Cache.UserMetricPrevious, workspaceId, userId);
            _cache = cache;
        }

        public System.Threading.Tasks.Task UpsertAsync(RankingCacheModel metric, TimeSpan? expiry = null)
            => _cache.SetAsync(_key, metric, expiry ?? TimeSpan.FromDays(7));

        public Task<RankingCacheModel?> GetAsync()
            => _cache.GetAsync<RankingCacheModel>(_key);

        public System.Threading.Tasks.Task DeleteAsync()
            => _cache.DeleteAsync(_key);

        // Previous week
        public Task<RankingCacheModel?> GetPreviousWeekAsync()
            => _cache.GetAsync<RankingCacheModel>(_previousKey);
    }
}
