using Enterprise.Flowstate.BAL.Filters;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Configuration;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

namespace Enterprise.Flowstate.Controllers
{
    [Route("sprints")]
    [EnableRateLimiting(RateLimitingConfiguration.Api)]
    public class SprintController : AuthBaseController
    {
        private IOmniService _omniService;
        public SprintController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpPost]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager)]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> CreateSprint([FromQuery] string workspaceGuid, [FromBody] SprintDto sprintDto)
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

        [HttpPost("{sprintGuid}/tickets/{ticketGuid}")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager)]
        public async Task<ApiResponseModel<object>> IncludeTicketSprint(string sprintGuid, string ticketGuid, [FromBody] int teamId)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid) || string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Sprint GUID and Ticket GUID are required.",
                        Success = false,
                    };
                }

                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Authentication failed.",
                        Success = false,
                    };
                }

                bool isUpdated = await _omniService.SprintService.IncludeTicketInSprint(sprintGuid, ticketGuid, teamId);
                if (!isUpdated)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Failed to include ticket in sprint. Please try again.",
                        Success = false,
                    };
                }

                return new ApiResponseModel<object>
                {
                    Data = null,
                    Message = "Ticket included in sprint successfully.",
                    Success = true,
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = null,
                    // BUG FIX: was returning empty string, now returns the actual error
                    Message = $"An error occurred: {ex.Message}",
                    Success = false,
                };
            }
        }

        [HttpGet]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<PaginationResponse<SprintDto>>> GetSprints([FromQuery] string workspaceGuid, [FromQuery] string? searchTerm, [FromQuery] string? status, [FromQuery] string? projectId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

        [HttpGet("/projects/{projectId}/sprints")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<List<SprintDropdownModel>> GetSprintsByProjectId([FromRoute] string projectId)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                if (string.IsNullOrEmpty(projectId))
                {
                    return null;
                }
                var result = await _omniService.SprintService.GetSprintsByProjectId(projectId);

                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }


        [HttpGet("{sprintGuid}")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetSprint([FromRoute] string sprintGuid, [FromQuery] string workspaceGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Workspace GUID is required."
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

                var sprint = await _omniService.SprintService.GetSprint(workspaceGuid, sprintGuid);
                if (sprint == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no sprint with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = sprint,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/activities")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        // BUG FIX: pageNumber and pageSize were missing [FromQuery] so ASP.NET never bound them from the query string
        public async Task<ApiResponseModel<object>> GetSprintActivities(string sprintGuid, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required a sprint."
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

                var activity = await _omniService.SprintService.GetSprintActivities(sprintGuid, pageNumber, pageSize);
                if (activity == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no sprint with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = activity,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/assignedTeam")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetAssignedTeam(string sprintGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required to create a sprint."
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

                var sprint = await _omniService.TeamService.GetAssignedTeam(sprintGuid);
                if (sprint == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no sprint with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = sprint,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/tickets")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetSprintTickets(string sprintGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required to create a sprint."
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

                var tickets = await _omniService.TicketService.GetSprintTickets(sprintGuid);
                if (tickets == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no tickets with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = tickets,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/progress")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetSprintProgress(string sprintGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required to create a sprint."
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

                var tickets = await _omniService.SprintService.GetSprintProgress(sprintGuid);
                if (tickets == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no tickets with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = tickets,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/breakdown")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetSprintBreakdown(string sprintGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required to create a sprint."
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

                var tickets = await _omniService.SprintService.GetSprintBreakdown(sprintGuid);
                if (tickets == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no tickets with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = tickets,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };


            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
        }

        [HttpGet("{sprintGuid}/members")]
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Member, RoleEnum.Viewer)]
        public async Task<ApiResponseModel<object>> GetSprintTeamMembers(string sprintGuid)
        {
            try
            {

                if (string.IsNullOrEmpty(sprintGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Sprint GUID is required to create a sprint."
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

                var teamMembers = await _omniService.SprintService.GetSprintTeamMembers(sprintGuid);
                if (teamMembers == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "There is no team members with this guid",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = teamMembers,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex,
                    Message = ex.Message,
                    Success = false,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
