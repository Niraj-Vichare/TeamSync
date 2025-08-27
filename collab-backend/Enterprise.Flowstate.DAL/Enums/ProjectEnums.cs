using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Enums
{
    public class ProjectEnums
    {
        public enum ProjectStatus
        {
            Ongoing = 1,
            Completed = 2,
            Archived = 3,
            Cancelled = 4,
            Paused = 5,
            NotStarted = 6,
            InReview = 7
        }

        public enum ProjectCategory
        {
            INFORMATION_TECHNOLOGY =1,
            HEALTHCARE,
            EDUCATION,
            FINANCE,
            MANUFACTURING,
            CONSTRUCTION,
            RETAIL,
            TRANSPORTATION,
            ENERGY,
            TELECOMMUNICATIONS,
            AGRICULTURE,
            GOVERNMENT,
            ENTERTAINMENT,
            HOSPITALITY,
            REAL_ESTATE,
            LEGAL,
            NON_PROFIT,
            OTHER
        }

    }
}
