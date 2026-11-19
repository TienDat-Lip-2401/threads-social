
using Microsoft.EntityFrameworkCore;
using Pharse2.Helper;
using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.Comment;
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
            // FK Media→Comment là NoAction nên xóa ảnh của comment trước, chung 1 transaction
            // shortcut: file ảnh trên ổ đĩa chưa bị xóa theo
            await using var transaction = await _context.Database.BeginTransactionAsync();
            await _context.Media.Where(m => m.CommentId == id).ExecuteDeleteAsync();
            int deleted = await _context.Comments
                .Where(c => c.Id == id)
                .ExecuteDeleteAsync();
            await transaction.CommitAsync();
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

        // Comment cấp 1 của bài viết, cũ nhất lên trước (đọc như cuộc hội thoại)
        public async Task<PagedResult<PostCommentDto>> GetPostCommentsAsync(int postId, int pageNumber, int pageSize)
        {
            return await _context.Comments
                .Where(c => c.PostId == postId && c.ParentCommentId == null && !c.DeleteFlg)
                .OrderBy(c => c.CreatedAt).ThenBy(c => c.Id)
                .Select(PostCommentDto.Projection)
                .ToPageResultAsync(pageNumber, pageSize);
        }

        public async Task<PostCommentDto?> GetCommentDtoByIdAsync(int id)
        {
            return await _context.Comments
                .Where(c => c.Id == id && !c.DeleteFlg)
                .Select(PostCommentDto.Projection)
                .FirstOrDefaultAsync();
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
