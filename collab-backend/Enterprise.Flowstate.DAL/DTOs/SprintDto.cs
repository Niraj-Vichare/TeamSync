using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class SprintDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Goal { get; set; }
        public string Tagline { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreateDate => DateTime.UtcNow;
        public DateTime? UpdateDate { get; set; }
        public string StartDateInString => StartDate?.ToString("dd MMM yyyy");
        public string EndDateInString => EndDate?.ToString("dd MMM yyyy");
        public string EstimatedDateRange => $"{StartDateInString} - {EndDateInString}";
        public SprintEnums.SprintStatus Status { get; set; }
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }

        public string StatusDescription
        {
            get
            {
                var today = DateTime.UtcNow.Date;

                if (Status == SprintEnums.SprintStatus.Completed)
                    return "Completed";

                if (today < StartDate?.Date)
                    return "Upcoming";

                if (today >= StartDate?.Date && today <= EndDate?.Date)
                    return "Active";

                if (today > EndDate?.Date)
                    return "Overdue";
                return "Unknown";
            }
        }
        public string? SprintGuid { get; set; }
        public TeamDropdownModel TeamModel { get; set; }

        public string Tags { get; set; }
        

    }
}
