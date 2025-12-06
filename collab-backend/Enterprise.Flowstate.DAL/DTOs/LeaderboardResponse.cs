using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class LeaderboardResponse
    {
        public string WorkspaceId { get; set; }
        public string WorkspaceName { get; set; }
        public PeriodInfo CurrentPeriod { get; set; }
        public PeriodInfo PreviousPeriod { get; set; }
        public List<UserRankingWithComparison> Rankings { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
