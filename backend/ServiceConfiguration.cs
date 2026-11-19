using Microsoft.EntityFrameworkCore;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Implement;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Implement;
using Pharse2.Services.Interfaces;
using Serilog;
using Serilog.Events;
namespace Pharse2
{
    public static class ServiceConfiguration
    {
        
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Bí mật không nằm trong appsettings.json: báo lỗi rõ ràng ngay khi khởi động nếu thiếu
            foreach (var key in new[] { "ConnectionStrings:DefaultConnection", "JwtSettings:Key" })
            {
                if (string.IsNullOrWhiteSpace(configuration[key]))
                    throw new InvalidOperationException(
                        $"Thiếu cấu hình '{key}'. Đặt bằng: dotnet user-secrets set \"{key}\" \"<giá trị>\" (hoặc biến môi trường {key.Replace(":", "__")}).");
            }
            //Database
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            //Service
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<ICommentService, CommentService>();
            services.AddScoped<ILikePostService, LikePostService>();
            services.AddScoped<ILikeCommentService, LikeCommentService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICommonService, CommonService>();
            services.AddHttpContextAccessor();
            services.AddScoped<IMediaStorage, LocalMediaStorage>();
            //Repositories
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<ILikePostRepository, LikePostRepository>();
            services.AddScoped<ILikeCommentRepository, LikeCommentRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            //Logging
            Log.Logger = new LoggerConfiguration().
                // 1. Nâng mức mặc định lên Warning (để chặn hết Info của Microsoft, EF...)
                MinimumLevel.Warning()

                // 2. Chỉ cho phép code trong namespace Pharse2 của bạn được ghi log Information
                .MinimumLevel.Override("Pharse2", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .ReadFrom.Configuration(configuration)
                .WriteTo.Console()
                .WriteTo.File(
                    path: "Logs/Pharse2_Log_.txt",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 7,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                .CreateLogger();
            return services;
        }
    }
}
