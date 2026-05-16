using Pharse2.Models;
using Pharse2.Models.CommonModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<IEnumerable<Post>> GetAllAsync();
        Task<Post?> GetByIdAsync(int id);
        Task CreateAsync(Post post);
        Task UpdateAsync(Post post);
        Task<bool> DeleteByIdAsync(int id); // Xóa tối ưu theo ID
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<User>> GetUsersLikePostByIdAsync(int id);
        Task<IEnumerable<Comment>> GetCommentsPostByIdAsync(int id);
        Task<IEnumerable<Post>> GetPostsByUserIdAsync(int userId);
        Task<PagedResult<Post>> GetPagedPostsAsync(int pageNumber, int pageSize);
    }
}
