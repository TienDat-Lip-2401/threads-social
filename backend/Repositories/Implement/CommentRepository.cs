
using Microsoft.EntityFrameworkCore;
using Pharse2.Models;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;
        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
        }

        public async Task<bool> DeleteByIdAsync(int id)
        {
            int deleted = await _context.Comments
                .Where(c => c.Id == id)
                .ExecuteDeleteAsync();
            return deleted > 0;
        }

        public async Task<IEnumerable<Comment>> GetAllAsync()
        {
            return await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Post)
                .ToListAsync();
        }

        public async Task<Comment?> GetByIdAsync(int id)
        {
            var comment = await _context.Comments
                .Include (c => c.User)
                .Include (c => c.Post)
                .FirstOrDefaultAsync(c => c.Id == id);
            return comment;
        }

        public async Task<IEnumerable<Comment>> GetCommentRepliesById(int id)
        {
            var comments = await _context.Comments
                .Where(c => c.ParentCommentId == id)
                .Include(c => c.User)
                .Include(c => c.Post)
                .ToListAsync();
            return comments;
        }

        public async Task<IEnumerable<LikeComment>> GetLikesCommentById(int id)
        {
            var likes = await _context.LikeComments
                .Where(lc => lc.CommentId == id)
                .Include(lc => lc.User)
                .ToListAsync();
            return likes;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public Task UpdateAsync(Comment comment)
        {
            _context.Comments.Update(comment);
            return Task.CompletedTask;
        }
    }
}
