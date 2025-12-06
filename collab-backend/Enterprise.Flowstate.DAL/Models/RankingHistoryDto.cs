using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class RankingHistoryDto
    {

        public string Month { get; set; }
        public double Score { get; set; }
        public int Rank { get; set; }

    }
}
