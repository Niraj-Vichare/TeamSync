using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreateAt { get; set; }
        public int ProjectId { get; set; }
        public int AssignedBy { get; set; }
        public int AssignedTo { get; set; }
        public DateTime? DueDate { get; set; }
        public int Status { get; set; }
        public int Priority { get; set; }

        public ProjectDto? Project { get; set; }
        public UserDto? AssignedByUser { get; set; }
        public UserDto? AssignedToUser { get; set; }
        public string? StatusInString => ((TaskEnums.TaskStatus)Priority).ToString();
        public string? PriorityInString => ((TaskEnums.TaskPriority)Priority).ToString();
    }
}
