using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class PaginationResponse<T>
    {
        public List<T> Data { get; set; }
        public int TotalCount { get;set; }
        public int PageSize { get; set; }   
        public int PageNumber { get; set; }
        public int TotalPage => (int)Math.Ceiling((double)TotalCount/PageSize);
    }
}
