
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using Pharse2.Models.EntityModels;
using Pharse2;
using Pharse2.Filters;
using Pharse2.MiddleWares;
using Pharse2.Models.CommonModels;
using Serilog;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// FE dùng snake_case cho cả request và response (access_token, created_at, per_page...)
builder.Services.AddControllersWithViews(options =>
    {
        // Key lỗi validate theo tên JSON (password_confirmation) thay vì tên C# (PasswordConfirmation)
        options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider(JsonNamingPolicy.SnakeCaseLower));
    })
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower)
    .ConfigureApiBehaviorOptions(options =>
    {
        // Lỗi model binding/validate trả về cùng dạng { message, errors: { field: [..] } } với status 422
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    // form binding dùng tên C# (Content) → đưa về snake_case như JSON (content)
                    e => JsonNamingPolicy.SnakeCaseLower.ConvertName(e.Key.StartsWith("$.") ? e.Key[2..] : e.Key),
                    e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());
            return new UnprocessableEntityObjectResult(ApiResponse.ValidationError(errors));
        };
    });
// Response ghi trực tiếp từ middleware (WriteAsJsonAsync) cũng dùng snake_case
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower);
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<AllowAnonymousOperationFilter>();
});
builder.Services.AddServices(builder.Configuration);
// Use Serilog for logging
builder.Host.UseSerilog();
var allowOrigins = builder.Configuration.GetSection("AllowOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", policy =>
    {
        if (allowOrigins.Length > 0)
        {
            // Nếu có cấu hình domain cụ thể
            policy.WithOrigins(allowOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Cho phép gửi Token/Cookie
        }
        else
        {
            // Nếu chưa có cấu hình (thường dùng lúc Dev)
            // LƯU Ý: Nếu dùng AllowAnyOrigin thì KHÔNG ĐƯỢC dùng AllowCredentials
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }

        // Luôn cho phép FE đọc Header này nếu bạn có xử lý file
        policy.WithExposedHeaders("Content-Disposition");
    });
});
var app = builder.Build();
// Docker: tự tạo/cập nhật DB khi khởi động (bật bằng Database__MigrateOnStartup=true)
if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}
app.UseCors("AllowOrigin");
// Tự động ghi log mọi Request gọi đến API
//app.UseSerilogRequestLogging();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    
    app.UseSwaggerUI();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
//
app.UseMiddleware<CustomAuthorizeMiddleware>();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
