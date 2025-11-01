using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("organization_metric")]
    public class OrganizationMetric : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("workspace_id")]
        public int WorkspaceId { get; set; }

        [Column("active_project")]
        public int? ActiveProject { get; set; }

        [Column("active_tickets")]
        public int? ActiveTickets { get; set; }

        [Column("active_sprints")]
        public int? ActiveSprints { get; set; }

        [Column("active_task")]
        public int? ActiveTask { get; set; }

        [Column("completed_task")]
        public int? CompletedTask { get; set; }

        [Reference(typeof(Workspace))]
        public Workspace? Workspace { get; set; }
    }
}
