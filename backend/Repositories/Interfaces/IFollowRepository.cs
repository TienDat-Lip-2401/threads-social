using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.User;
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
        // Modal hồ sơ: người theo dõi / người đang theo dõi, mới nhất trước
        Task<PagedResult<FollowUserDto>> GetFollowersAsync(int userId, int pageNumber, int pageSize, int viewerId);
        Task<PagedResult<FollowUserDto>> GetFollowingAsync(int userId, int pageNumber, int pageSize, int viewerId);
        Task<bool> SaveChangesAsync();
    }
}
