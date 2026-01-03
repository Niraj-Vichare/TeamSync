using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enterprise.Flowstate.Controllers
{
    [Authorize]
    [ApiController]
    [Authorize(Roles = "Member,Viewer")]
    public class MemberAuthorizedControllerBase : ControllerBase
    {
        
    }
}
