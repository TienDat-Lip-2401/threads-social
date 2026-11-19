using System.Linq.Expressions;

namespace Pharse2.Models.DtoModels
{
    // Dạng bài viết FE đọc (snake_case): id, content, created_at, user{...}, media_urls,
    // likes_count, replies_count, reposts_and_quotes_count
    public class PostResponseDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;

        // Post.CreatedAt được lưu bằng UtcNow; đánh dấu Kind=Utc để JSON có hậu tố "Z"
        // và FE (dayjs) không hiểu nhầm thành giờ địa phương.
        private DateTime _createdAt;
        public DateTime CreatedAt { get => _createdAt; set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); }
        private DateTime _updatedAt;
        public DateTime UpdatedAt { get => _updatedAt; set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); }

        public PostUserDto User { get; set; } = null!;
        // Projection lấy đường dẫn tương đối; service đổi thành URL đầy đủ (IMediaStorage.ToPublicUrls)
        public List<string> MediaUrls { get; set; } = new();
        public int LikesCount { get; set; }
        // User đang xem đã like bài này chưa (khách → luôn false)
        public bool IsLiked { get; set; }
        // Số trả lời trực tiếp vào bài (comment cấp 1)
        public int RepliesCount { get; set; }
        // Số repost + số bài quote (chưa xóa) trỏ tới bài này
        public int RepostsAndQuotesCount { get; set; }
        // User đang xem đã repost bài này chưa (khách → luôn false)
        public bool IsReposted { get; set; }

        // Quote: id bài được trích dẫn. Có id nhưng QuotedPost = null → bài gốc đã bị xóa
        public int? QuotedPostId { get; set; }
        // Bài được trích dẫn (chỉ 1 tầng, không lồng tiếp)
        public QuotedPostDto? QuotedPost { get; set; }

        // Chỉ có ở feed: người repost gần nhất, khi lần repost đó mới hơn lúc đăng bài
        // (FE hiện "X đã đăng lại"). Các danh sách khác luôn null.
        public PostUserDto? RepostedBy { get; set; }
        private DateTime? _repostedAt;
        public DateTime? RepostedAt { get => _repostedAt; set => _repostedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null; }

        // Dùng trong .Select(...) để EF đếm bằng SQL (COUNT) thay vì tải hết Comments/LikePosts.
        // viewerId: user đang xem (0 = khách) để tính is_liked / is_reposted.
        public static Expression<Func<Post, PostResponseDto>> Projection(int viewerId) => p => new PostResponseDto
        {
            Id = p.Id,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            User = new PostUserDto { Id = p.User.Id, Username = p.User.Username, Name = p.User.Name, AvatarUrl = p.User.AvatarPath },
            MediaUrls = p.Media.Where(m => m.CommentId == null && !m.DeleteFlg)
                .OrderBy(m => m.SortOrder).Select(m => m.Path).ToList(),
            LikesCount = p.LikePosts.Count(),
            IsLiked = p.LikePosts.Any(l => l.UserId == viewerId),
            RepliesCount = p.Comments.Count(c => c.ParentCommentId == null && !c.DeleteFlg),
            RepostsAndQuotesCount = p.Reposts.Count() + p.Quotes.Count(q => !q.DeleteFlg),
            IsReposted = p.Reposts.Any(r => r.UserId == viewerId),
            QuotedPostId = p.QuotedPostId,
            QuotedPost = p.QuotedPost != null && !p.QuotedPost.DeleteFlg
                ? new QuotedPostDto
                {
                    Id = p.QuotedPost.Id,
                    Content = p.QuotedPost.Content,
                    CreatedAt = p.QuotedPost.CreatedAt,
                    User = new PostUserDto { Id = p.QuotedPost.User.Id, Username = p.QuotedPost.User.Username, Name = p.QuotedPost.User.Name, AvatarUrl = p.QuotedPost.User.AvatarPath },
                    MediaUrls = p.QuotedPost.Media.Where(m => m.CommentId == null && !m.DeleteFlg)
                        .OrderBy(m => m.SortOrder).Select(m => m.Path).ToList(),
                    LikesCount = p.QuotedPost.LikePosts.Count(),
                    RepliesCount = p.QuotedPost.Comments.Count(c => c.ParentCommentId == null && !c.DeleteFlg),
                    RepostsAndQuotesCount = p.QuotedPost.Reposts.Count() + p.QuotedPost.Quotes.Count(q => !q.DeleteFlg),
                    IsQuote = p.QuotedPost.QuotedPostId != null,
                }
                : null,
        };
    }

    // Thẻ nhúng của bài quote: nội dung + số liệu (chỉ xem) của bài gốc
    public class QuotedPostDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        private DateTime _createdAt;
        public DateTime CreatedAt { get => _createdAt; set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); }
        public PostUserDto User { get; set; } = null!;
        public List<string> MediaUrls { get; set; } = new();
        public int LikesCount { get; set; }
        public int RepliesCount { get; set; }
        public int RepostsAndQuotesCount { get; set; }
        // Bài gốc này lại là 1 quote → FE chỉ ghi chú, không lồng tiếp
        public bool IsQuote { get; set; }
    }

    public class PostUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Name { get; set; }
        // Projection lấy đường dẫn tương đối; service đổi thành URL đầy đủ (null → FE dùng avatar mặc định)
        public string? AvatarUrl { get; set; }
        // shortcut: chưa có tích xanh, luôn false
        public bool Verified { get; set; }
    }
}
