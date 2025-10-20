using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IRoleService
    {
        Task<List<string>> GetRolesByUserIdAsync(Guid userId, Guid? companyId = null);
        Task<List<string>> GetPermissionsByUserIdAsync(Guid userId, Guid? companyId = null);
        Task AssignRoleAsync(Guid userId, Guid roleId, Guid companyId, Guid assignedBy);
        Task RevokeRoleAsync(Guid userId, Guid roleId, Guid companyId, Guid revokedBy);
        //Task<List<PermissionDto>> GetAllPermissionsAsync();
    }
}
