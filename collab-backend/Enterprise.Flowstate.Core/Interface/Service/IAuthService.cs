using Enterprise.Flowstate.DAL.DTOs;
using Enterprise.Flowstate.DAL.Models;
using Supabase.Gotrue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.Interface.Service
{
    public interface IAuthService
    {
        bool ValidateSigninData(string email, string password);
        bool ValidateSignupData(SignupDto signupData);
        bool IsUserExist(string email);
        Task<Session?> SupabaseSignupWithPassword(string email, string password);
        Task<Session?> SupabaseSiginWithPassword(string email, string password);

    }
}
