using Microsoft.AspNetCore.Authorization;
using Pharse2.Models.CommonModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.MiddleWares
{
    public class CustomAuthorizeMiddleware
    {
        private readonly RequestDelegate _next;
        public CustomAuthorizeMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task Invoke(
            HttpContext context,
            ITokenService tokenService,
            ICommonService commonService,
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository)
        {
            // Lấy token từ header Authorization
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            // Endpoint [AllowAnonymous]: không bắt buộc đăng nhập, nhưng nếu có token hợp lệ
            // thì vẫn nhận diện user (vd. feed cần biết user đã like bài nào). Token lỗi → coi như khách.
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata?.GetMetadata<IAllowAnonymous>() is object)
            {
                if (!string.IsNullOrEmpty(token))
                {
                    await AuthenticateAsync(token, tokenService, commonService, userRepository, refreshTokenRepository);
                }
                await _next(context);
                return;
            }

            if (string.IsNullOrEmpty(token))
            {
                await WriteUnauthorized(context, "Không tìm thấy Access Token.");
                return;
            }
            var error = await AuthenticateAsync(token, tokenService, commonService, userRepository, refreshTokenRepository);
            if (error != null)
            {
                await WriteUnauthorized(context, error);
                return;
            }
            await _next(context);
        }

        // Kiểm tra token + phiên + user; hợp lệ thì lưu userId vào CommonService và trả null, sai thì trả lý do
        private static async Task<string?> AuthenticateAsync(
            string token,
            ITokenService tokenService,
            ICommonService commonService,
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository)
        {
            // Kiểm tra tính hợp lệ của token
            var isTokenValid = tokenService.ValidateAccessToken(token);
            if (!isTokenValid)
            {
                return "Token không hợp lệ hoặc đã hết hạn.";
            }
            // Phân tích token để lấy thông tin claim
            var jwtSecurityToken = tokenService.ParseToken(token);
            // Lấy thông tin refresh token id từ claim để kiểm tra phiên làm việc
            var refreshToken = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "refresh_token_id");
            if (refreshToken == null || !int.TryParse(refreshToken.Value, out int refreshTokenId))
            {
                return "Token không chứa định danh phiên làm việc.";
            }
            // Kiểm tra refresh token trong database để xác thực phiên làm việc
            var rfToken = await refreshTokenRepository.GetByIdAsync(refreshTokenId);
            if (rfToken == null || rfToken.IsRevoked)
            {
                return "Phiên đăng nhập đã hết hạn hoặc bạn đã đăng xuất.";
            }
            // Lấy thông tin user id từ claim để xác thực người dùng
            var userIdClaim = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "nameid" || x.Type == "user_id");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return "Dữ liệu Token bị sai lệch.";
            }
            // Kiểm tra thông tin người dùng trong database
            var user = await userRepository.GetByIdAsync(userId);
            if(user == null || user.DeleteFlg)
            {
                return "Tài khoản đã bị vô hiệu hóa.";
            }
            // Lưu thông tin user id vào CommonService để sử dụng trong các service khác
            commonService.SetUserId(userId);
            commonService.SetRefreshTokenId(refreshTokenId);
            return null;
        }
        private async Task WriteUnauthorized(HttpContext context, string message)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(ApiResponse.Response(401, message));
        }
    }
}
