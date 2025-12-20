using Enterprise.Flowstate.DAL.DTO;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class UserRankingWithComparison
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }

        // Current Week Data
        public int CurrentRank { get; set; }
        public double CurrentScore { get; set; }
        public WeeklyUserStatsDto CurrentMetrics { get; set; }

        // Previous Week Data
        public int? PreviousRank { get; set; }
        public double? PreviousScore { get; set; }
        public WeeklyUserStatsDto PreviousMetrics { get; set; }

        // Comparison (The magic for up/down arrows!)
        public RankingComparison Comparison { get; set; }
    }
}
