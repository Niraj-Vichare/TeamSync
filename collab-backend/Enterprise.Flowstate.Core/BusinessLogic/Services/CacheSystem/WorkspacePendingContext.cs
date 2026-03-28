using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services.CacheSystem
{
    public class WorkspacePendingContext
    {
        private readonly string _workspaceGuid;
        private readonly int _workspaceId;
        private readonly CacheService _cache;

        internal WorkspacePendingContext(string workspaceGuid, int workspaceId, CacheService cache)
        {
            _workspaceGuid = workspaceGuid;
            _workspaceId = workspaceId;
            _cache = cache;
        }

        public Task AddAsync(string userId)
            => _cache.AddPendingUpdateAsync(_workspaceGuid, userId);

        public Task<List<string>> GetAndClearAsync()
            => _cache.GetAndClearPendingUpdatesAsync(_workspaceGuid, _workspaceId);
    }
}
