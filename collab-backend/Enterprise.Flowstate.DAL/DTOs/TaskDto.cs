using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.TaskEnums;
using TaskStatus = Enterprise.Flowstate.DAL.Enums.TaskEnums.TaskStatus;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid? TaskGuid { get; set; }
        public DateTime CreateAt => DateTime.UtcNow;
        public int ProjectId { get; set; }
        public int AssignedBy { get; set; }
        public int AssignedTo { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public int? TicketId { get; set; }
        public int? SprintId { get; set; }
        public ProjectDto? Project { get; set; }
        public ProfileDto? AssignedByUser { get; set; }
        public ProfileDto? AssignedToUser { get; set; }
        public SprintDto? Sprint { get; set; }
        public TicketDto? Ticket { get; set; }
        public string? StatusInString => ((TaskEnums.TaskStatus)Status).ToString();
        public string? PriorityInString => ((TaskEnums.TaskPriority)Priority).ToString();
        public string? StartDateInString => StartDate?.ToString("d MMMM,yyyy");
        public string? EndDateInString => EndDate?.ToString("d MMMM,yyyy");
    }
}
