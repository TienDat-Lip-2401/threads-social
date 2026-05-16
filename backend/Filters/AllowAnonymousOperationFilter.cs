using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Pharse2.Filters
{
    public class AllowAnonymousOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var hasAllowAnonymous = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AllowAnonymousAttribute>()
                .Any();

            if (hasAllowAnonymous)
            {
                // 1. Dán chữ thông báo vào phần Description (Bên trong)
                operation.Description ??= "";
                operation.Description += "<br/><b>🔓 This endpoint allows anonymous access (no JWT required).</b>";

                // 2. THÊM DÒNG NÀY: Dán cái ổ khóa vào Summary để nó hiện ngay BÊN NGOÀI
                operation.Summary ??= "";
                operation.Summary += " 🔓";
            }
        }
    }
}
