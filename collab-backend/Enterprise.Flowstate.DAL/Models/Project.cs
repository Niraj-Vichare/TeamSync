using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("project")]
    public class Project : BaseModel
    {
        [PrimaryKey("id")]
        public int ProjectId { get; set; }
        [Column("project_name")]
        public string ProjectName { get; set; }

        [Column("project_description")]
        public string ProjectDescription { get; set; }

        [Column("project_status")]
        public int ProjectStatus { get; set; }
        [Column("project_tagline")]
        public string ProjectTagline { get; set; }
        [Column("project_logo")]
        public string ProjectLogo { get; set; }

        [Column("project_guid")]
        public string ProjectGuid { get; set; }
        [Column("project_category")]
        public int ProjectCategory { get; set; }
        [Column("start_date")]
        public DateTime? StartDate { get; set; }
        [Column("end_date")]
        public DateTime? EndDate { get; set; }
        [Column("due_date")]
        public DateTime? DueDate { get; set; }

    }
}
