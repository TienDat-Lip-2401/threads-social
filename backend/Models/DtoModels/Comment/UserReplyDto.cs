namespace Pharse2.Models.DtoModels.Comment
{
    // Tab Replies trên hồ sơ: comment của user + bài gốc chứa comment đó
    public class UserReplyDto : PostCommentDto
    {
        public PostResponseDto Post { get; set; } = null!;
    }
}
