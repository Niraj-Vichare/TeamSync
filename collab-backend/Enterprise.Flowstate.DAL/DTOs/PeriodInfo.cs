using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class PeriodInfo
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Display => $"{StartDate:MMM dd, yyyy} - {EndDate:MMM dd, yyyy}";
    }
}
