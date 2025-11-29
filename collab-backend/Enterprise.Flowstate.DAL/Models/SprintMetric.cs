using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("sprint_metric")]
    public class SprintMetric:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("sprint_id")]
        public int SprintId { get; set; }
        [Column("sprint_velocity")]
        public float SprintVelocity { get; set; }
        [Column("total_tickets")]
        public int TotalTickets { get; set; }
        [Column("sprint_effiency")]
        public float SprintEffiency { get; set; }
    }
}
