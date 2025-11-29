using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class RankingCacheModel
    {
        public int? Point { get; set; }
        public int? TotalTaskCompleted { get;set; }
        public int? TotalHours { get; set; }
        public float? Efficiency { get; set; }
        public float? ContributionScore { get; set; }
        public long? Ranking { get; set; }

    }
}
