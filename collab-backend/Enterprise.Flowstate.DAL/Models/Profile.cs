using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("profile")]
    public class Profile:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("display_name")]
        public string DisplayName { get; set; }
        [Column("guid")]
        public string Guid { get; set; }
        [Column("bio")]
        public string Bio { get;set; }
        [Column("avatar_url")]
        public string? ProfileImageUrl { get; set; }
        [Column("create_date")]
        public DateTime? CreatedAt { get; set; }
        [Column("update_date")]
        public DateTime? UpdatedAt { get; set; }
        [Column("current_workspace")]
        public string WorkspaceId { get; set; }
    }
}
