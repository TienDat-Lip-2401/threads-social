using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;

namespace Pharse2.Services.Interfaces
{
    public interface IPostService
    {
        Task<ApiResponse> GetAllPostsAsync();
        Task<ApiResponse> GetPostByIdAsync(int id);
        Task<ApiResponse> CreatePostAsync(PostRequestDto dto);
        Task<ApiResponse> DeletePostAsync(int id);
        Task<ApiResponse> UpdatePostAsync(int id, PostRequestDto dto);
        Task<ApiResponse> GetUsersLikePostAsync(int id);
        Task<ApiResponse> GetCommentsPostAsync(int id);
        Task<ApiResponse> GetPostsByUserIdAsync(int userId);
        Task<ApiResponse> GetPostAsync(int pageNumber, int pageSize);
    }
}
