using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class SprintBreakdownModel
    {
        public int TotalTickets { get; set; }
        public int PendingTickets { get; set; }
        public int CompletedTickets { get; set; }
        public float Effiency { get; set; }
        public float SprintVelocity { get; set; }
        public int NotStarted { get; set; }
    }
}
