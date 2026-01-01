using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class SprintProgressModel
    {
        public DateTime Date { get;set; }
        public int Completed { get; set; }
        public int Pending { get; set; }
        public string DateInString => Date.ToString("yyyy-MM-dd");
    }
}
