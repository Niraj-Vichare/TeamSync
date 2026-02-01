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
        public string? UserGuid { get; set; }
        public string? WorkspaceGuid { get; set; }
        public string? SprintGuid
        {
            get; set;
        }
        public string EventGuid { get; set; }
        public string? TicketGuid { get; set; }

        public string? TaskGuid { get; set; }
        public string Metadata { get; set; }
        public string ProjectGuid { get; set; }

        public GeneralEnums.EventType EventTypeInString => (GeneralEnums.EventType)EventTypeId;
    }

}
