using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class UserContributionMetric
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public double ContributionPercent { get; set; }
        public int TasksDoneByUser { get; set; }
        public int TotalTasksDone { get; set; }
        public int SprintsParticipated { get; set; }
    }

}
