using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Enterprise.Flowstate.Configuration;

namespace Enterpise.Flowstate.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private IOmniService _omniService;
        private Supabase.Client _supabaseClient;
        public AuthController(IOmniService omniService,Supabase.Client client)
        {
            _omniService = omniService;
            _supabaseClient = client;
        }

        [HttpPost("signin")]
        [EnableRateLimiting(RateLimitingConfiguration.Auth)]
        public async Task<ApiResponseModel<object>> Signin(LoginCredentials loginData)
        {
            try
            {
                bool isValidate = _omniService.AuthService.ValidateSigninData(loginData.Email, loginData.Password);
                if (!isValidate)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Signin data validation failed", // Fixed typo: was "Signup"
                        Success = false
                    };
                }

                var response = await _omniService.AuthService.SupabaseSiginWithPassword(loginData.Email, loginData.Password);
                if (response == null) // If signin failed
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status401Unauthorized,
                        Message = "Invalid email or password",
                        Success = false
                    };
                }
                if (response.User.EmailConfirmedAt == null)
                {
                    return new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Email is not verified",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                var currentWorkspaceId = await _omniService.ProfileService.GetCurrentWorkspaceId(response.User.Id);
                if (string.IsNullOrEmpty(currentWorkspaceId))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "No workspace found for the user",
                        Success = false
                    };
                }
                int userRole = await _omniService.RoleService.GetUserRole(response.User.Id);


                var accessToken = response.AccessToken;
                if (!string.IsNullOrEmpty(accessToken))
                {
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Path = "/",
                        Expires = DateTime.UtcNow.AddDays(2)
                    };

                    // Append the JWT token to the cookies
                    Response.Cookies.Append("authToken", accessToken, cookieOptions);

                    // Return success response with workspace ID.
                    // accessToken is also returned in the body so the frontend
                    // can pass it to SignalR (which cannot read HttpOnly cookies).
                    // Store it in memory only — never in localStorage.
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status200OK,
                        Message = "Signin successful",
                        Success = true,
                        Data = new
                        {
                            workspaceId = currentWorkspaceId,
                            userId = response.User.Id,
                            userRole = userRole,
                            accessToken = accessToken   // for SignalR hub only
                        }
                    };
                }
                else
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status500InternalServerError,
                        Message = "Failed to generate access token",
                        Success = false
                    };
                }
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                // _logger.LogError(ex, "Error during signin for email: {Email}", email);

                return new ApiResponseModel<object>
                {
                    Message = "An error occurred during signin",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }

        
        [HttpPost("signup")]
        [EnableRateLimiting(RateLimitingConfiguration.Auth)]
        public async Task<ApiResponseModel<object>> Signup(SignupDto signupData)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(signupData.Email) || string.IsNullOrWhiteSpace(signupData.Password))
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Email and password are required",
                        Success = false
                    };
                }

                // Validate signup data
                bool isValidate = _omniService.AuthService.ValidateSignupData(signupData);
                if (!isValidate)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Signup data validation failed",
                        Success = false
                    };
                }
                var response = await _omniService.AuthService.SupabaseSignupWithPassword(signupData.Email, signupData.Password);

                if (response == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status400BadRequest,
                        Message = "Failed to create user account",
                        Success = false
                    };
                }

                // Create user profile in your database if needed
                if (response.User != null)
                {
                    await _omniService.ProfileService.CreateProfile(response.User, signupData.DisplayName);
                }
                var accessToken = response.AccessToken;

                if (!string.IsNullOrEmpty(accessToken))
                {
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Path = "/",
                        Expires = DateTime.UtcNow.AddDays(2)
                    };

                    Response.Cookies.Append("authToken", accessToken, cookieOptions);

                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status201Created,
                        Message = "Account created successfully!",
                        Success = true,
                        Data = new
                        {
                            userId = response.User.Id,
                            workspaceId = 0,
                        }
                    };
                }
                else
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status500InternalServerError,
                        Message = "Failed to generate access token",
                        Success = false
                    };
                }
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error during signup for email: {Email}", request.Email);

                return new ApiResponseModel<object>
                {
                    Message = "An error occurred during signup",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }
        }

        [HttpPost("signout")]
        public async Task<ApiResponseModel<object>> Signout()
        {
            try
            {   
                await _supabaseClient.Auth.SignOut();
                Response.Cookies.Delete("authToken", new CookieOptions
                {
                    Path = "/",                 
                    HttpOnly = true,            
                    Secure = true,              
                    SameSite = SameSiteMode.Strict 
                });
                return new ApiResponseModel<object>
                {
                    Message = "User signed out successfully.",
                    StatusCode = StatusCodes.Status200OK,
                    Success = true

                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    Message = "",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Success = false
                };
            }

        }

        [HttpPost("oauth/callback")]
        public async Task<ApiResponseModel<object>> OAuthCallback([FromBody] OAuthCallbackDto request)
        {
            try
            {
                // Validate tokens from Supabase
                var session = await _supabaseClient.Auth.SetSession(
                    request.AccessToken,
                    request.RefreshToken
                );

                if (session?.User == null)
                {
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status401Unauthorized,
                        Message = "Invalid OAuth session",
                        Success = false
                    };
                }

                var user = session.User;

                // Check if profile exists
                var profileExists = await _omniService.ProfileService.ProfileExists(user.Id);

                if (!profileExists)
                {
                    // First time login - create profile
                    var displayName = user.Email.Split('@')[0];

                    // Try to get name from Google metadata
                    if (user.UserMetadata.ContainsKey("full_name"))
                        displayName = user.UserMetadata["full_name"].ToString();
                    else if (user.UserMetadata.ContainsKey("name"))
                        displayName = user.UserMetadata["name"].ToString();

                    await _omniService.ProfileService.CreateProfile(user, displayName);
                }

                // Get workspace & role
                var workspaceId = await _omniService.ProfileService.GetCurrentWorkspaceId(user.Id);
                int userRole = 0;

                if (!string.IsNullOrEmpty(workspaceId))
                {
                    userRole = await _omniService.WorkspaceService.GetUserWorkspaceInfo(workspaceId, user.Id);
                }

                // Set cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None, // Required for OAuth
                    Path = "/",
                    Expires = DateTime.UtcNow.AddDays(2)
                };
                Response.Cookies.Append("authToken", request.AccessToken, cookieOptions);

                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status200OK,
                    Success = true,
                    Data = new
                    {
                        userId = user.Id,
                        workspaceId = workspaceId ?? "",
                        userRole = userRole,
                        email = user.Email,
                        displayName = user.UserMetadata.ContainsKey("full_name")
                            ? user.UserMetadata["full_name"].ToString()
                            : user.Email.Split('@')[0]
                    }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<object>
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Message = $"OAuth failed: {ex.Message}",
                    Success = false
                };
            }
        }
    }
}
