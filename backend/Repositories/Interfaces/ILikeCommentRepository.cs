using Pharse2.Models;
using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface ILikeCommentRepository
    {
        Task AddLikeAsync(LikeComment likeComment);
        void RemoveLike(LikeComment likeComment);
        Task<LikeComment?> GetLikeComment(int userId, int commentId);
        Task<bool> IsLikeComment(int userId, int commentId);
        Task<int> GetLikeCountAsync(int commentId);
        Task<IEnumerable<User>> GetLikersAsync(int commentId); 
        Task<bool> SaveChangesAsync();
    }
}
