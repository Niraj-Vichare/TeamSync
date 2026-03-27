using Enterprise.Flowstate.DAL.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Enterprise.Flowstate.Controllers
{
    [Authorize]
    [ApiController]
    public class OwnerAuthorizedControllerBase : ControllerBase
    {
        
    }
}
