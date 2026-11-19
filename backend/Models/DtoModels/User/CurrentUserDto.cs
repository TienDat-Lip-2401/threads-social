namespace Pharse2.Models.DtoModels.User
{
    // GET auth/user: thông tin user đang đăng nhập
    public class CurrentUserDto : UserResponseDto
    {
        private DateTime? _emailVerifiedAt;
        // Kind=Utc để JSON có hậu tố "Z"
        public DateTime? EmailVerifiedAt
        {
            get => _emailVerifiedAt;
            set => _emailVerifiedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }
    }
}
