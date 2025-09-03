using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class WorkspaceDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int OwnerId { get;set; }
        public string CompanyLogo { get; set; }
        public string WorkspaceGuid { get; set; }
        public string Description { get; set; }
    }
}
