using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    using Supabase.Postgrest.Attributes;
    using Supabase.Postgrest.Models;
    using System;

    namespace Enterprise.Flowstate.DAL.Models
    {
        [Table("ticket_close_requests")]
        public class TicketCloseRequest : BaseModel
        {
            [PrimaryKey("id")]
            public long Id { get; set; }

            [Column("created_at")]
            public DateTime CreatedAt { get; set; }

            [Column("ticket_guid")]
            public Guid? TicketGuid { get; set; }

            [Column("requested_by")]
            public int? RequestedBy { get; set; }

            [Column("workspace_id")]
            public int? WorkspaceId { get; set; }

            [Column("reason")]
            public string? Reason { get; set; }

            [Column("status")]
            public int? Status { get; set; }

            [Column("reviewed_by")]
            public int? ReviewedBy { get; set; }

            [Column("reviewed_at")]
            public DateTime? ReviewedAt { get; set; }

            [Column("reviewed_note")]
            public string? ReviewedNote { get; set; }

            [Column("updated_at")]
            public DateTime? UpdatedAt { get; set; }

            // Navigation Properties (same pattern as your Ticket model)

            [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
            public Ticket? Ticket { get; set; }

            [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
            public Profile? RequestedByUser { get; set; }

            [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
            public Profile? ReviewedByUser { get; set; }

            [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
            public Workspace? Workspace { get; set; }
        }
    }
}
