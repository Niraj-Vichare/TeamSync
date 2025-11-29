using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("department")]
    public class Department:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("created_at")]
        public DateTime CreateAt { get; set; }
        [Column("title")]
        public string Title { get; set; }
        [Column("tagline")]
        public string Tagline { get; set; }
    }
}
