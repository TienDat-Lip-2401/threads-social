using Pharse2.Models.EntityModels;

namespace Pharse2.Repositories.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task CreateAsync(RefreshToken refreshToken);
        Task<bool> SaveChangesAsync();
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task<RefreshToken?> GetByIdAsync(int id);
        Task RevokeAllUserTokensAsync(int userId);
    }
}
