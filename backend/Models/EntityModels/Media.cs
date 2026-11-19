using Pharse2.Models.EntityModels;

namespace Pharse2.Models;

// Ảnh đính kèm bài viết hoặc comment.
// PostId luôn có (ảnh của comment cũng ghi PostId của bài) để xóa bài thì DB tự xóa ảnh theo.
// CommentId = null → ảnh của bài; có giá trị → ảnh của comment đó.
public class Media : EntityBaseModel
{
    public int PostId { get; set; }

    public int? CommentId { get; set; }

    // Đường dẫn tương đối trong wwwroot, vd: /uploads/2026/11/{guid}.jpg
    public string Path { get; set; } = null!;

    // Thứ tự ảnh khi hiển thị (0, 1, 2...)
    public int SortOrder { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual Comment? Comment { get; set; }
}
