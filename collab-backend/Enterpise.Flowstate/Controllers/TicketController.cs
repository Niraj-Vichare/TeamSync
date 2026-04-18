using Enterprise.Flowstate.BAL.Filters;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.Configuration;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Enums;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using static Enterprise.Flowstate.DAL.Enums.AuthEnums;

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
        [RequireAuthorization(RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Manager)]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]   
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
        [Route("users")]
        public async Task<ApiResponseModel<object>> GetUserTickets(string workspaceGuid)
        {
            try
            {
                // 2️ Get user identity
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
                var userTickets = await _omniService.TicketService.GetUserTickets(workspaceGuid, userId.ToString());
                if (!userTickets.Any())
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        StatusCode = StatusCodes.Status204NoContent,
                        Success = false,
                    };
                }
                return new ApiResponseModel<object>
                {
                    Data = userTickets,
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };

            } catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Data = ex.Data,
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
        [RequireAuthorization(AuthEnums.RoleEnum.Owner, AuthEnums.RoleEnum.Admin, AuthEnums.RoleEnum.Manager)]

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
        public async Task<ApiResponseModel<object>> UpdateTicket(string ticketGuid, [FromBody] TicketDto ticketDto)
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
        [RequireAuthorization(AuthEnums.RoleEnum.Owner, AuthEnums.RoleEnum.Admin, AuthEnums.RoleEnum.Manager)]

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
                await _omniService.TicketService.AddTicketToSprint(ticketGuid, sprint);
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
        [RequireAuthorization(AuthEnums.RoleEnum.Owner, AuthEnums.RoleEnum.Admin, AuthEnums.RoleEnum.Manager)]

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

        [HttpGet("{sprintId}/dropdown")]
        public async Task<List<TicketDropdownModel>> GetProjectDropdowns(int sprintId)
        {
            try
            {
                var identity = HttpContext.User.Identity as ClaimsIdentity;
                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                if (sprintId<=0)
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

        [HttpGet("/{ticketGuid}/tasks")]
        public async Task<ApiResponseModel<object>> GetTicketTasks(string ticketGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
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

                var tickets = await _omniService.TicketService.GetTicketTasks(ticketGuid);
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


        [HttpGet("{ticketGuid}/detail")]
        public async Task<ApiResponseModel<object>> GetTicketDetail(string ticketGuid)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket GUID is required."
                    };
                }

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

                var detail = await _omniService.TicketService.GetTicketDetail(ticketGuid,userId.ToString());
                if (detail == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Ticket not found.",
                        Success = false,
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                return new ApiResponseModel<object>
                {
                    Data = detail,
                    Message = "",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
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


        [HttpPost("{ticketGuid}/comments")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> AddComment(
            string ticketGuid,
            [FromBody] AddCommentRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket GUID is required."
                    };
                }

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

                if (string.IsNullOrEmpty(request?.CommentText?.Trim()))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Comment text cannot be empty."
                    };
                }

                bool canComment = await _omniService.TicketService.CanUserComment(request.WorkspaceGuid,ticketGuid, userId.ToString());
                if (!canComment)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status403Forbidden,
                        Success = false,
                        Message = "Only the assigned user or a Manager / Admin / Owner can comment on this ticket."
                    };
                }

                bool added = await _omniService.TicketService.AddComment(ticketGuid, userId.ToString(), request);
                if (!added)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Failed to save comment.",
                        Success = false,
                        StatusCode = StatusCodes.Status500InternalServerError
                    };
                }

                return new ApiResponseModel<object>
                {
                    Data = null,
                    Message = "Comment added.",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
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


        [HttpPost("{ticketGuid}/close-request")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> RequestClose(
            string ticketGuid,
            [FromBody] CloseRequestPayload payload)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket GUID is required."
                    };
                }

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

                if (string.IsNullOrEmpty(payload.WorkspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                bool isAssignee = await _omniService.TicketService.IsAssignedUser(ticketGuid, userId.ToString());
                if (!isAssignee)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status403Forbidden,
                        Success = false,
                        Message = "Only the user assigned to this ticket can request its closure."
                    };
                }

                bool requested = await _omniService.TicketService.RequestTicketClose(payload.WorkspaceGuid,
                    ticketGuid, userId.ToString(), payload?.Reason ?? string.Empty);
                if (!requested)
                {
                    return new ApiResponseModel<object>
                    {
                        Data = null,
                        Message = "Failed to submit close request.",
                        Success = false,
                        StatusCode = StatusCodes.Status500InternalServerError
                    };
                }

                return new ApiResponseModel<object>
                {
                    Data = null,
                    Message = "Close request submitted successfully.",
                    Success = true,
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
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



        [HttpPatch("{ticketGuid}/priority")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> UpdateTicketPriority([FromRoute] string ticketGuid,[FromBody] UpdateStatusModel statusModel)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket GUID is required."
                    };
                }

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

                if (string.IsNullOrEmpty(statusModel.WorkspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                bool statusChanges = await _omniService.TicketService.UpdateTicketStatus(ticketGuid, (TicketEnums.TicketStatus)statusModel.Status);
                if (!statusChanges)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Ticket Status is not able to updated",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                return new ApiResponseModel<object>
                {
                    Message = "Ticket status is able to updated",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
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

        [HttpPatch("{ticketGuid}/status")]
        [EnableRateLimiting(RateLimitingConfiguration.Write)]
        public async Task<ApiResponseModel<object>> UpdateTicketStatus([FromRoute] string ticketGuid, UpdatePriorityModel priorityModel)
        {
            try
            {
                if (string.IsNullOrEmpty(ticketGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Success = false,
                        Message = "Ticket GUID is required."
                    };
                }

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

                if (string.IsNullOrEmpty(priorityModel.WorkspaceGuid))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Workspace GUID is required.",
                        Success = false
                    };
                }

                bool statusChanges = await _omniService.TicketService.UpdateTicketPriority(ticketGuid, (TicketEnums.TicketPriority)priorityModel.Priority);
                if (!statusChanges)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Ticket Status is not able to updated",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                return new ApiResponseModel<object>
                {
                    Message = "Ticket status is able to updated",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
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
