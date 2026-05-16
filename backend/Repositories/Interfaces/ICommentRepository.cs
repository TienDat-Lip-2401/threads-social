using Pharse2.Models;
using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetAllAsync();
        Task<Comment?> GetByIdAsync(int id);
        Task CreateAsync(Comment comment);
        Task UpdateAsync(Comment comment);
        Task<bool> DeleteByIdAsync(int id); // Xóa tối ưu theo ID
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<Comment>> GetCommentRepliesById(int id);
        Task<IEnumerable<LikeComment>> GetLikesCommentById(int id);
    }
}
