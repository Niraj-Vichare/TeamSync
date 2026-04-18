using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TeamDto
    {
        public int TeamId { get; set; }
        public List<TeamMemberDto> Members { get; set; }
        public string Name { get; set; }
        public string? TeamGuid { get; set; }
        public List<int> MemberIds { get; set; } = new();
        public string? WorkspaceGuid { get; set; }
        public string Tagline { get; set; }
    }
}
