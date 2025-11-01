using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTO
{
    public class UserMetricDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? TotalHours { get; set; }
        public int? TasksCompleted { get; set; }
        public int? Points { get; set; }
        public float? ContributionScore { get; set; }
        public int? UserId { get; set; }
        public int? WorkspaceId { get; set; }
        public float Efficiency { get; set; }
        public int? LastWeekPoints { get; set; }
        public float? LastWeekEffiency { get; set; }
        public int? LastWeekTaskCompeleted { get; set; }
        public int? LastWeekPoint { get; set; }
    }
}
