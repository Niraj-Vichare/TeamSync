using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterpise.Flowstate.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private IOmniService _omniService;
        public AuthController(IOmniService omniService)
        {
            _omniService = omniService;
        }


    }
}
