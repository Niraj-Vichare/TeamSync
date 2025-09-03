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
    }
}
