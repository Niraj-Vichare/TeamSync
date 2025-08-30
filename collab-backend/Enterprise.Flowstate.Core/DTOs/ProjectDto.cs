using Enterprise.Flowstate.DAL.Enums;
using static Enterprise.Flowstate.DAL.Enums.ProjectEnums;

namespace Enterprise.Flowstate.BAL.DTOs
{
    public class ProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;  // required
        public string ProjectDescription { get; set; } = string.Empty;  // required

        public ProjectEnums.ProjectStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional fields
        public string? ProjectTagline { get; set; }
        public string? ProjectLogo { get; set; }

        public DateTime? StartDate { get; set; }   // nullable
        public DateTime? EndDate { get; set; }     // nullable
        public DateTime? DueDate { get; set; }     // nullable

        public string ProjectGuid { get; set; } = Guid.NewGuid().ToString();

        public ProjectCategory Category { get; set; }

        // Read-only helpers (handle nulls safely)
        public string ProjectStatus => Status.ToString();
        public string? StartDateInString => StartDate?.ToString("d MMMM ,yyyy");
        public string? EndDateInString => EndDate?.ToString("d MMMM ,yyyy");
        public string? DueDateInString => DueDate?.ToString("d MMMM ,yyyy");
        public string ProjectCategory => Category.ToString();
    }

}
