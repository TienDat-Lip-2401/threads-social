using Pharse2.Models.CommonModels;

namespace Pharse2.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse> GetUserInfoById(int id);
        Task<ApiResponse> GetMeAsync(int userId);
    }
}
