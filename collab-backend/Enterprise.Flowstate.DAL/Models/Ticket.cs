using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("ticket")]
    public class Ticket : BaseModel
    {
        [PrimaryKey("ticket_id")]
        public int TicketId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("priority")]
        public int? PriorityId { get; set; }

        [Column("reported_by")]
        public int? ReportedBy { get; set; }

        [Column("assigned_to")]
        public int? AssignedTo { get; set; }
        [Column("status")]
        public int? StatusId { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("sprint_id")]
        public int? SprintId { get; set; }

        [Column("steps")]
        public string? Steps { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("points")]
        public int? Points { get; set; }

        [Column("type")]
        public int? TypeId { get; set; }

        [Column("ticket_guid")]
        public Guid TicketGuid { get; set; }
        [Column("start_date")]
        public DateTime? StartDate { get; set; }
        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Sprint? Sprint { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? AssignedToUser { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]

        public Profile? AssignedByUser { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Project? Project { get; set; }

    }
}
