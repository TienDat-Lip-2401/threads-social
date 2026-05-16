
using Pharse2;
using Pharse2.Filters;
using Pharse2.MiddleWares;
using Serilog;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
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
