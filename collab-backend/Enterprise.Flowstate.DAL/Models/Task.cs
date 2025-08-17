using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("task")]
    public class Task:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("title")]
        public string Title { get; set; }
        [Column("description")]
        public string? Description { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("project_id")]
        public int ProjectId { get; set; }
        [Column("assigned_to")]
        public int AssignedTo { get; set; }
        [Column("assigned_by")]
        public int AssignedBy { get; set; }
        [Column("due_date")]
        public DateTime? DueDate { get; set; }
        [Column("status")]
        public int Status { get; set; }
        [Column("priority")]
        public int Priority { get; set; }
    }
}
