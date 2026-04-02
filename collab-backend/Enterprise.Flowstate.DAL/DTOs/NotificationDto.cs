using Enterprise.Flowstate.DAL.Models;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class Notification : BaseModel
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? RecipientProfileId { get; set; }
        public int? ActorProfileId { get; set; }
        public int? NotificationType { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public int? EntityType { get; set; }
        public Guid EntityGuid { get; set; }
        public string? Metadata { get; set; }
        public bool? IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public string RecipientProfileName { get; set; }
        public string? ActorProfileName { get; set; }
    }
}
