using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Controllers;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        public async Task<ApiResponseModel<object>> CreateTask([FromQuery] string workspaceGuid, [FromBody] TaskDto taskDto)
        {
            try
            {
                if (taskDto == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Task input are not cannot be null"
                    };
                }

                // Can user create the workspaces.

                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                bool isCreated = await _omniService.TaskService.CreateTask(userId.ToString(), taskDto);
                if (!isCreated)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Failed to create workspace"
                    };

                }
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Successfully created an workspace for the user"
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = ex.Message,
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

        [HttpGet("assigned")]
        public async Task<ApiResponseModel<object>> GetAllTaskAssignedToUser([FromQuery] string workspaceGuid,
            [FromQuery] string? projectId,
            [FromQuery] string? sprintId,
            [FromQuery] string? ticketId,
            [FromQuery] string? priority,
            [FromQuery] string? status)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                var allTasks= await _omniService.TaskService.GetAllTaskAssignedToUser(userId.ToString(), projectId, sprintId, ticketId, priority, status);

                if (!allTasks.Any())
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status204NoContent,
                        Success = false,
                        Data = allTasks,
                        Message = "No content found"
                    };
                }
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Get all tasks",
                    Data = allTasks
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

        [HttpPatch("{taskGuid}")]
        public async Task<ApiResponseModel<object>> UpdateTask(string taskGuid, [FromBody] TaskDto taskModel)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                bool isEdited = await _omniService.TaskService.UpdateTask(taskGuid,userId.ToString(),taskModel);

                return new ApiResponseModel<object>
                {
                    Message = "",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true
                };


            }
            catch(Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        [HttpPatch]
        [Route("{taskId}/status")]
        public async Task<ApiResponseModel<object>> UpdateTaskStatus(int taskId,[FromQuery] string status)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                bool isUpdated = await _omniService.TaskService.UpdateTaskStatus(userId.ToString(),taskId,status);
                if (!isUpdated)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Not able to update the task"
                    };
                }
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Updated the task status"
                };

            }
            catch(Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Data = ex
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
        public async Task<ApiResponseModel<object>> DeleteTask(string taskId)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Authentication fails",
                        StatusCode = StatusCodes.Status401Unauthorized,
                    };
                }
                bool isDeleted = await _omniService.TaskService.DeleteTask(taskId);
                if (!isDeleted)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Unable delete the task."
                    };
                }
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
    }
}
