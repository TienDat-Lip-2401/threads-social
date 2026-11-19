namespace Pharse2.Models.DtoModels.User
{
    // GET users/{username}: hồ sơ công khai
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        // Tích xanh (User.IsVerified)
        public bool Verified { get; set; }
        public int PostsCount { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        // Người đang xem có theo dõi hồ sơ này không (khách / chính mình → false)
        public bool IsFollowing { get; set; }
        // Avatar 3 người theo dõi gần nhất (thay cho ảnh mẫu trên FE)
        public List<PostUserDto> FollowersPreview { get; set; } = new();
        // Hồ sơ của chính user đang xem → FE hiện nút sửa hồ sơ
        public bool IsMe { get; set; }
    }
}
