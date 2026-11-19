using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.User;

namespace Pharse2.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse> GetUserInfoById(int id);
        Task<ApiResponse> GetMeAsync(int userId);
        Task<ApiResponse> UpdateMeAsync(UpdateProfileRequestDto dto);
        Task<ApiResponse> GetProfileAsync(string username);
        Task<ApiResponse> GetUserPostsAsync(string username, int pageNumber, int pageSize);
        Task<ApiResponse> GetUserRepostsAsync(string username, int pageNumber, int pageSize);
        Task<ApiResponse> GetUserMediaAsync(string username, int pageNumber, int pageSize);
        Task<ApiResponse> GetUserRepliesAsync(string username, int pageNumber, int pageSize);
        Task<ApiResponse> ToggleFollowAsync(string username);
        Task<ApiResponse> SetVerifiedAsync(string username, bool verified);
        Task<ApiResponse> GetFollowersAsync(string username, int pageNumber, int pageSize);
        Task<ApiResponse> GetFollowingAsync(string username, int pageNumber, int pageSize);
    }
}
