using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IRoleService
    {
        Task<int> GetUserRole(string userId);
        //Task<List<PermissionDto>> GetAllPermissionsAsync();
        Task<string> GetUserWorkspaceId(string userId);
    }
}
