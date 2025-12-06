
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("ranking")]
    public class Ranking : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("score")]
        // This is calulated like total_score = (efficiency * 0.4) (points* 0.3) (contribution_score* 0.2) + (total_hours* 0.1)
        public float Score { get; set; }

        [Column("rank_position")]
        public int RankPosition { get; set; }

        [Column("last_calculated")]
        public DateTime? CalculatedLastAt { get; set; }

        [Column("organization_id")]
        public int OrganizationId { get; set; }

        [Column("start_period")]
        public DateTime StartPeriod { get; set; }
        [Column("end_period")]
        public DateTime EndPeriod { get; set; }

        [Reference(typeof(Profile))]
        public Profile? User { get; set; }

        [Reference(typeof(Workspace))]
        public Workspace? Organization { get; set; }
    }
}



/*
 * WITH scored AS (
  SELECT
    um.user_id,
    um.workspace_id AS organization_id,
    (um.efficiency * 0.4 +
     um.points * 0.3 +
     um.contribution_score * 0.2 +
     um.total_hours * 0.1) AS total_score
  FROM user_metric um
)
INSERT INTO ranking (user_id, organization_id, total_score, rank_position, calculated_at)
SELECT
  user_id,
  organization_id,
  total_score,
  RANK() OVER (PARTITION BY organization_id ORDER BY total_score DESC) AS rank_position,
  NOW()
FROM scored
ON CONFLICT (user_id, organization_id)
DO UPDATE
SET total_score = EXCLUDED.total_score,
    rank_position = EXCLUDED.rank_position,
    calculated_at = NOW();

*/