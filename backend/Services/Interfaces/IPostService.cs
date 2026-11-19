using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;

namespace Pharse2.Services.Interfaces
{
    public interface IPostService
    {
        Task<ApiResponse> GetPostByIdAsync(int id);
        Task<ApiResponse> CreatePostAsync(PostRequestDto dto);
        Task<ApiResponse> DeletePostAsync(int id);
        Task<ApiResponse> UpdatePostAsync(int id, PostRequestDto dto);
        Task<ApiResponse> GetUsersLikePostAsync(int id);
        Task<ApiResponse> GetPostsByUserIdAsync(int userId);
        Task<ApiResponse> GetFeedAsync(int pageNumber, int pageSize);
    }
}
