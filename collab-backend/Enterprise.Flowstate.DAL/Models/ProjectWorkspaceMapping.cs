using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("project_workspace_mapping")]
    public class ProjectWorkspaceMapping:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("workspace_id")]
        public int WorkspaceId { get; set; }
        [Column("project_id")]
        public int ProjectId { get; set; }

        [Reference(typeof(Workspace))]
        public Workspace? Workspace { get; set; }

        [Reference(typeof(Project))]
        public Project? Project { get; set; }
    }
}
