using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserIdCacheContext
    {
        private readonly string _workspaceGuid;
        private readonly string _userGuid;
        private readonly ICache _cache;
        private readonly string _key;
        public UserIdCacheContext(string workspaceGuid,string userGuid,ICache cache)
        {
            _workspaceGuid = workspaceGuid;
            _userGuid = userGuid;
            _cache = cache;
            _key = string.Format(FlowStateConstants.Cache.UserId, workspaceGuid, userGuid);
        }

        public System.Threading.Tasks.Task SetAsync(string userId, TimeSpan? expiry = null)
            => _cache.SetStringAsync(_key, userId, expiry ?? TimeSpan.FromMinutes(30));

        public Task<string?> GetAsync()
            => _cache.GetStringAsync(_key);

        public System.Threading.Tasks.Task DeleteAsync()
            => _cache.DeleteAsync(_key);



    }
}
