using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    // Lưu ảnh vào wwwroot/uploads/{năm}/{tháng}/{guid}.ext (Docker: thư mục này là volume)
    // shortcut: chưa hỗ trợ video, chưa nén/resize ảnh
    public class LocalMediaStorage : IMediaStorage
    {
        public const int MaxFiles = 10;
        public const long MaxFileBytes = 5 * 1024 * 1024; // 5MB
        public const long MaxRequestBytes = 60 * 1024 * 1024; // đủ cho 10 ảnh x 5MB + nội dung

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
        };

        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public LocalMediaStorage(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public Dictionary<string, string[]>? Validate(IReadOnlyList<IFormFile>? files)
        {
            if (files == null || files.Count == 0) return null;

            var errors = new List<string>();
            if (files.Count > MaxFiles)
            {
                errors.Add($"Tối đa {MaxFiles} ảnh.");
            }
            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName);
                if (!AllowedExtensions.Contains(ext) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"'{file.FileName}' không phải ảnh hợp lệ (chỉ nhận jpg, png, gif, webp).");
                }
                else if (file.Length == 0)
                {
                    errors.Add($"'{file.FileName}' bị rỗng.");
                }
                else if (file.Length > MaxFileBytes)
                {
                    errors.Add($"'{file.FileName}' vượt quá {MaxFileBytes / 1024 / 1024}MB.");
                }
            }
            return errors.Count == 0 ? null : new Dictionary<string, string[]> { ["media"] = errors.ToArray() };
        }

        public async Task<List<string>> SaveAsync(IReadOnlyList<IFormFile> files)
        {
            var now = DateTime.UtcNow;
            var relativeDir = $"uploads/{now:yyyy}/{now:MM}";
            var absoluteDir = Path.Combine(WebRoot, relativeDir);
            Directory.CreateDirectory(absoluteDir);

            var saved = new List<string>();
            try
            {
                foreach (var file in files)
                {
                    // Tên file mới bằng GUID: không trùng, không giữ tên/đuôi lạ từ người dùng
                    var fileName = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
                    await using (var stream = File.Create(Path.Combine(absoluteDir, fileName)))
                    {
                        await file.CopyToAsync(stream);
                    }
                    saved.Add($"/{relativeDir}/{fileName}");
                }
            }
            catch
            {
                Delete(saved); // lỗi giữa chừng → không để lại file rác
                throw;
            }
            return saved;
        }

        public void Delete(IEnumerable<string> paths)
        {
            var uploadsRoot = Path.GetFullPath(Path.Combine(WebRoot, "uploads")) + Path.DirectorySeparatorChar;
            foreach (var path in paths)
            {
                var fullPath = Path.GetFullPath(Path.Combine(WebRoot, path.TrimStart('/')));
                // Chỉ xóa file nằm trong wwwroot/uploads
                if (fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase) && File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
        }

        public string? ToPublicUrl(string? path) =>
            string.IsNullOrEmpty(path) ? null : ToPublicUrls(new[] { path })[0];

        public List<string> ToPublicUrls(IEnumerable<string> paths)
        {
            // FE chạy khác origin (vd. localhost:5173) nên cần URL đầy đủ.
            // Ưu tiên cấu hình Media:PublicBaseUrl (khi đứng sau proxy/CDN), không có thì lấy theo request hiện tại.
            var baseUrl = _configuration["Media:PublicBaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                var request = _httpContextAccessor.HttpContext?.Request;
                baseUrl = request == null ? "" : $"{request.Scheme}://{request.Host}";
            }
            baseUrl = baseUrl.TrimEnd('/');
            return paths.Select(p => baseUrl + p).ToList();
        }

        private string WebRoot => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
    }
}
