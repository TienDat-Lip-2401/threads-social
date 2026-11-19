using System.Linq.Expressions;

namespace Pharse2.Models.DtoModels.Comment
{
    // Dạng comment FE đọc (ReplyItem): id, parent_id, content, created_at, user{...}, media_urls
    public class PostCommentDto
    {
        public int Id { get; set; }
        // FE gọi là parent_id: id bài viết chứa comment (dùng để tăng replies_count)
        public int ParentId { get; set; }
        public string Content { get; set; } = null!;

        // Lưu bằng UtcNow; Kind=Utc để JSON có hậu tố "Z"
        private DateTime _createdAt;
        public DateTime CreatedAt { get => _createdAt; set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); }
        private DateTime _updatedAt;
        public DateTime UpdatedAt { get => _updatedAt; set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc); }

        public PostUserDto User { get; set; } = null!;
        // Projection lấy đường dẫn tương đối; service đổi thành URL đầy đủ (IMediaStorage.ToPublicUrls)
        public List<string> MediaUrls { get; set; } = new();
        public int LikesCount { get; set; }
        // Số comment con trả lời comment này
        public int RepliesCount { get; set; }

        public static readonly Expression<Func<Pharse2.Models.Comment, PostCommentDto>> Projection = c => new PostCommentDto
        {
            Id = c.Id,
            ParentId = c.PostId,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            User = new PostUserDto { Id = c.User.Id, Username = c.User.Username, Name = c.User.Name, AvatarUrl = c.User.AvatarPath, Verified = c.User.IsVerified },
            MediaUrls = c.Media.Where(m => !m.DeleteFlg).OrderBy(m => m.SortOrder).Select(m => m.Path).ToList(),
            LikesCount = c.LikeComments.Count(),
            RepliesCount = c.InverseParentComment.Count(r => !r.DeleteFlg),
        };
    }
}
