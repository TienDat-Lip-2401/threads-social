namespace Pharse2.Models.DtoModels.Auth
{
    // FE: POST auth/verify-email { token }
    public class VerifyEmailRequestDto
    {
        public string Token { get; set; } = null!;
    }
}
