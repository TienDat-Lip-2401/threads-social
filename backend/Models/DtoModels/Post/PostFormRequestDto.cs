using Microsoft.AspNetCore.Mvc;

namespace Pharse2.Models.DtoModels
{
    // Form multipart FE gửi khi tạo bài / comment: content + media[] (+ reply_permission, chưa dùng)
    public class PostFormRequestDto
    {
        public string Content { get; set; } = null!;

        [FromForm(Name = "media[]")]
        public List<IFormFile>? Media { get; set; }

        // Quote: id bài được trích dẫn (không gửi = bài thường)
        [FromForm(Name = "quoted_post_id")]
        public int? QuotedPostId { get; set; }
    }
}
