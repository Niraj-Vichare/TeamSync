using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;


namespace Enterprise.Flowstate.DAL.Models
{
    [Table("activity_log")]
    public class ActivityLog : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("action_type")]
        public int? ActionTypeId { get; set; }

        [Column("entity_type")]
        public int? EntityTypeId { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("description")]
        public string? Description { get; set; }
    }

}
