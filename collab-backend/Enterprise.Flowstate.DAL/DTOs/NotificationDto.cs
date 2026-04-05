using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class NotificationDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? RecipientProfileId { get; set; }
        public int? ActorProfileId { get; set; }
        public NotificationType NotificationType { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public int? EntityType { get; set; }
        public Guid? EntityGuid { get; set; }
        public string? Metadata { get; set; }
        public bool? IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public string? RecipientProfileGuid { get; set; }
        public string? ActorProfileGuid { get; set; }
        public string RecipientProfileName { get; set; } = string.Empty;
        public string? ActorProfileName { get; set; }
    }
}
