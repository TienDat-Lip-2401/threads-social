namespace Pharse2.Models.DtoModels.Comment
{
    public class CommentUpdateRequestDto
    {
        public string Content { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
