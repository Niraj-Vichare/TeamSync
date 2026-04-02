using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Text.Json.Serialization;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("notifications")]
    public class Notification : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("recipient_profile_id")]
        public int? RecipientProfileId { get; set; }

        [Column("actor_profile_id")]
        public int? ActorProfileId { get; set; }

        [Column("notification_type")]
        public int? NotificationType { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("body")]
        public string? Body { get; set; }

        [Column("entity_type")]
        public int? EntityType { get; set; }

        [Column("entity_guid")]
        public Guid EntityGuid { get; set; }

        [Column("metadata")]
        public string? Metadata { get; set; }

        [Column("is_read")]
        public bool? IsRead { get; set; }

        [Column("read_at")]
        public DateTime? ReadAt { get; set; }

        // Navigation properties (optional, like your Ticket model)

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? RecipientProfile { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? ActorProfile { get; set; }
    }
}