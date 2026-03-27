using Enterprise.Flowstate.DAL.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class UserPermissionsCacheContext
    {
        private readonly string _permKey;
        private readonly CacheService _cache;

        internal UserPermissionsCacheContext(string workspaceId, string userId, CacheService cache)
        {
            _permKey = string.Format(FlowStateConstants.Cache.UserPermissions, workspaceId, userId);
            _cache = cache;
        }

        public async Task SetAsync(List<string> permissions, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(permissions);
            await _cache.SetStringAsync(_permKey, json, expiry ?? TimeSpan.FromMinutes(30));
        }

        public async Task<List<string>> GetAsync()
        {
            var value = await _cache.GetStringAsync(_permKey);
            if (string.IsNullOrEmpty(value)) return [];
            return JsonSerializer.Deserialize<List<string>>(value) ?? [];
        }

        public Task DeleteAsync()
            => _cache.DeleteAsync(_permKey);
    }
}
