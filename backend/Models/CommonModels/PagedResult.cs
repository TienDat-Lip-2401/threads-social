namespace Pharse2.Models.CommonModels
{
    public class PagedResult<T>
    {
        // Danh sách các phần tử trong trang hiện tại
        public List<T> Items { get; set; } = new();
        // Tổng số phần tử trong toàn bộ tập dữ liệu (không chỉ trang hiện tại)
        public int TotalItems { get; set; }
        // Số trang hiện tại (bắt đầu từ 1)
        public int CurrentPage { get; set; }
        // Số phần tử trên mỗi trang
        public int PageSize { get; set; }
        // Tổng số trang
        public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
        public PagedResult(List<T> items, int count, int pageNumber, int pageSize)
        {
            Items = items;
            TotalItems = count;
            CurrentPage = pageNumber;
            PageSize = pageSize;
        }
    }
}
