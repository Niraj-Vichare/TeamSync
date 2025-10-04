using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("team")]
    public class Team:BaseModel
    {
        [Column("team_id")]
        public long TeamId { get; set; }
        [Column("team_name")]
        public string TeamName { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("workspace_id")]
        public int WorkspaceId { get; set; }
        [Column("team_uuid")]
        public Guid TeamGuid { get; set; }
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }    
        [Column("tagline")]
        public string Tagline { get; set; }
    }
}
