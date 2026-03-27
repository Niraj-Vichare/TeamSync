using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("workspace_subscription")]
    public class WorkspaceSubscription : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("workspace_id")]
        public int WorkspaceId { get; set; }

        [Column("plan_type")]
        public int PlanType { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("max_projects")]
        public int? MaxProjects { get; set; }

        [Column("max_team_members")]
        public int? MaxTeamMembers { get; set; }

        [Column("max_sprints")]
        public int? MaxSprints { get; set; }

        [Column("features")]
        public string Features { get; set; } // JSON array of feature IDs

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
