using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class AuthEnums
    {
        public enum AuthMethod
        {
            Email = 1,
            Google =2,
            Github = 3,
        }

        public enum UserStatus
        {
            Active =1,
            InActive=2,
            Pending = 3
        }

        public enum RoleEnum
        {
            Owner = 1,
            Admin = 2,
            Manager = 3,
            Member = 4,
            Viewer = 5
        }
        public enum ResourceType
        {
            Project,
            TeamMember,
            Sprint
        }

        public enum RankChangeType
        {
            Up,      // Improved (rank decreased in number, e.g., 10 → 5)
            Down,    // Dropped (rank increased in number, e.g., 5 → 10)
            Same,    // No change
            New      // New entry this week
        }
    }
}
