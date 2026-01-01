using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;


namespace Enterprise.Flowstate.DAL.Models
{
    [Table("events_logs")]
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
        public string? UserGuid { get; set; }
        [Column("workspace_id")]
        public string? WorkspaceGuid { get; set; }
        [Column("sprint_id")]
        public string? SprintGuid
        {
            get; set;
        }
        public string? ProjectGuid { get; set; }    
        [Column("ticket_id")]
        public string? TicketGuid { get; set; }

        [Column("task_id")]
        public string? TaskGuid { get; set; }
        [Column("metadata")]
        public string Metadata { get; set; }
        [Column("event_guid")]
        public string EventGuid { get; set; }

    }

}
