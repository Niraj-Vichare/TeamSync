using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class TaskEnums
    {
        public enum TaskStatus
        {
            Complete = 1,
            InProgress = 2,
            NoStarted = 3
        }

        public enum TaskPriority
        {
            High = 1,
            Medium = 2,
            Low = 3
        }
    }
}
