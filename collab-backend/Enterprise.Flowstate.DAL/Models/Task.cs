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
    [Table("task")]
    public class Task:BaseModel
    {
        [PrimaryKey("task_id")]
        public int TaskId { get; set; }
        [Column("task_guid")]
        public Guid TaskGuid { get; set; }
        [Column("title")]
        public string Title { get; set; }
        [Column("description")]
        public string? Description { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("project_id")]
        public int ProjectId { get; set; }
        [Column("assigned_to")]
        public int AssignedTo { get; set; }
        [Column("assigned_by")]
        public int AssignedBy { get; set; }
        [Column("start_date")]
        public DateTime? StartDate { get; set; }
        [Column("end_date")]
        public DateTime? EndDate { get; set; }
        [Column("sprint_id")]
        public int? SprintId { get; set; }
        [Column("ticket_id")]
        public int? TicketId { get; set; }
        [Column("status")]
        public int Status { get; set; }
        [Column("priority")]
        public int Priority { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Sprint? Sprint { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Ticket? Ticket { get; set; }
        [JsonPropertyName("assigned_to_user")]
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? AssignedToUser { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        [JsonPropertyName("assigned_by_user")]
        public Profile? AssignedByUser { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Project? Project { get; set; }
    }
}
