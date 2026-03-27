using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IAuthorizationService
    {
        Task<bool> HasPermission(string userId, string workspaceId, int requiredRole);
        Task<bool> HasFeature(string workspaceId, PlanEnums.PlanFeature feature);
        Task<bool> CanCreateProject(string workspaceId);
        Task<bool> CanAddMember(string workspaceId);
        Task<bool> CanCreateSprint(string workspaceId);
        Task<int> GetCurrentProjectCount(string workspaceId);
        Task<int> GetCurrentMemberCount(string workspaceId);
    }
}
