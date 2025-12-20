using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class RankingComparison
    {
        // Rank Changes
        public int RankChange { get; set; } // Positive = improved (moved up), Negative = dropped
        public RankChangeType RankChangeType { get; set; } // Up, Down, Same, New

        // Score Changes
        public double ScoreChange { get; set; }
        public double ScoreChangePercentage { get; set; }

        // Metric Changes
        public int PointsChange { get; set; }
        public int TasksCompletedChange { get; set; }
        public int HoursChange { get; set; }
        public double EfficiencyChange { get; set; }

        // UI Helpers
        public string RankChangeDisplay { get; set; } // "↑ 5", "↓ 2", "−", "NEW"
        public string RankChangeColor { get; set; } // "green", "red", "gray", "blue"
    }
}
