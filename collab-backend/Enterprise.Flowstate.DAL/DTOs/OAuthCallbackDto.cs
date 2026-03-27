using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.DAL.DTOs
{
    public class OAuthCallbackDto
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}
