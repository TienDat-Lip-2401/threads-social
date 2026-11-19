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
        // shortcut: chưa có tích xanh, luôn false
        public bool Verified { get; set; }
        public int PostsCount { get; set; }
        // Hồ sơ của chính user đang xem → FE hiện nút sửa hồ sơ
        public bool IsMe { get; set; }
    }
}
