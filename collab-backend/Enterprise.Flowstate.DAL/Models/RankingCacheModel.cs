using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class RankingCacheModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string? UserProfilePic { get; set; }
        public float Score { get; set; } = 0.0f;
        public int TotalTicketCompleted { get;set; }
        public int TotalHours { get; set; }
        public float Efficiency { get; set; }
        public float ContributionPoint { get; set; } = 0.0f;
        public long Ranking { get; set; }
        public float ReputationPoints { get; set; }
        public float CumulativeScore { get; set; }

    }
}
