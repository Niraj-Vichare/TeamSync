using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("workspace_user_mapping")]
    public class WorkspaceUserMapping:BaseModel
    {
        [PrimaryKey("workspace_id")]
        public int WorkspaceId { get; set; }
        [PrimaryKey("profile_id")]
        public int UserId { get; set; }
        [Column("role_id")]
        public int RoleId { get; set; } 

        [Reference(typeof(Workspace))]
        public Workspace? Workspace { get; set; }

        [Reference(typeof(Profile))]
        public Profile? Profile { get; set; }

    }
}
