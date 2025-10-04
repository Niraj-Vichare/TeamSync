using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("workspace_team_mapping")]
    public class TeamMemberWorkspaceMapping:BaseModel
    {
        [PrimaryKey("id")]
        public int  Id { get; set; }
        [Column("created_at")]
        public DateTime CreateAt { get; set; }
        [Column("workspace_id")]
        public int WorkspaceId { get; set; }
        [Column("department_id")]
        public int DepartmentId { get; set; }
        [Column("status_id")]
        public int StatusId { get; set; }
    }
}
