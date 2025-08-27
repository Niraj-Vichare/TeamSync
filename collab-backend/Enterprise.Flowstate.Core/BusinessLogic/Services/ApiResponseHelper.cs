using Enterprise.Flowstate.DAL.Models;
using static Enterprise.Flowstate.DAL.Enums.GeneralEnums;

namespace Enterprise.Flowstate.BAL.BusinessLogic.Services
{
    public static class ApiResponseHelper
    {
        public static ApiResponseModel<T> FromErrorStatus<T>(ErrorStatus status, int statusCode, T data = default)
        {
            return new ApiResponseModel<T>
            {
                Success = status == ErrorStatus.SUCCESS,
                StatusCode = statusCode,
                Status = status.ToString(),
                Message = status.GetDescription(),
                Data = data
            };
        }
    }

}
