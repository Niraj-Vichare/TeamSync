using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    [Table("daily_logging")]
    public class DailyLogging:BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("checkin_time")]
        public DateTimeOffset? CheckIn { get; set; }
        [Column("checkout_time")]
        public DateTimeOffset? CheckOut { get; set; }
        [Column("checking_date")]
        public DateTime CheckingDate { get; set; }
        [Column("user_id")]
        public int UserId { get; set; }
        [Column("auto_checkout")]
        public int AutoCheckout { get; set; }
        [Column("is_valid_day")]
        public bool IsValidDay { get; set; }

        [Column("workspace_id")]
        public int? WorkspaceId { get; set; }

        [Reference(typeof(Profile))]
        public Profile? User { get; set; }
    }
}
