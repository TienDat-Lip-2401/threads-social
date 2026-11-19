namespace Pharse2.Models.DtoModels.User
{
    // FE: PUT auth/user (multipart): name, bio, avatar (file, không bắt buộc)
    public class UpdateProfileRequestDto
    {
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}
