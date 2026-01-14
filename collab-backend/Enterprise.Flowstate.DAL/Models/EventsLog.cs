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

        [Column("user_guid")]
        public string? UserGuid { get; set; }
        [Column("workspace_guid")]
        public string? WorkspaceGuid { get; set; }
        [Column("sprint_guid")]
        public string? SprintGuid
        {
            get; set;
        }
        [Column("project_guid")]
        public string? ProjectGuid { get; set; }    
        [Column("ticket_guid")]
        public string? TicketGuid { get; set; }

        [Column("task_guid")]
        public string? TaskGuid { get; set; }
        [Column("metadata")]
        public string Metadata { get; set; }
        [Column("event_guid")]
        public string EventGuid { get; set; }

    }

}
