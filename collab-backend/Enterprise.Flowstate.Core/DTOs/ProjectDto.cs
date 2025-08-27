using Enterprise.Flowstate.DAL.Enums;
using static Enterprise.Flowstate.DAL.Enums.ProjectEnums;

namespace Enterprise.Flowstate.BAL.DTOs
{
    public class ProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; }
        public string ProjectDescription { get; set; }
        public ProjectEnums.ProjectStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ProjectTagline { get; set; }
        public string ProjectLogo { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime DueDate { get; set; }

        public ProjectCategory Category { get; set; }
        public string ProjectStatus => ((ProjectStatus)Status).ToString();
        public string StartDateInString => StartDate.ToString("d MMMM ,yyyy");
        public string EndDateInString => EndDate.ToString("d MMMM ,yyyy");
        public string DueDateInString => DueDate.ToString("d MMMM ,yyyy");
        public string ProjectCategory => ((ProjectCategory)Category).ToString();
       
    }
}
