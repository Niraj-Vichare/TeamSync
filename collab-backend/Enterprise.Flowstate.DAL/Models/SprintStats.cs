using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class SprintStats
    {
        public int ActiveSprint { get; set; }
        public int CompletedSprint { get; set; }
        public int TotalSprints { get; set; }
    }
}
