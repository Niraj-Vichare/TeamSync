using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class TeamSummaryDto
    {
        public long TeamId { get; set; }
        public string TeamName { get; set; }
        public string TeamDescription { get; set; }  // maps to Tagline
        public string TeamGuid { get; set; }
        public List<TeamMemberSummaryDto> Members { get; set; } = new();
    }

    public class TeamMemberSummaryDto
    {
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string AvatarUrl { get; set; }
        public string Guid { get; set; }
    }
}
