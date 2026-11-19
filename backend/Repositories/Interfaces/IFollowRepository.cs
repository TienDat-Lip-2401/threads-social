using Pharse2.Models.DtoModels;
using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IFollowRepository
    {
        Task<Follow?> GetAsync(int followerId, int followeeId);
        Task AddAsync(Follow follow);
        void Remove(Follow follow);
        Task<bool> ExistsAsync(int followerId, int followeeId);
        // Chỉ đếm user chưa bị khóa (DeleteFlg)
        Task<int> CountFollowersAsync(int userId);
        Task<int> CountFollowingAsync(int userId);
        // Avatar vài người theo dõi gần nhất (hiện trên hồ sơ)
        Task<List<PostUserDto>> GetFollowersPreviewAsync(int userId, int take);
        Task<bool> SaveChangesAsync();
    }
}
