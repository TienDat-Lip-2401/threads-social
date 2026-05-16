using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Pharse2.Models.CommonModels;

namespace Pharse2.Helper
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResult<T>> ToPageResultAsync<T>
            (this IQueryable<T> queryable, int pageNumber, int pageSize)
        {
            var count = await queryable.CountAsync();
            //Bỏ qua các phần tử trước đó và lấy số phần tử cần thiết cho trang hiện tại
            var items = await queryable.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedResult<T>(items, count, pageNumber, pageSize);
        }
    }
}
