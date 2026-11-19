using Microsoft.EntityFrameworkCore;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class RepostRepository : IRepostRepository
    {
        private readonly AppDbContext _context;
        public RepostRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Repost?> GetAsync(int userId, int postId)
        {
            return await _context.Reposts.FirstOrDefaultAsync(r => r.UserId == userId && r.PostId == postId);
        }

        public async Task AddAsync(Repost repost)
        {
            await _context.Reposts.AddAsync(repost);
        }

        public void Remove(Repost repost)
        {
            _context.Reposts.Remove(repost);
        }

        public async Task<bool> ExistsAsync(int userId, int postId)
        {
            return await _context.Reposts.AnyAsync(r => r.UserId == userId && r.PostId == postId);
        }

        public async Task<int> CountAsync(int postId)
        {
            return await _context.Reposts.CountAsync(r => r.PostId == postId);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
