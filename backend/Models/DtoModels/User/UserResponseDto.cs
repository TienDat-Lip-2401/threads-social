namespace Pharse2.Models.DtoModels.User
{
    public class UserResponseDto
    {
            public int Id { get; set; }
            public string Username { get; set; } = null!;
            public string Email { get; set; } = null!;
            //public DateTime CreatedAt { get; set; }
            //public DateTime UpdatedAt { get; set; }

            // Nếu muốn hiện số bài viết của User đó
            //public int PostCount { get; set; }
            //public int? CommentCount { get; set; }
        
    }
}
