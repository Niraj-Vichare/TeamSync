using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Constants;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class RoleService:IRoleService
    {
        private readonly IOmniRepository _omniRepository;
        private readonly ICache _cache;
        public RoleService(IOmniRepository omniRepository, ICache cache)
        {
            _omniRepository = omniRepository;
            _cache = cache;
        }


        public async Task<int> GetUserRole(string userId)
        {
            try
            {
                // 1️⃣ Get workspace first
                var workspaceId = await GetUserWorkspaceId(userId);

                if (string.IsNullOrEmpty(workspaceId))
                    return 0;

                // 2️⃣ Try cache
                var cachedRole = await _cache.GetUserRoleAsync(userId, workspaceId);

                if (!string.IsNullOrEmpty(cachedRole) &&
                    Enum.TryParse<AuthEnums.RoleEnum>(cachedRole, out var parsedRole))
                {
                    return (int)parsedRole;
                }

                // 3️⃣ Fetch from DB
                var roleFromDb = await _omniRepository
                    .WorkspaceRepository
                    .GetUserWorkspaceInfo(workspaceId, userId);

                if (roleFromDb == 0)
                    return 0;

                // 4️⃣ Cache it
                await _cache.SetUserRoleAsync(
                    userId,
                    workspaceId,
                    ((AuthEnums.RoleEnum)roleFromDb).ToString()
                );

                return roleFromDb;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<string> GetUserWorkspaceId(string userId)
        {
            var cacheKey = string.Format(
                FlowStateConstants.USER_WORKSPACE,
                userId
            );

            // 1️⃣ Try cache
            var cachedWorkspace = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedWorkspace))
                return cachedWorkspace;

            // 2️⃣ Fetch from DB
            var workspaceId = await _omniRepository
                .ProfileRepository
                .GetCurrentWorkspaceId(userId);

            if (!string.IsNullOrEmpty(workspaceId))
            {
                await _cache.SetStringAsync(
                    cacheKey,
                    workspaceId,
                    TimeSpan.FromMinutes(30)
                );
            }

            return workspaceId;
        }
    }

}
