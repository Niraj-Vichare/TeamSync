using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class UserWorkMetric
    {
        public string ProjectName { get; set; }
        public int ProjectId { get; set; }
        public int NumberOfTasks { get; set; }
        public int NumberOfSprintIncluded { get; set; }
        public int NumberOfTicketsAssigned { get; set; }
    }
}
