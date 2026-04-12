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
    public class WorkspaceUserMapping : BaseModel
    {
        [PrimaryKey("workspace_id", false)] 
        public int WorkspaceId { get; set; }

        [PrimaryKey("profile_id", false)]   
        public int UserId { get; set; }

        [Column("role_id")]
        public long RoleId { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Workspace? Workspace { get; set; }

        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? Profile { get; set; }
    }
}
