using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.WorkspaceEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class DepartmentWithMembersDto
    {
        public int DepartmentId { get; set; }
        public DateTime CreateAt { get; set; }
        public string DepartmentName { get; set; }
        public string Tagline { get; set; }
        public int PositionId { get; set; }
        public string Position => ((WorkspaceRole)PositionId).ToString();
        public string DepartmentColor { get; set; }
        public List<TeamMemberDto> Members { get; set; } = new List<TeamMemberDto>();
    }

}
