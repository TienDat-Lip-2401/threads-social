namespace Pharse2.Models.DtoModels.User
{
    // GET auth/user: thông tin user đang đăng nhập
    public class CurrentUserDto : UserResponseDto
    {
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public bool Verified { get; set; }
        // "User" | "Admin" → FE ẩn/hiện chức năng quản trị (sau này)
        public string Role { get; set; } = "User";

        private DateTime? _emailVerifiedAt;
        // Kind=Utc để JSON có hậu tố "Z"
        public DateTime? EmailVerifiedAt
        {
            get => _emailVerifiedAt;
            set => _emailVerifiedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }
    }
}
