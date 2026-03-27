using Enterprise.Flowstate.DAL.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserRoleCacheContext
    {
        private readonly string _key;
        private readonly CacheService _cache;

        internal UserRoleCacheContext(string workspaceId, string userId, CacheService cache)
        {
            _key = string.Format(FlowStateConstants.Cache.UserRole, workspaceId, userId);
            _cache = cache;
        }

        public Task SetAsync(string role, TimeSpan? expiry = null)
            => _cache.SetStringAsync(_key, role, expiry ?? TimeSpan.FromMinutes(30));

        public Task<string?> GetAsync()
            => _cache.GetStringAsync(_key);

        public Task DeleteAsync()
            => _cache.DeleteAsync(_key);
    }
}
