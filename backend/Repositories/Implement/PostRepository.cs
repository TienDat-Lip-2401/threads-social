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
        // 1 dòng thứ tự feed: bài nào, mốc sắp xếp, có phải được repost "đẩy lên" không
        private class FeedRow
        {
            public int Id { get; set; }
            public bool IsBumped { get; set; }
            public DateTime SortAt { get; set; }
        }

        // Feed "Dành cho bạn": mọi bài, mỗi bài 1 lần, xếp theo mốc hoạt động mới nhất = max(lúc đăng, lần repost gần nhất).
        // Repost làm bài "nổi lên" kèm người repost gần nhất (RepostedBy).
        public async Task<PagedResult<PostResponseDto>> GetFeedAsync(int pageNumber, int pageSize, int viewerId)
        {
            var rows = _context.Posts
                .Where(p => !p.DeleteFlg)
                .Select(p => new { p.Id, p.CreatedAt, LastRepostAt = p.Reposts.Max(r => (DateTime?)r.CreatedAt) })
                .Select(x => new FeedRow
                {
                    Id = x.Id,
                    IsBumped = x.LastRepostAt != null && x.LastRepostAt > x.CreatedAt,
                    SortAt = x.LastRepostAt != null && x.LastRepostAt > x.CreatedAt ? x.LastRepostAt.Value : x.CreatedAt,
                });
            return await GetFeedPageAsync(rows, r => true, pageNumber, pageSize, viewerId);
        }

        // Feed "Đang theo dõi": S = người mình theo dõi + chính mình.
        // Lấy bài của S, hoặc bài (của bất kỳ ai) được người trong S repost.
        // Mốc sắp xếp chỉ tính lúc đăng (nếu tác giả thuộc S) và repost của người trong S → người lạ repost không đẩy bài lên.
        public async Task<PagedResult<PostResponseDto>> GetFollowingFeedAsync(int pageNumber, int pageSize, int viewerId)
        {
            var followeeIds = _context.Follows.Where(f => f.FollowerId == viewerId).Select(f => f.FolloweeId);
            var rows = _context.Posts
                .Where(p => !p.DeleteFlg)
                .Select(p => new
                {
                    p.Id,
                    OwnAt = p.UserId == viewerId || followeeIds.Contains(p.UserId) ? (DateTime?)p.CreatedAt : null,
                    LastRepostAt = p.Reposts
                        .Where(r => r.UserId == viewerId || followeeIds.Contains(r.UserId))
                        .Max(r => (DateTime?)r.CreatedAt),
                })
                .Where(x => x.OwnAt != null || x.LastRepostAt != null)
                .Select(x => new FeedRow
                {
                    Id = x.Id,
                    IsBumped = x.LastRepostAt != null && (x.OwnAt == null || x.LastRepostAt > x.OwnAt),
                    SortAt = x.LastRepostAt != null && (x.OwnAt == null || x.LastRepostAt > x.OwnAt) ? x.LastRepostAt.Value : x.OwnAt!.Value,
                });
            return await GetFeedPageAsync(rows, r => r.UserId == viewerId || followeeIds.Contains(r.UserId), pageNumber, pageSize, viewerId);
        }

        // Dùng chung 2 feed: phân trang theo thứ tự rows, lấy dữ liệu bài, gắn người repost gần nhất (lọc theo repostFilter)
        private async Task<PagedResult<PostResponseDto>> GetFeedPageAsync(IQueryable<FeedRow> rows,
            System.Linq.Expressions.Expression<Func<Repost, bool>> repostFilter, int pageNumber, int pageSize, int viewerId)
        {
            // B1: thứ tự + phân trang (chỉ lấy id và mốc thời gian)
            var page = await rows
                .OrderByDescending(x => x.SortAt).ThenByDescending(x => x.Id)
                .ToPageResultAsync(pageNumber, pageSize);

            // B2: dữ liệu đầy đủ của các bài trong trang
            var posts = (await GetPostDtosByIdsAsync(page.Items.Select(r => r.Id), viewerId)).ToDictionary(p => p.Id);

            // B3: người repost gần nhất của các bài được repost "đẩy lên"
            // shortcut: lấy mọi repost của các bài này rồi chọn mới nhất trong bộ nhớ (ổn khi mỗi bài ít repost)
            var bumpedIds = page.Items.Where(r => r.IsBumped).Select(r => r.Id).ToList();
            var latestReposts = (await _context.Reposts
                    .Where(repostFilter)
                    .Where(r => bumpedIds.Contains(r.PostId))
                    .Select(r => new
                    {
                        r.PostId,
                        r.CreatedAt,
                        User = new PostUserDto { Id = r.User.Id, Username = r.User.Username, Name = r.User.Name, AvatarUrl = r.User.AvatarPath, Verified = r.User.IsVerified },
                    })
                    .ToListAsync())
                .GroupBy(r => r.PostId)
                .ToDictionary(g => g.Key, g => g.MaxBy(r => r.CreatedAt)!);

            var items = page.Items
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
            return new PagedResult<PostResponseDto>(items, page.TotalItems, page.CurrentPage, page.PageSize);
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
