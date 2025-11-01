using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTO
{
    public class OrganizationMetricDto
    {
        public long Id { get; set; }
        public int WorkspaceId { get; set; }
        public int? ActiveProject { get; set; }
        public int? ActiveTickets { get; set; }
        public int? ActiveSprints { get; set; }
        public int? ActiveTask { get; set; }
        public int? CompletedTask { get; set; }
    }
}
