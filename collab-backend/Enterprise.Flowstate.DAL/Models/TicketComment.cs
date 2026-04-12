using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("ticket_comments")]
    public class TicketComment:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("ticket_id")]
        public int TicketId { get; set; }
        [Column("comment")]
        public string CommentText { get; set; } = string.Empty;
        [Column("created_at")]
        public DateTime? CreateDate { get;set; }
        [Column("commented_by")]
        public int AuthorId { get; set; }
        [Column("media_url")]
        public string? Media { get; set; }
        [Column(ignoreOnInsert: true, ignoreOnUpdate: true)]
        public Profile? Author { get; set; }
    }
}
