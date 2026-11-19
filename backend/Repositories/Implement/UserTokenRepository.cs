using Microsoft.EntityFrameworkCore;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class UserTokenRepository : IUserTokenRepository
    {
        private readonly AppDbContext _context;
        public UserTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(UserToken token)
        {
            await _context.UserTokens.AddAsync(token);
        }

        public async Task<UserToken?> GetValidAsync(string tokenHash, string type)
        {
            return await _context.UserTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.Type == type
                    && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        }

        public async Task<UserToken?> GetLatestAsync(int userId, string type)
        {
            return await _context.UserTokens
                .Where(t => t.UserId == userId && t.Type == type)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task InvalidateAllAsync(int userId, string type)
        {
            var now = DateTime.UtcNow;
            await _context.UserTokens
                .Where(t => t.UserId == userId && t.Type == type && t.UsedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.UsedAt, now).SetProperty(t => t.UpdatedAt, now));
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
