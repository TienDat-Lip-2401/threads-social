using Pharse2.Models.EntityModels;


namespace Pharse2.Models;

public partial class Post : EntityBaseModel
{


    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    // Quote: bài này trích dẫn bài nào (null = bài thường)
    public int? QuotedPostId { get; set; }

    public virtual Post? QuotedPost { get; set; }

    // Các bài quote lại bài này
    public virtual ICollection<Post> Quotes { get; set; } = new List<Post>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<LikePost> LikePosts { get; set; } = new List<LikePost>();

    public virtual ICollection<Repost> Reposts { get; set; } = new List<Repost>();

    // Gồm cả ảnh của comment trong bài (lọc theo CommentId == null để lấy ảnh của bài)
    public virtual ICollection<Media> Media { get; set; } = new List<Media>();

    public virtual User User { get; set; } = null!;
}
