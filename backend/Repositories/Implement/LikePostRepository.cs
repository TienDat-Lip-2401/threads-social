using Microsoft.EntityFrameworkCore;
using Pharse2.Models;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;

namespace Pharse2.Repositories.Implement
{
    public class LikePostRepository : ILikePostRepository
    {
        private readonly AppDbContext _context;
        public LikePostRepository(AppDbContext context)
        {
            _context = context;
        }
        // Thêm like mới
        public async Task AddLikeAsync(LikePost likePost)
        {
            await _context.LikePosts.AddAsync(likePost);
        }
        // Lấy số lượng like của bài viết
        public async Task<int> GetLikeCountAsync(int postId)
        {
            return await _context.LikePosts
                .CountAsync(lp => lp.PostId == postId);
        }
        // Lấy thông tin like của user đối với bài viết nếu chưa like sẽ trả về null
        public async Task<LikePost?> GetLikePost(int userId, int postId)
        {
            return await _context.LikePosts
                .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.PostId == postId);
        }
        //Get ra danh sách người dùng đã like bài viết

        public async Task<IEnumerable<User>> GetLikersAsync(int postId)
        {
            return await _context.LikePosts
                .Where(lp => lp.PostId == postId)
                .Select(lp => lp.User)
                .ToListAsync();
        }
        // Check xem user đã like bài viết chưa
        public async Task<bool> IsLikePost(int userId, int postId)
        {
            return await _context.LikePosts
                .AnyAsync(lp => lp.UserId == userId && lp.PostId == postId);
        }
        // Xóa like của user đối với bài viết

        public void RemoveLike(LikePost likePost)
        {
            _context.LikePosts.Remove(likePost);
        }

        // Lưu thay đổi vào database
        public async Task<bool> SaveChangesAsync()
        {
            Console.WriteLine("Adding like...");
            return await _context.SaveChangesAsync() > 0;
        }  
    }
}
