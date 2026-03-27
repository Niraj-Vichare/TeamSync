using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class WorkspaceCacheContext
    {
        private readonly string _workspaceId;
        private readonly CacheService _cache;

        internal WorkspaceCacheContext(string workspaceId, CacheService cache)
        {
            _workspaceId = workspaceId;
            _cache = cache;
        }

        /// <summary> Access user-scoped cache: role, metric, permissions </summary>
        public UserCacheContext User(string userId)
            => new(_workspaceId, userId, _cache);

        /// <summary> Access workspace-level ranking sorted set </summary>
        public WorkspaceRankingContext Ranking
            => new(_workspaceId, _cache);

        /// <summary> Access workspace-level pending DB update queue </summary>
        public WorkspacePendingContext Pending
            => new(_workspaceId, _cache);
    }
}
