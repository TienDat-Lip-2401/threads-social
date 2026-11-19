namespace Pharse2.Models.EntityModels;

// User đăng lại (repost) 1 bài. Mỗi user chỉ repost 1 bài 1 lần (khóa chính PostId + UserId).
public class Repost
{
    public int PostId { get; set; }

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
