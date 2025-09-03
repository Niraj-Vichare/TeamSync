using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using FirebaseAdmin.Auth;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class AuthService : IAuthService
    {
        private readonly Supabase.Client _supabaseClient;
        public AuthService(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<Session?> SupabaseSiginWithPassword(string email, string password)
        {
            try
            {
                
                // Authenticate user with Supabase
                var response = await _supabaseClient.Auth.SignInWithPassword(email, password);
                if (response?.User != null)
                {
                    // User authenticated successfully
                    return response;
                }
                return null;
            }
            catch (Exception ex)
            {
                // Handle authentication errors
                throw new UnauthorizedAccessException("Authentication failed", ex);
            }
        }

        public async Task<Session?> SupabaseSignupWithPassword(string email,string password)
        {
            try
            {
                var response = await _supabaseClient.Auth.SignUp(email, password);
                if(response?.User != null)
                {
                    return response;
                }
                return null;
            }catch(Exception ex)
            {
                throw new UnauthorizedAccessException("Authentication failed", ex);
            }
        }

        public bool ValidateSigninData(string email,string password)
        {
            // Assuming your SiteuserModel has properties: Email, Password, PhoneNumber
            if (!ValidateEmail(email))
            {
                return false;
            }

            if (!ValidatePassword(password))
            {
                Console.WriteLine("Invalid Password");
                return false;
            }

            // Additional validation rules can be added here if required
            return true;
        }
        public bool ValidateSignupData(SignupDto signupData)
        {

           
            if (!ValidateEmail(signupData.Email))
            {
                Console.WriteLine("Invalid Email");
                return false;
            }

            if (!ValidatePassword(signupData.Password))
            {
                Console.WriteLine("Invalid Password");
                return false;
            }
            // Additional validation rules can be added here if required
            return true;
        }

        public bool IsUserExist(string email)
        {
            return false;
        }
        #region Private Region
        private bool ValidateEmail(string email)
        {
            if (String.IsNullOrEmpty(email))
            {
                return false;
            }
            // Regular expression for basic email validation
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            return Regex.IsMatch(email, emailPattern);
        }

        private bool ValidatePassword(string password)
        {
            if (String.IsNullOrEmpty(password))
            {
                return false;
            }

            // Password should have a minimum of 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
            string passwordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$";
            return Regex.IsMatch(password, passwordPattern);
        }

        #endregion
    }
}
