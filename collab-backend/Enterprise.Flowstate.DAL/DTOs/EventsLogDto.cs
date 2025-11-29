using Enterprise.Flowstate.DAL.Enums;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;


namespace Enterprise.Flowstate.DAL.DTOs
{
    public class EventsLogDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int EventTypeId { get; set; }
        public string? EventDescription { get; set; }
        public string? UserId { get; set; }
        public string? WorkspaceId { get; set; }
        public int? SprintId
        {
            get; set;
        }
        public string EventGuid { get; set; }
        public int? TicketId { get; set; }

        public int? TaskId { get; set; }
        public string Metadata { get; set; }

        public GeneralEnums.EventType EventTypeInString => (GeneralEnums.EventType)EventTypeId;
    }

}
