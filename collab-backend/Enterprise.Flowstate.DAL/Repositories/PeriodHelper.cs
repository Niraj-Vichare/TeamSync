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

            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = today.AddDays(-diff);
            var endOfWeek = startOfWeek.AddDays(6);

            return (startOfWeek, endOfWeek);
        }

        public static bool IsInCurrentWeek(DateTime? startPeriod, DateTime? endPeriod)
        {
            if (!startPeriod.HasValue || !endPeriod.HasValue)
                return false;

            var (currentStart, currentEnd) = GetCurrentWeekPeriod();

            return startPeriod.Value.Date == currentStart &&
                   endPeriod.Value.Date == currentEnd;
        }

        public static (DateTime startPeriod, DateTime endPeriod) GetPreviousWeekPeriod()
        {
            var (currentStart, _) = GetCurrentWeekPeriod();
            var prevWeekStart = currentStart.AddDays(-7);
            var prevWeekEnd = currentStart.AddDays(-1);

            return (prevWeekStart, prevWeekEnd);
        }
    }

}
