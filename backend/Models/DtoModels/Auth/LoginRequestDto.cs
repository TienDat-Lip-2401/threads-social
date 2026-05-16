using System.ComponentModel.DataAnnotations;

namespace Pharse2.Models.DtoModels.Auth
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
