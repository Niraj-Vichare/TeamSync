using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;

namespace Enterpise.Flowstate.Controllers
{
    [Route("/[controller]")]
    public class TaskController : AuthBaseController
    {
        [Route("create")]
        public async Task<ApiResponseModel<object>> CreateTask()
        {
            
        }

        public async Task<ApiResponseModel<object>> GetTasks()
        {

        }

        public async Task<ApiResponseModel<object>> GetTask(int taskId)
        {

        }

        public async Task<ApiResponseModel<object>> DeleteTask(int taskId)
        {

        }

        public async Task<ApiResponseModel<object>> UpdateTask(int taskId,)
        {

        }
    }
}
