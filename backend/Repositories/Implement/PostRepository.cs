using Microsoft.EntityFrameworkCore;
using Pharse2.Helper;
using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class PostRepository : IPostRepository
    {
        private readonly AppDbContext _context;
        public PostRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task CreateAsync(Post post)
        {
            await _context.Posts.AddAsync(post);
        }

        // DB cascade xóa luôn comment + Media của bài
        // shortcut: file ảnh trên ổ đĩa chưa bị xóa theo
        public async Task<bool> DeleteByIdAsync(int id)
        {
            int deleted = await _context.Posts
                .Where(p => p.Id == id)
                .ExecuteDeleteAsync();
            return deleted > 0;
        }

        public async Task<Post?> GetByIdAsync(int id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.LikePosts)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public Task UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<User>> GetUsersLikePostByIdAsync(int id)
        {
            var post = await _context.LikePosts
                .Where(lp => lp.PostId == id)
                .Select(p => p.User)
                .ToListAsync();
            return post;
        }

        public async Task<List<PostResponseDto>> GetPostsByUserIdAsync(int userId, int viewerId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId && !p.DeleteFlg)
                .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
                .Select(PostResponseDto.Projection(viewerId))
                .ToListAsync();
        }

        // Feed: bài mới nhất lên đầu
        public async Task<PagedResult<PostResponseDto>> GetFeedAsync(int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Posts
                .Where(p => !p.DeleteFlg)
                .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
                .Select(PostResponseDto.Projection(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        // Trang hồ sơ: bài của 1 user, mới nhất lên đầu
        public async Task<PagedResult<PostResponseDto>> GetUserPostsAsync(int userId, int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId && !p.DeleteFlg)
                .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
                .Select(PostResponseDto.Projection(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        // Tab Reposts: bài user đã repost, repost mới nhất lên đầu (bỏ bài đã xóa)
        public async Task<PagedResult<PostResponseDto>> GetUserRepostsAsync(int userId, int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Reposts
                .Where(r => r.UserId == userId && !r.Post.DeleteFlg)
                .OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.PostId)
                .Select(r => r.Post)
                .Select(PostResponseDto.Projection(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        public async Task<int> CountByUserAsync(int userId)
        {
            return await _context.Posts.CountAsync(p => p.UserId == userId && !p.DeleteFlg);
        }

        public async Task<PostResponseDto?> GetPostDtoByIdAsync(int id, int viewerId)
        {
            return await _context.Posts
                .Where(p => p.Id == id && !p.DeleteFlg)
                .Select(PostResponseDto.Projection(viewerId))
                .FirstOrDefaultAsync();
        }
    }
}
