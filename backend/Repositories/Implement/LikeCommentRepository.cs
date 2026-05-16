using Microsoft.EntityFrameworkCore;
using Pharse2.Models;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class LikeCommentRepository : ILikeCommentRepository
    {
        private readonly AppDbContext _context;
        public LikeCommentRepository(AppDbContext context)
        {
            _context = context;
        }
        //Like comment
        public async Task AddLikeAsync(LikeComment likeComment)
        {
            await _context.LikeComments.AddAsync(likeComment);
        }
        //Unlike comment
        public void RemoveLike(LikeComment likeComment)
        {
            _context.LikeComments.Remove(likeComment);
        }
        //Check User like Coment khong neu khong se tra ve null
        public async Task<LikeComment?> GetLikeComment(int userId, int commentId)
        {
            return await _context.LikeComments
                .FirstOrDefaultAsync(lc => lc.UserId == userId && lc.CommentId == commentId);
        }
        //Get ra so luong like Comment
        public async Task<int> GetLikeCountAsync(int commentId)
        {
            return await _context.LikeComments
                .CountAsync(lc => lc.CommentId ==commentId);
        }
        //Get ra danh sach User da like Comment theo Id
        public async Task<IEnumerable<User>> GetLikersAsync(int commentId)
        {
            return await _context.LikeComments
                .Where(lc => lc.CommentId == commentId)
                .Select(lc => lc.User)
                .ToListAsync();
        }
        //Check User co like Comment khong
        public async Task<bool> IsLikeComment(int userId, int commentId)
        {
            return await _context.LikeComments
                .AnyAsync(lc => lc.UserId == userId && lc.CommentId == commentId);
        }

        //Save du lieu xuong database

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
