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
        [PrimaryKey("workspace_id")]
        public int WorkspaceId { get; set; }
        [PrimaryKey("project_id")]
        public int ProjectId { get; set; }

        [Reference(typeof(Workspace))]
        public Workspace? Workspace { get; set; }

        [Reference(typeof(Project))]
        public Project? Project { get; set; }
    }
}
