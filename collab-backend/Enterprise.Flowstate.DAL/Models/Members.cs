using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("members")]
    public class Members:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("profile_id")]
        public int ProfileId { get; set; }
        [Column("workspace_guid")]
        public string WorkspaceGuid { get; set; }
        [Column("department_id")]
        public int DepartmentId { get; set; }
        [Column("status")]
        public int Status { get; set; }
        [Reference(typeof(Profile))]
        public Profile Profile { get; set; }
        [Reference(typeof(Workspace))]
        public Workspace Workspace { get; set; }
        [Reference(typeof(Department))]
        public Department Department { get; set; }
    }
}
