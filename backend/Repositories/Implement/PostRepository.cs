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

        // Xóa mềm (DeleteFlg = true): bài biến mất ở mọi nơi vì các truy vấn đều lọc !DeleteFlg,
        // nhưng bài quote vẫn biết mình trích dẫn bài nào (hiện "Bài viết không còn tồn tại").
        // shortcut: comment/like/repost/ảnh của bài đã xóa vẫn nằm trong DB (bị ẩn)
        public async Task<bool> DeleteByIdAsync(int id)
        {
            var now = DateTime.UtcNow;
            int deleted = await _context.Posts
                .Where(p => p.Id == id && !p.DeleteFlg)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.DeleteFlg, true).SetProperty(p => p.UpdatedAt, now));
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
        // Feed: mỗi bài 1 lần, xếp theo mốc hoạt động mới nhất = max(lúc đăng, lần repost gần nhất).
        // Repost làm bài "nổi lên" kèm người repost gần nhất (RepostedBy).
        // shortcut: feed chung của mọi người; khi có follow (#6) chỉ tính repost của người mình theo dõi
        public async Task<PagedResult<PostResponseDto>> GetFeedAsync(int pageNumber, int pageSize, int viewerId)
        {
            // B1: thứ tự + phân trang (chỉ lấy id và mốc thời gian)
            var rows = await _context.Posts
                .Where(p => !p.DeleteFlg)
                .Select(p => new { p.Id, p.CreatedAt, LastRepostAt = p.Reposts.Max(r => (DateTime?)r.CreatedAt) })
                .Select(x => new
                {
                    x.Id,
                    IsBumped = x.LastRepostAt != null && x.LastRepostAt > x.CreatedAt,
                    SortAt = x.LastRepostAt != null && x.LastRepostAt > x.CreatedAt ? x.LastRepostAt.Value : x.CreatedAt,
                })
                .OrderByDescending(x => x.SortAt).ThenByDescending(x => x.Id)
                .ToPageResultAsync(pageNumber, pageSize);

            // B2: dữ liệu đầy đủ của các bài trong trang
            var posts = (await GetPostDtosByIdsAsync(rows.Items.Select(r => r.Id), viewerId)).ToDictionary(p => p.Id);

            // B3: người repost gần nhất của các bài được repost "đẩy lên"
            // shortcut: lấy mọi repost của các bài này rồi chọn mới nhất trong bộ nhớ (ổn khi mỗi bài ít repost)
            var bumpedIds = rows.Items.Where(r => r.IsBumped).Select(r => r.Id).ToList();
            var latestReposts = (await _context.Reposts
                    .Where(r => bumpedIds.Contains(r.PostId))
                    .Select(r => new
                    {
                        r.PostId,
                        r.CreatedAt,
                        User = new PostUserDto { Id = r.User.Id, Username = r.User.Username, Name = r.User.Name, AvatarUrl = r.User.AvatarPath },
                    })
                    .ToListAsync())
                .GroupBy(r => r.PostId)
                .ToDictionary(g => g.Key, g => g.MaxBy(r => r.CreatedAt)!);

            var items = rows.Items
                .Where(r => posts.ContainsKey(r.Id)) // bài vừa bị xóa giữa các query → bỏ
                .Select(r =>
                {
                    var dto = posts[r.Id];
                    if (latestReposts.TryGetValue(r.Id, out var repost))
                    {
                        dto.RepostedBy = repost.User;
                        dto.RepostedAt = repost.CreatedAt;
                    }
                    return dto;
                }).ToList();
            return new PagedResult<PostResponseDto>(items, rows.TotalItems, rows.CurrentPage, rows.PageSize);
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

        // Tab Media: bài của user có ít nhất 1 ảnh của bài (không tính ảnh trong comment)
        public async Task<PagedResult<PostResponseDto>> GetUserMediaPostsAsync(int userId, int pageNumber, int pageSize, int viewerId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId && !p.DeleteFlg && p.Media.Any(m => m.CommentId == null && !m.DeleteFlg))
                .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
                .Select(PostResponseDto.Projection(viewerId))
                .ToPageResultAsync(pageNumber, pageSize);
        }

        // Lấy nhiều bài 1 lần (tab Replies: bài gốc của các comment trong trang)
        public async Task<List<PostResponseDto>> GetPostDtosByIdsAsync(IEnumerable<int> ids, int viewerId)
        {
            var idList = ids.Distinct().ToList();
            return await _context.Posts
                .Where(p => idList.Contains(p.Id) && !p.DeleteFlg)
                .Select(PostResponseDto.Projection(viewerId))
                .ToListAsync();
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
