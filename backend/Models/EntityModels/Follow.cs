namespace Pharse2.Models.EntityModels;

// FollowerId theo dõi FolloweeId. Mỗi cặp chỉ 1 dòng (khóa chính FollowerId + FolloweeId).
public class Follow
{
    public int FollowerId { get; set; }

    public int FolloweeId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User Follower { get; set; } = null!;

    public virtual User Followee { get; set; } = null!;
}
