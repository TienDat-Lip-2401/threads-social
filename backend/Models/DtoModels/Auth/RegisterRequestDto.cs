using System.ComponentModel.DataAnnotations;

namespace Pharse2.Models.DtoModels.Auth
{
    public class RegisterRequestDto
    {
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string PasswordConfirmation { get; set; } = null!;
    }
}
