using Microsoft.AspNetCore.Http;
using static Enterprise.Flowstate.DAL.Enums.TicketEnums;

namespace Enterprise.Flowstate.DAL.DTOs
{
    /// <summary>
    /// Full ticket detail returned by GET /tickets/{ticketGuid}.
    /// Extends TicketDto with the extra data needed for the detail page:
    /// assignee profile info, steps list, and the close-request status.
    /// </summary>
    public class TicketDetailDto : TicketDto
    {
        public string? AssignedToGuid { get; set; }
        public string? AssignedToAvatarUrl { get; set; }
        public string? ReportedByName { get; set; }
        public string? ReportedByGuid { get; set; }
        public List<string> StepsList { get; set; } = new();
        public bool CloseRequested { get; set; }
        public List<TicketCommentDto> Comments { get; set; } = new();
    }

    /// <summary>
    /// A single comment on a ticket, including file attachments described
    /// as part of the comment body (stored as JSON in the metadata column).
    /// </summary>
    public class TicketCommentDto
    {
        public int Id { get; set; }
        public string? CommentText { get; set; }
        public string? AuthorGuid { get; set; }
        public string? AuthorName { get; set; }
        public string? AuthorAvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Media { get; set; }
        public List<IFormFile>? Attachments { get; set; } = new();
        public bool IsCurrentUser { get; set; }  
    }


    public class AddCommentRequest
    {
        public string WorkspaceGuid { get; set; }  
        public string CommentText { get; set; } = string.Empty;
        public List<IFormFile> Attachments { get; set; } = new();
    }

    public class CloseRequestPayload
    {
        public string Reason { get; set; } = string.Empty;
    }
}