using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    /// <summary> User cache not scoped to a workspace (profile info, current workspace pointer) </summary>
    public class GlobalUserCacheContext
    {
        private readonly string _userId;
        private readonly string _infoKey;
        private readonly string _workspaceKey;
        private readonly CacheService _cache;

        internal GlobalUserCacheContext(string userId, CacheService cache)
        {
            _userId = userId;
            _infoKey = string.Format(FlowStateConstants.Cache.UserInfo, userId);
            _workspaceKey = string.Format(FlowStateConstants.Cache.UserWorkspace, userId);
            _cache = cache;
        }

        public Task UpsertProfileAsync(UserDto user)
            => _cache.UpsertUserProfile(user);

        public Task<string> GetInfoAsync()
    => _cache.GetUserInfo(_userId); 


        public Task<string?> GetWorkspaceAsync()
            => _cache.GetStringAsync(_workspaceKey);

        public Task SetWorkspaceAsync(string workspaceGuid, TimeSpan? expiry = null)
        {
            var key = string.Format(FlowStateConstants.Cache.UserWorkspace, _userId);
            return _cache.SetStringAsync(key, workspaceGuid, expiry ?? TimeSpan.FromHours(100));
        }
    }
}
