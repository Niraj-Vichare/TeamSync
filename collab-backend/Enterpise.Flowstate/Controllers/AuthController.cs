using Enterprise.Flowstate.BAL.BusinessLogic.Services;
using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

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

                loginData.Password = EncryptionService.EncryptData(loginData.Password);
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
                        HttpOnly = false,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Path = "/",
                        Expires = DateTime.UtcNow.AddDays(2)
                    };

                    // Append the JWT token to the cookies
                    Response.Cookies.Append("authToken", accessToken, cookieOptions);

                    // Return success response with workspace ID
                    return new ApiResponseModel<object>
                    {
                        StatusCode = StatusCodes.Status200OK,
                        Message = "Signin successful",
                        Success = true,
                        Data = new
                        {
                            workspaceId = currentWorkspaceId,
                            userId = response.User.Id,
                            userRole = userRole
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
                var encryptedPassword = EncryptionService.EncryptData(signupData.Password);
                // Create user with Supabase
                var response = await _omniService.AuthService.SupabaseSignupWithPassword(signupData.Email, encryptedPassword);

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
                        HttpOnly = false,
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

        [HttpPost("oauth-signin")]
        public async Task<ApiResponseModel<object>> OAuthSignin()
        {
            await _supabaseClient.Auth.SignIn(Supabase.Gotrue.Constants.Provider.Google);
            return new ApiResponseModel<object>
            {
                Message = "",
                StatusCode = StatusCodes.Status200OK,
                Success = true
            };
        }
    }
}
