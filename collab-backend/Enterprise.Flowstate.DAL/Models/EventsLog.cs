using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;


namespace Enterprise.Flowstate.DAL.Models
{
    [Table("events_log")]
    public class EventsLog : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("event_type")]
        public int? EventTypeId { get; set; }
        [Column("event_description")]
        public string? EventDescription { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }
        [Column("workspace_id")]
        public string? WorkspaceId { get; set; }
        [Column("sprint_id")]
        public int? SprintId
        {
            get; set;
        }
        [Column("ticket_id")]
        public int? TicketId { get; set; }

        [Column("task_id")]
        public int? TaskId { get; set; }
        [Column("metadata")]
        public string Metadata { get; set; }
        [Column("event_guid")]
        public string EventGuid { get; set; }

    }

}
