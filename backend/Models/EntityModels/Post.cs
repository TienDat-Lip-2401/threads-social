using Pharse2.Models.EntityModels;


namespace Pharse2.Models;

public partial class Post : EntityBaseModel
{


    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<LikePost> LikePosts { get; set; } = new List<LikePost>();

    public virtual User User { get; set; } = null!;
}
