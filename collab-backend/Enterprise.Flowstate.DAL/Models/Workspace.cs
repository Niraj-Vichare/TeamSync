using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("workspace")]
    public class Workspace:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("name")]
        public string Name { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Column("owner_id")]
        public int OwnerId { get; set; }
        [Column("logo_url")]
        public string CompanyLogo { get; set; }
        [Column("workspace_guid")]
        public string WorkspaceGuid { get; set; }
        [Column("create_date")]
        public DateTime CreatedAt { get; set; }
    }
}
