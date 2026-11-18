using System.Text.Json.Serialization;

namespace Pharse2.Models.CommonModels
{
    // Serialized as snake_case: { status_code, message, data, errors?, pagination? }
    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }

        // Validation errors per field, e.g. { "email": ["Email đã tồn tại!"] }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Dictionary<string, string[]>? Errors { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public PaginationMeta? Pagination { get; set; }

        public static ApiResponse Response(int statusCode, string message, object? data = null)
        {
            return new ApiResponse
            {
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        // 422 with per-field errors
        public static ApiResponse ValidationError(Dictionary<string, string[]> errors, string message = "Dữ liệu không hợp lệ!")
        {
            return new ApiResponse
            {
                StatusCode = StatusCodes.Status422UnprocessableEntity,
                Message = message,
                Errors = errors
            };
        }

        // List response: { data: [...items], pagination: { current_page, last_page, per_page, total } }
        public static ApiResponse Paged<T>(PagedResult<T> page, string message = "Thành công")
        {
            return new ApiResponse
            {
                StatusCode = StatusCodes.Status200OK,
                Message = message,
                Data = page.Items,
                Pagination = new PaginationMeta
                {
                    CurrentPage = page.CurrentPage,
                    LastPage = Math.Max(1, page.TotalPages),
                    PerPage = page.PageSize,
                    Total = page.TotalItems
                }
            };
        }
    }

    public class PaginationMeta
    {
        public int CurrentPage { get; set; }
        public int LastPage { get; set; }
        public int PerPage { get; set; }
        public int Total { get; set; }
    }
}
