namespace Pharse2.Models.DtoModels.Auth
{
    // FE: POST auth/resend-verification-email { email } (không cần đăng nhập)
    public class ResendVerificationEmailRequestDto
    {
        public string Email { get; set; } = null!;
    }
}
