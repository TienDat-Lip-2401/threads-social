using Microsoft.EntityFrameworkCore;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _context;
        public RefreshTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(RefreshToken refreshToken)
        {
            await _context.RefreshToken.AddAsync(refreshToken);
        }

        public async Task<RefreshToken?> GetByIdAsync(int id)
        {
            return await _context.RefreshToken
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Id == id && !rt.IsRevoked);
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _context.RefreshToken
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.IsRevoked);
        }

        public async Task RevokeAllUserTokensAsync(int userId)
        {
            var activeTokens = await _context.RefreshToken
                .Where(t => t.UserId == userId && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow) .ToListAsync();
            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                
            }
            await _context.SaveChangesAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
