namespace Pharse2.Models.DtoModels
{
    public class PostResponseDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        // Dữ liệu mở rộng lấy từ các bảng khác
        public int UserId { get; set; }
        public string AuthorName { get; set; } = null!; // Tên người viết
        public int CommentCount { get; set; }           // Tổng số bình luận
        public int LikeCount { get; set; }
    }
}
