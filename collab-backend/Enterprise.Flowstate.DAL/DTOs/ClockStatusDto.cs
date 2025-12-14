using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class ClockStatusDto
    {
        public bool IsClockedIn { get; set; }
        public int ElapsedSeconds { get; set; }
        public bool IsValidDay { get; set; }
        public DateTimeOffset? CheckInTime { get; set; }
        public DateTimeOffset? CheckOutTime { get; set; }
        public int AutoCheckoutCount { get; set; }
        public int RemainingWarnings { get; set; }
    }
}
