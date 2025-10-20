using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Enterprise.Flowstate.Controllers
{
    [Route("tickets")]
    public class TicketController : AuthBaseController
    {
        private IOmniService _omniService;
        public TicketController(IOmniService omniService)
        {
            _omniService = omniService;
        }

        [HttpPost]
        public async Task<ApiResponseModel<object>> CreateTicket([FromQuery] string workspaceGuid, [FromBody] TicketDto ticketDto)
        {
            try
            {
                if (ticketDto == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket input are not cannot be null"
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
                bool isCreated = await _omniService.TicketService.CreateTicket(workspaceGuid, ticketDto);
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
        public async Task<ApiResponseModel<PaginationResponse<TicketDto>>> GetTickets([FromQuery] string workspaceGuid, [FromQuery] string? searchTerm, [FromQuery] string? type, [FromQuery] string? status, [FromQuery] string? priority, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // 1️. Validate input
                if (string.IsNullOrEmpty(workspaceGuid))
                {
                    return new ApiResponseModel<PaginationResponse<TicketDto>>
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
                    return new ApiResponseModel<PaginationResponse<TicketDto>>
                    {
                        StatusCode = StatusCodes.Status401Unauthorized,
                        Success = false,
                        Message = "Authentication failed."
                    };
                }



                //3. Fetch sprints with pagination and filters
                var tickets = await _omniService.TicketService.GetTickets(
                    workspaceGuid,
                    type,
                    searchTerm,
                    status,
                    priority,
                    pageNumber,
                    pageSize
                );



                return new ApiResponseModel<PaginationResponse<TicketDto>>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Message = "Sprints fetched successfully.",
                    Data = tickets
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PaginationResponse<TicketDto>>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                };
            }
        }

        [HttpDelete]
        public async Task<ApiResponseModel<object>> DeleteTicket(string ticketGuid)
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
                bool isDeleted = await _omniService.TicketService.DeleteTicket(ticketGuid);
                return new ApiResponseModel<object>
                {
                    Message = "",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };

            }
        }

        [HttpPatch("{ticketGuid}")]
        public async Task<ApiResponseModel<object>> UpdateTicket(string ticketGuid,[FromBody] TicketDto ticketDto)
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
                bool isEdited = await _omniService.TicketService.EditTicket(ticketGuid, userId.ToString(), ticketDto);

                return new ApiResponseModel<object>
                {
                    Message = "",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }

        }

        [HttpPatch]
        public async Task<ApiResponseModel<object>> AddTicketInSprint(string ticketGuid, string sprint)
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
                await _omniService.TicketService.DeleteTicket(ticketGuid);
                return new ApiResponseModel<object>
                {
                    Message = "",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };

            }
        }

        [HttpGet("{ticketGuid}/steps")]
        public async Task<ApiResponseModel<object>> GetTicketStep(string ticketGuid)
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
                var ticketDetail = await _omniService.TicketService.GetTicketStep(ticketGuid);
                return new ApiResponseModel<object>
                {
                    Message = "",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Data = ticketDetail
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }

        [HttpPut("{ticketGuid}/steps")]
        public async Task<ApiResponseModel<object>> UpdateTicketSteps(string ticketGuid, List<string> steps)
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
                bool isUpdated = await _omniService.TicketService.UpdateTicketSteps(ticketGuid, steps);
                return new ApiResponseModel<object>
                {
                    Message = "",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true
                };

            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "An error occurred while retrieving profile",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }

        [HttpGet("/sprints/{sprintId}/tickets")]
        public async Task<List<TicketDropdownModel>> GetProjectDropdowns(string sprintId)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                if (string.IsNullOrEmpty(sprintId))
                {
                    return null;
                }
                var result = await _omniService.TicketService.GetTicketsBySprintId(sprintId);

                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
