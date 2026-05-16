using Pharse2.Models;
using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface ILikePostRepository
    {
        Task AddLikeAsync(LikePost likePost);
        void RemoveLike(LikePost likePost);
        Task<int> GetLikeCountAsync(int postId);
        Task<IEnumerable<User>> GetLikersAsync(int postId);
        Task<bool> SaveChangesAsync();
        Task<LikePost?> GetLikePost(int userId, int postId);
        Task<bool> IsLikePost(int userId, int postId);
    }
}
