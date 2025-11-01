using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("user_metric")]
    public class UserMetric : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("total_hours")]
        public int? TotalHours { get; set; }

        [Column("tasks_completed")]
        public int? TasksCompleted { get; set; }

        [Column("points")]
        public int? Points { get; set; }

        [Column("contribution_score")]
        public float? ContributionScore { get; set; }
        [Column("start_period")]
        public DateTime? StartPeriod { get; set; }
        [Column("end_period")]
        public DateTime? EndPeriod { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("workspace_id")]
        public int? WorkspaceId { get; set; }

        [Column("efficiency")]
        public float Efficiency { get; set; }

        [Reference(typeof(Profile))]
        public Profile? User { get; set; }

        [Reference(typeof(Workspace))]
        public Workspace? Workspace { get; set; }
    }
}