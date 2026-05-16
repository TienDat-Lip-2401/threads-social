namespace Pharse2.Models.DtoModels.Comment
{
    public class CommentResponseDto
    {
        public int Id { get; set; } 
        public int UserId { get; set; }
        public int PostId { get; set; }
        public string Username { get; set; }
        public string Content { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } 
        public bool IsDeleted { get; set; }
        //
        public int LikeCount { get; set; }
        public int? ParentCommentId { get; set; }
    }
}
