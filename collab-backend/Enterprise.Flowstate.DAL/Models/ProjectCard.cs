using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class ProjectCard
    {
        public SprintStats SprintStats { get; set; }
        public TicketStats TicketStats { get; set; }    
    }
}
