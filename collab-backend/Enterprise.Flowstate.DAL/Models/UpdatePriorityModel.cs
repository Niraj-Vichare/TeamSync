using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class UpdatePriorityModel
    {
        public string WorkspaceGuid { get; set; }
        public int Priority { get; set; }
    }
}
