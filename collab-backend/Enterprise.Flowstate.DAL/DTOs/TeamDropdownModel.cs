using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class TeamDropdownModel
    {
        public long TeamId { get; set; }
        public string TeamName { get;set; }
        public string? TeamLogo { get; set; }
    }
}
