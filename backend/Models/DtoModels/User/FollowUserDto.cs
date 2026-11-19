namespace Pharse2.Models.DtoModels.User
{
    // 1 dòng trong modal Người theo dõi / Đang theo dõi
    public class FollowUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
        public bool Verified { get; set; }
        // Người đang xem có theo dõi user này không (khách → false)
        public bool IsFollowing { get; set; }
        // Chính là người đang xem → FE không hiện nút theo dõi
        public bool IsMe { get; set; }
    }
}
