using Microsoft.AspNetCore.Mvc;

namespace Enterprise.Flowstate.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
