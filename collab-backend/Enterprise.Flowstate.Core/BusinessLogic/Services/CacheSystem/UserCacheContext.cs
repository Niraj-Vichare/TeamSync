using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserCacheContext
    {
        private readonly string _workspaceGuid;
        private readonly string _userGuid;
        private readonly CacheService _cache;


        internal UserCacheContext(string workspaceGuid, string userGuid, CacheService cache)
        {
            _workspaceGuid = workspaceGuid;
            _userGuid = userGuid;
            _cache = cache;
        }

        /// <summary> Role cache for this user in this workspace </summary>
        public UserRoleCacheContext Role
            => new(_workspaceGuid, _userGuid, _cache);

        /// <summary> Metric cache for this user in this workspace </summary>
        public UserMetricCacheContext Metric
            => new(_workspaceGuid, _userGuid, _cache);
        // / <summary> UserId cache for this user in this workspace </summary>
        public UserIdCacheContext UserId
            => new(_workspaceGuid, _userGuid, _cache);

        /// <summary> Permissions cache for this user in this workspace </summary>
        public UserPermissionsCacheContext Permissions
            => new(_workspaceGuid, _userGuid, _cache);
    }
}
