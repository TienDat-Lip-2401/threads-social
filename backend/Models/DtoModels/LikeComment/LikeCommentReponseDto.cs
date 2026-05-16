namespace Pharse2.Models.DtoModels.LikeComment
{
    public class LikeCommentReponseDto
    {
        public int UserId { get; set; } 
        public string Username { get; set; } = null!;
        public int CommentId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
