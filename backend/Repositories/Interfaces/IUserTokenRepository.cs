using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IUserTokenRepository
    {
        Task CreateAsync(UserToken token);
        // Token còn hạn, chưa dùng (kèm User)
        Task<UserToken?> GetValidAsync(string tokenHash, string type);
        // Token gần nhất tạo cho user (để chặn gửi email liên tục)
        Task<UserToken?> GetLatestAsync(int userId, string type);
        // Vô hiệu mọi token chưa dùng của user theo loại
        Task InvalidateAllAsync(int userId, string type);
        Task<bool> SaveChangesAsync();
    }
}
