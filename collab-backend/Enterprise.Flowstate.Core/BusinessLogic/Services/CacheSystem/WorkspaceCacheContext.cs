using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class WorkspaceCacheContext
    {
        private readonly int _workspaceId;
        private readonly CacheService _cache;
        private readonly string _workspaceGuid;

        internal WorkspaceCacheContext(string workspaceGuid, int workspaceId, CacheService cache)
        {
            _workspaceGuid = workspaceGuid;
            _workspaceId = workspaceId;
            _cache = cache;
        }

        /// <summary> Access user-scoped cache: role, metric, permissions </summary>
        public UserCacheContext User(string userId)
            => new(_workspaceGuid, userId, _cache);

        /// <summary> Access workspace-level ranking sorted set </summary>
        public WorkspaceRankingContext Ranking
            => new(_workspaceGuid, _cache);

        /// <summary> Access workspace-level pending DB update queue </summary>
        public WorkspacePendingContext Pending
            => new(_workspaceGuid, _workspaceId, _cache);
    }
}
