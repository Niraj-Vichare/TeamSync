using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;
using static Enterprise.Flowstate.DAL.Enums.WorkspaceEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TeamMemberDto
    {
        public DateTime CreateAt { get; set; }
        public int PositionId { get; set; }
        public int StatusId { get; set; }
        public string Status => ((UserStatus)StatusId).ToString();
        public string Position => ((WorkspaceRole)PositionId).ToString();
        public DepartmentDto? DepartmentDto { get; set; }
        public ProfileDto? Profile { get; set; }
    }
}
