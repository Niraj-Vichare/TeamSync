using Enterprise.Flowstate.DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.DAL.Models
{
    public class AuthVerifyRequest
    {
        public string IdToken {  get; set; }
        public string AuthMethod { get; set; }
        public string? DisplayName {  get; set; }
        public string? ProfileUrl {  get; set; }
        public string? WorkspaceSlug {  get; set; }
    }
}
