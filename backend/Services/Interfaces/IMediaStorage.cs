namespace Pharse2.Services.Interfaces
{
    // Lưu/xóa file ảnh upload và đổi đường dẫn lưu trong DB thành URL cho FE
    public interface IMediaStorage
    {
        // null nếu hợp lệ; ngược lại trả lỗi dạng { "media": [..] } để trả 422
        Dictionary<string, string[]>? Validate(IReadOnlyList<IFormFile>? files);

        // Lưu file, trả đường dẫn tương đối (/uploads/...) theo đúng thứ tự file gửi lên
        Task<List<string>> SaveAsync(IReadOnlyList<IFormFile> files);

        // Xóa file đã lưu (dùng khi lưu DB thất bại)
        void Delete(IEnumerable<string> paths);

        // /uploads/a.jpg → http://host/uploads/a.jpg
        List<string> ToPublicUrls(IEnumerable<string> paths);
    }
}
