using static Enterprise.Flowstate.DAL.Enums.TicketEnums;

public class TicketDto
{
    public int TicketId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; }

    public TicketPriority? Priority { get; set; }
    public string? PriorityInString => Priority?.ToString();

    public int? ReportedBy { get; set; }
    public int? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public string? AssignedByName { get; set; }

    public TicketStatus? Status { get; set; }
    public string? StatusInString => Status?.ToString();

    public string? ProjectName { get; set; }
    public int? ProjectId { get; set; }
    public int? SprintId { get; set; }
    public string? WorkspaceGuid { get; set; }
    public string? SprintName { get; set; }
    public string? Steps { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? Points { get; set; }

    public TicketType? TypeId { get; set; }
    public string? TypeName => TypeId?.ToString();

    public Guid? TicketGuid { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public string? StartDateInString => StartDate?.ToString("dd MM yyyy");
    public string? EndDateInString => EndDate?.ToString("dd MM yyyy");
}