namespace Pharse2.Models.DtoModels.Comment
{
    public class CommentRequestDto
    {
        //public int UserId { get; set; }
        public int PostId { get; set; }
        public int? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
    }
}
