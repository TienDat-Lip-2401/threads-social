using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IRepostRepository
    {
        Task<Repost?> GetAsync(int userId, int postId);
        Task AddAsync(Repost repost);
        void Remove(Repost repost);
        Task<bool> ExistsAsync(int userId, int postId);
        // Số repost + số bài quote (chưa xóa) → reposts_and_quotes_count
        Task<int> CountRepostsAndQuotesAsync(int postId);
        Task<bool> SaveChangesAsync();
    }
}
