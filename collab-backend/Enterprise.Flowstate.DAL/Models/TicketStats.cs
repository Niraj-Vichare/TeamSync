using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class TicketStats
    {
        public int CloseTickets { get; set; }
        public int ActiveTickets { get; set; }
        public int TotalStoryPoints { get; set; }   
        public int CompletedStoryPoints { get; set; }
        public int TotalTickets { get; set; }
        public int TotalUserStories { get; set; }
        public int TotalBugs { get; set; }
    }
}
