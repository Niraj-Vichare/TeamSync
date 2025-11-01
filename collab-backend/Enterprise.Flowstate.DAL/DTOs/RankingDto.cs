using Enterprise.Flowstate.DAL.Models;
using Supabase.Postgrest.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class RankingDto
    {
        public long Id { get; set; }
        public int? UserId { get; set; }
        // This is calulated like total_score = (efficiency * 0.4) (points* 0.3) (contribution_score* 0.2) + (total_hours* 0.1)
        public float? Score { get; set; }
        public int? RankPosition { get; set; }
        public DateTime? CalculatedLastAt { get; set; }
        public int? OrganizationId { get; set; }
        public Profile? User { get; set; }
        public Workspace? Organization { get; set; }
    }
}
