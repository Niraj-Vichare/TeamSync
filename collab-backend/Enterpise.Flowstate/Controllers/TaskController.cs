using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;

namespace Enterpise.Flowstate.Controllers
{
    [Route("tasks")]
    public class TaskController : AuthBaseController
    {
        private IOmniService _omniService;
        public TaskController(IOmniService omniService)
        {
            _omniService = omniService;
        }


        [HttpPost]
        public async Task<ApiResponseModel<object>> CreateTask(TaskDto task)
        {
            try
            {

                bool isCreated = await _omniService.TaskService.CreateTask(task);

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status201Created,
                    Success = true,
                    Message = "Task created successfully",

                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        [HttpGet]
        public async Task<ApiResponseModel<object>> GetTaskBySprints(string projectId, string sprintId)
        {
            try
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Get all sprints tasks",
                    Data = null
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        [HttpGet]
        [Route("{projectId}/tasks")]
        public async Task<ApiResponseModel<object>> GetTasks(string projectId)
        {
            try
            {
                //var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Get all project tasks",
                    Data = null
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message
                };
            }
        }


        [HttpGet]
        [Route("{taskId}")]
        public async Task<ApiResponseModel<object>> GetTask(int taskId)
        {
            try
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Get task",
                    Data = null
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        [HttpDelete]
        [Route("{taskId}")]
        public async Task<ApiResponseModel<object>> DeleteTask(int taskId)
        {
            try
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully delete the task."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        [HttpPatch]
        [Route("{taskId}")]
        public async Task<ApiResponseModel<object>> UpdateTask(int taskId)
        {
            try
            {
                return new ApiResponseModel<object>
                {
                    Success = true,
                    StatusCode = StatusCodes.Status200OK,
                    Message = "Successfully updated the task."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Message = ex.Message
                };
            }
        }
    }
}
