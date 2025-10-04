//using Enterprise.Flowstate.BAL.Interface.Service;
//using Enterprise.Flowstate.DAL.DTOs;
//using Enterprise.Flowstate.DAL.Models;
//using Microsoft.AspNetCore.Mvc;
//using System.Security.Claims;

//namespace Enterprise.Flowstate.Controllers
//{
//    public class TicketController : AuthBaseController
//    {
//        private IOmniService _omniService;
//        public TicketController(IOmniService omniService)
//        {
//            _omniService = omniService;
//        }

//        [HttpPost]
//        [Route("create-ticket")]
//        public async Task<ApiResponseModel<object>> CreateTicket(TicketDto ticketDto)
//        {
//            try
//            {
//                if (ticketDto == null)
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        StatusCode = StatusCodes.Status400BadRequest,
//                        Success = false,
//                        Message = "Ticket input are not cannot be null"
//                    };
//                }

//                // Can user create the workspaces.

//                var identity = HttpContext.User.Identity as ClaimsIdentity;
//                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        Success = false,
//                        Message = "Authentication fails",
//                        StatusCode = StatusCodes.Status401Unauthorized,
//                    };
//                }
//                bool isCreated = await _omniService.TicketService.CreateTicket(userId.ToString(),ticketDto);
//                if (!isCreated)
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        StatusCode = StatusCodes.Status400BadRequest,
//                        Success = false,
//                        Message = "Failed to create workspace"
//                    };

//                }
//                return new ApiResponseModel<object>
//                {
//                    StatusCode = StatusCodes.Status200OK,
//                    Success = true,
//                    Message = "Successfully created an workspace for the user"
//                };


//            }
//            catch (Exception ex)
//            {
//                return new ApiResponseModel<object>
//                {
//                    StatusCode = StatusCodes.Status500InternalServerError,
//                    Success = false,
//                    Message = ex.Message,
//                };
//            }
//        }

//        [HttpGet]
//        [Route("get-tickets")]
//        public async Task<ApiResponseModel<object>> GetTickets(int type,int pageNumber,int pageSize,Dictionary<string,string> parameter)
//        {
//            try
//            {
//                var identity = HttpContext.User.Identity as ClaimsIdentity;
//                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        Success = false,
//                        Message = "Authentication fails",
//                        StatusCode = StatusCodes.Status401Unauthorized,
//                    };
//                }

//                var tickets = await _omniService.TicketService.GetTickets(type,null, pageNumber, pageSize);
//                return new ApiResponseModel<object>
//                {
//                    Message = "",
//                    Success = true
//                };

//            }
//            catch (Exception ex)
//            {
//                return new ApiResponseModel<object>
//                {
//                    Message = "An error occurred while retrieving profile",
//                    StatusCode = StatusCodes.Status500InternalServerError,
//                    Success = false
//                };
//            }

//        }

//        [HttpDelete]
//        public async Task<ApiResponseModel<object>> DeleteTicket(string ticketGuid)
//        {
//            try
//            {

//                var identity = HttpContext.User.Identity as ClaimsIdentity;
//                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        Success = false,
//                        Message = "Authentication fails",
//                        StatusCode = StatusCodes.Status401Unauthorized,
//                    };
//                }
//                bool isDeleted = await _omniService.TicketService.DeleteTicket(ticketGuid);
//                return new ApiResponseModel<object>
//                {
//                    Message = "",
//                    Success = true
//                };
//            }
//            catch(Exception ex)
//            {
//                return new ApiResponseModel<object>
//                {
//                    Message = "An error occurred while retrieving profile",
//                    StatusCode = StatusCodes.Status500InternalServerError,
//                    Success = false
//                };

//            }
//        }

//        [HttpPut]
//        public async Task<ApiResponseModel<object>> UpdateTicket(string ticketGuid,TicketDto ticketDto)
//        {
//            try
//            {
//                var identity = HttpContext.User.Identity as ClaimsIdentity;
//                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        Success = false,
//                        Message = "Authentication fails",
//                        StatusCode = StatusCodes.Status401Unauthorized,
//                    };
//                }
//                bool isEdited = await _omniService.TicketService.EditTicket(ticketGuid, userId.ToString(),ticketDto);

//                return new ApiResponseModel<object>
//                {
//                    Message = "",
//                    StatusCode = StatusCodes.Status200OK,
//                    Success = true
//                };

//            }
//            catch (Exception ex)
//            {
//                return new ApiResponseModel<object>
//                {
//                    Message = "An error occurred while retrieving profile",
//                    StatusCode = StatusCodes.Status500InternalServerError,
//                    Success = false
//                };
//            }

//        }

//        public async Task<ApiResponseModel<object>> AddTicketInSprint(string ticketGuid,string sprint)
//        {
//            try
//            {
//                var identity = HttpContext.User.Identity as ClaimsIdentity;
//                var userIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//                {
//                    return new ApiResponseModel<object>
//                    {
//                        Success = false,
//                        Message = "Authentication fails",
//                        StatusCode = StatusCodes.Status401Unauthorized,
//                    };
//                }
//                await _omniService.TicketService.DeleteTicket(ticketGuid);
//                return new ApiResponseModel<object>
//                {
//                    Message = "",
//                    Success = true
//                };
//            }
//            catch (Exception ex)
//            {
//                return new ApiResponseModel<object>
//                {
//                    Message = "An error occurred while retrieving profile",
//                    StatusCode = StatusCodes.Status500InternalServerError,
//                    Success = false
//                };

//            }
//        }
//    }
//}
