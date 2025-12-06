using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class PeriodHelper
    {
        public static (DateTime startPeriod, DateTime endPeriod) GetCurrentWeekPeriod()
        {
            var today = DateTime.UtcNow.Date;

            // Week starts on Monday (adjust if you want Sunday)
            int daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
            var startOfWeek = today.AddDays(-daysUntilMonday);
            var endOfWeek = startOfWeek.AddDays(6);

            return (startOfWeek, endOfWeek);
        }

        public static bool IsInCurrentWeek(DateTime? startPeriod, DateTime? endPeriod)
        {
            if (!startPeriod.HasValue || !endPeriod.HasValue)
                return false;

            var (currentStart, currentEnd) = GetCurrentWeekPeriod();
            return startPeriod.Value.Date == currentStart.Date &&
                   endPeriod.Value.Date == currentEnd.Date;
        }

        public static (DateTime startPeriod, DateTime endPeriod) GetPreviousWeekPeriod()
        {
            var (currentStart, _) = GetCurrentWeekPeriod();
            var prevWeekEnd = currentStart.AddDays(-1);
            var prevWeekStart = prevWeekEnd.AddDays(-6);
            return (prevWeekStart, prevWeekEnd);
        }


    }
}
