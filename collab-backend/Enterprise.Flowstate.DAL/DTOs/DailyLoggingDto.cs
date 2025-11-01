using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class DailyLoggingDto
    {
        public int Id { get; set; }
        public TimeOnly CheckIn { get; set; }
        public TimeOnly CheckOut { get; set; }
        public DateOnly LogDate { get; set; }
        public DateTime CheckingDate { get; set; }
        public int UserId { get; set; }
        public int CompletedTask { get; set; }
        public float TotalSpentHours { get; set; }
        public UserDto? User { get; set; }
    }
}
