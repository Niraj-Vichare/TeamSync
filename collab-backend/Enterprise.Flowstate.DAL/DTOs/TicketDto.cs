using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.TicketEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TicketDto
    {
        public int TicketId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Tags { get; set; }
        public TicketPriority? Priority { get; set; }
        public string? PriorityInString => ((TicketPriority)Priority).ToString();
        public int? ReportedBy { get; set; }
        public string? AssignedName { get; set; }
        public TicketStatus Status { get; set; }
        public string? StatusInString => ((TicketStatus)Status).ToString();
        public string? ProjectName { get; set; }
        public int? ProjectId { get; set; }
        public int? SprintId { get; set; }
        public string? SprintName { get; set; }
        public string? Steps { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? Points { get; set; }
        public TicketType? TypeId { get; set; }
        public string? TypeName => ((TicketType)TypeId).ToString();
        public Guid? TicketGuid { get; set; }

    }
}
