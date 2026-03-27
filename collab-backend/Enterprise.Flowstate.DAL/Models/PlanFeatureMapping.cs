using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("plan_feature_mapping")]
    public class PlanFeatureMapping : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("plan_type")]
        public int PlanType { get; set; }

        [Column("feature_id")]
        public int FeatureId { get; set; }

        [Column("is_enabled")]
        public bool IsEnabled { get; set; }
    }
}
