using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.DTOs
{
    public class ProfileDto
    {
        public int Id { get; set; }
        public string DisplayName { get; set; }
        public string Guid { get; set; }
        public string Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string WorkspaceId { get; set; }
    }
}
