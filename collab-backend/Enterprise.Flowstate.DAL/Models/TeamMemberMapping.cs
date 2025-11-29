using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("team_member_mapping")]
    public class TeamMemberMapping:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("team_id")]
        public long TeamId { get; set; }
        [Column("member_id")]
        public int MemberId { get; set; }

        public Members Member { get; set; }
        public Team Team { get; set; }
    }
}
