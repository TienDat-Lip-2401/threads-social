using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<Post?> GetByIdAsync(int id);
        Task CreateAsync(Post post);
        Task UpdateAsync(Post post);
        Task<bool> DeleteByIdAsync(int id); // Xóa tối ưu theo ID
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<User>> GetUsersLikePostByIdAsync(int id);
        Task<List<PostResponseDto>> GetPostsByUserIdAsync(int userId, int viewerId);
        Task<PagedResult<PostResponseDto>> GetFeedAsync(int pageNumber, int pageSize, int viewerId);
        Task<PostResponseDto?> GetPostDtoByIdAsync(int id, int viewerId);
        Task<PagedResult<PostResponseDto>> GetUserPostsAsync(int userId, int pageNumber, int pageSize, int viewerId);
        Task<int> CountByUserAsync(int userId);
        Task<PagedResult<PostResponseDto>> GetUserRepostsAsync(int userId, int pageNumber, int pageSize, int viewerId);
    }
}
