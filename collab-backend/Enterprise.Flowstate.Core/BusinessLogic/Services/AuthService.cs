using Enterprise.Flowstate.BAL.Interface.Service;
using Enterprise.Flowstate.DAL.Models;
using FirebaseAdmin.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public class AuthService : IAuthService
    {
        public async void VerifyTokenAsync(AuthVerifyRequest request)
        {
            try
            {
                // Verify Firebase ID token
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.IdToken);
                var firebaseUid = decodedToken.Uid;
                var email = decodedToken.Claims.GetValueOrDefault("email")?.ToString() ?? "";
                var emailVerified = bool.Parse(decodedToken.Claims.GetValueOrDefault("email_verified")?.ToString() ?? "false");

            }
            catch (FirebaseAuthException ex)
            {
                throw new UnauthorizedAccessException("Invalid token");
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
