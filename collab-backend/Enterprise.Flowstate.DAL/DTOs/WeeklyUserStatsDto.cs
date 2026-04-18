using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTO
{
    public class WeeklyUserStatsDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? TotalHours { get; set; }
        public int? TicketsCompleted { get; set; }
        public float Score { get; set; }
        public float ContributionPoint { get; set; }
        public int? UserId { get; set; }
        public int? WorkspaceId { get; set; }
        public float Efficiency { get; set; }
        public int RankPosition { get; set; }
        public DateOnly? StartPeriod { get; set; }
        public DateOnly? EndPeriod { get; set; }
        public float ReputationPoints { get; set; }
        public float CumulativeScore { get; set; }
    }
}
