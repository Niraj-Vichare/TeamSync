using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TicketCloseRequestDto
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }

        public Guid? TicketGuid { get; set; }

        public int? RequestedBy { get; set; }
        public string RequestedByName { get; set; } 

        public int? WorkspaceId { get; set; }

        public string? Reason { get; set; }

        public int? Status { get; set; }

        public int? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }
        public string ReviewerName { get; set; }
        public string? ReviewedNote { get; set; }
    }
}
