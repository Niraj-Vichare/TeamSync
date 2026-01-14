using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class WorkspaceRequestModel
    {
        [Required]
        public string WorkspaceName { get; set; }
        public string? WorkspaceDescription { get; set; }    
    }
}
