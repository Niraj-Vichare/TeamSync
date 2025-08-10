using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.Models
{
    public class ApiResponseModel<T>
    {
        public string Message {  get; set; }    
        public int StatusCode {  get; set; }
        public bool Success {  get; set; }
        public T? Data { get; set; }
    }
}
