using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.Auth;

namespace Pharse2.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse> RegisterAsync(RegisterRequestDto requestDto);
        Task<ApiResponse> LoginAsync(LoginRequestDto requestDto, string? ipAddress, string? userAgent);
        Task<ApiResponse> RefreshTokenAsync(RefreshTokenRequestDto dto, string? ipAddress, string? userAgent);
        Task<ApiResponse> LogoutAsync(LogoutRequestDto dto);
        Task<ApiResponse> RevokeAllSessionsAsync();
    }
}
