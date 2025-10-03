using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class SprintEnums
    {
        public enum SprintStatus
        {
            NotStarted = 0,
            InProgress = 1,
            Completed = 2,
            Paused = 3
        }
    }
}
