using System.ComponentModel.DataAnnotations;

namespace Pharse2.Models.DtoModels.Auth
{
    public class LoginRequestDto
    {
        // Username hoặc email
        public string Login { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
