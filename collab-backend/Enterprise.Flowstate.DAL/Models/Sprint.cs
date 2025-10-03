using Supabase.Gotrue;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("sprint")]
    public class Sprint : BaseModel
    {
        [PrimaryKey("sprint_id")]
        public int SprintId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("tagline")]
        public string? Tagline { get; set; }

        [Column("tags")]
        public string? Tags { get; set; }

        [Column("status")]
        public int? StatusId { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }
        [Column("update_date")]
        public DateTime? UpdateDate { get; set; }   

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("project_id")]
        public int? ProjectId { get; set; }

        [Column("working_team_id")]
        public long WorkingTeamId { get; set; }

        [Reference(typeof(Project))]
        public Project? Project { get; set; }
        [Reference(typeof(Team))]
        public Team? Team { get; set; }

    }
}
