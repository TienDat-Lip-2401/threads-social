namespace Pharse2.Models.DtoModels.Auth
{
    // FE: { token, email, password, password_confirmation }
    public class ResetPasswordRequestDto
    {
        public string Token { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string PasswordConfirmation { get; set; } = null!;
    }
}
