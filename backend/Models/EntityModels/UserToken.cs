namespace Pharse2.Models.EntityModels
{
    // Token dùng 1 lần gửi qua email (đặt lại mật khẩu, xác thực email).
    // Chỉ lưu hash SHA256, token gốc chỉ nằm trong link email.
    public class UserToken : EntityBaseModel
    {
        public const string ResetPassword = "ResetPassword";
        public const string VerifyEmail = "VerifyEmail";

        public int UserId { get; set; }

        // ResetPassword | VerifyEmail
        public string Type { get; set; } = null!;

        public string TokenHash { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        // Đã dùng (hoặc bị vô hiệu khi có token mới) → không dùng lại được
        public DateTime? UsedAt { get; set; }

        public virtual User User { get; set; } = null!;
    }
}
