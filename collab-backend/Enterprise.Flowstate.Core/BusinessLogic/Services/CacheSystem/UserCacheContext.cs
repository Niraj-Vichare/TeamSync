using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserCacheContext
    {
        private readonly string _workspaceId;
        private readonly string _userId;
        private readonly CacheService _cache;

        internal UserCacheContext(string workspaceId, string userId, CacheService cache)
        {
            _workspaceId = workspaceId;
            _userId = userId;
            _cache = cache;
        }

        /// <summary> Role cache for this user in this workspace </summary>
        public UserRoleCacheContext Role
            => new(_workspaceId, _userId, _cache);

        /// <summary> Metric cache for this user in this workspace </summary>
        public UserMetricCacheContext Metric
            => new(_workspaceId, _userId, _cache);

        /// <summary> Permissions cache for this user in this workspace </summary>
        public UserPermissionsCacheContext Permissions
            => new(_workspaceId, _userId, _cache);
    }
}
