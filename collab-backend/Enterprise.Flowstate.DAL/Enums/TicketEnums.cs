using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class TicketEnums
    {
        public enum TicketStatus
        {
            Open = 1,
            InProgress = 2,
            Closed = 3,
        }

        public enum TicketPriority
        {
            High = 1,
            Medium = 2,
            Low = 3
        }

        public enum TicketType
        {
            Bug = 1,
            UserStories = 2
        }
    }
}
