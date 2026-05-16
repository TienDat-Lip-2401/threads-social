using Microsoft.EntityFrameworkCore;
using Pharse2.Helper;
using Pharse2.Models;
using Pharse2.Models.CommonModels;
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

        public async Task<bool> DeleteByIdAsync(int id)
        {
            int deleted = await _context.Posts
                .Where(p => p.Id == id)
                .ExecuteDeleteAsync();
            return deleted > 0;
        }

        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.LikePosts)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();
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

        public async Task<IEnumerable<Comment>> GetCommentsPostByIdAsync(int id)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == id)
                .ToListAsync();
            return comments;
        }

        public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(int userId)
        {
            var posts = await _context.Posts
                .Where(p => p.UserId == userId)
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.LikePosts)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return posts;
        }

        public async Task<PagedResult<Post>> GetPagedPostsAsync(int pageNumber, int pageSize)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.DeleteFlg == false)
                .OrderBy(p => p.Id)
                .ToPageResultAsync(pageNumber, pageSize);

        }
    }
}
