using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterprise.Flowstate.Controllers
{
    [Route("sprints")]
    public class SprintController : AuthBaseController
    {
        private IOmniService _omniService;
        public SprintController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpPost]
        public async Task<ApiResponseModel<object>> CreateSprint([FromQuery] string workspaceGuid,[FromBody] SprintDto sprintDto)
        {
            try
            {
                // 1️⃣ Validate input
                if (sprintDto == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint data cannot be null."
                    };
                }

                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Workspace GUID is required to create a sprint."
                    };
                }

                if (string.IsNullOrEmpty(sprintDto.Title))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint title is required."
                    };
                }

                if (sprintDto.StartDate == default || sprintDto.EndDate == default)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Start date and end date are required."
                    };
                }

                if (sprintDto.StartDate > sprintDto.EndDate)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Start date cannot be after end date."
                    };
                }

                // 2️. Get user identity
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status401Unauthorized,
                        Success = false,
                        Message = "Authentication failed."
                    };
                }

                

                // 3. Create sprint
                bool isCreated = await _omniService.SprintService.CreateSprint(
                    userId.ToString(), sprintDto);

                if (!isCreated)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status500InternalServerError,
                        Success = false,
                        Message = "Failed to create the sprint. Please try again."
                    };
                }

                // 5️⃣ Success response
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status201Created,
                    Success = true,
                    Message = "Sprint created successfully."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponseModel<PaginationResponse<SprintDto>>> GetSprints([FromQuery]string workspaceGuid,[FromQuery]string searchTerm,[FromQuery]string status,[FromQuery]string projectId,[FromQuery]int pageNumber = 1,[FromQuery]int pageSize = 10)
        {
            try
            {
                // 1️. Validate input
                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<PaginationResponse<SprintDto>>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Workspace GUID is required."
                    };
                }

                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 10;

                // 2️ Get user identity
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<PaginationResponse<SprintDto>>
                    {
                        StatusCode = StatusCodes.Status401Unauthorized,
                        Success = false,
                        Message = "Authentication failed."
                    };
                }



                //3. Fetch sprints with pagination and filters
                var sprints = await _omniService.SprintService.GetSprints(
                    workspaceGuid,
                    searchTerm,
                    status,
                    projectId,
                    pageNumber,
                    pageSize
                );



                return new ApiResponseModel<PaginationResponse<SprintDto>>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Sprints fetched successfully.",
                    Data = sprints
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PaginationResponse<SprintDto>>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                };
            }
        }
    }
}
