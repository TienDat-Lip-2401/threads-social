using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.Auth;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;
using System.Text.RegularExpressions;

namespace Pharse2.Services.Implement
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ITokenService _tokenService;
        private readonly ICommonService _commonService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            ITokenService tokenService,
            ICommonService commonService,
            ILogger<AuthService> logger
            )
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _tokenService = tokenService;
            _commonService = commonService;
            _logger = logger;
        }
        public async Task<ApiResponse> LoginAsync(LoginRequestDto dto, string? ipAddress, string? userAgent)
        {
            _logger.LogInformation("Đang xử lý đăng nhập cho: {Email}", dto.Email);
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            {
                _logger.LogWarning("Đăng nhập thất bại: Sai thông tin cho Email {Email} | IP: {IP}", dto.Email, ipAddress);
                return ApiResponse.Response(400, "Sai tên đăng nhập hoặc mật khẩu!");
            }
            //Mở bất đồng bộ
            using var transaction = await _userRepository.BeginTransactionAsync();
            try
            {
                
                var refreshTokenModel = _tokenService.GenerateRefreshToken();
                
                var newRefreshToken = new RefreshToken
                {
                    UserId = user.Id,
                    TokenHash = refreshTokenModel.TokenHash,
                    ExpiresAt = refreshTokenModel.ExpiresAt,
                    IsRevoked = false,
                    IpAddress = ipAddress,
                    UserAgent = userAgent
                };
                await _refreshTokenRepository.CreateAsync(newRefreshToken);
                await _refreshTokenRepository.SaveChangesAsync();
                string refreshTokenId = newRefreshToken.Id.ToString();
                var acessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, refreshTokenId);
                //Đóng bất đồng bôj
                await transaction.CommitAsync();
                _logger.LogInformation("Đăng nhập thành công: User {Email} (ID: {UserId}) | TokenId: {TokenId}", user.Email, user.Id, refreshTokenId);
                var result = new LoginResponseDto
                {
                    user_id = user.Id,
                    user_name = user.Username,
                    access_token = acessToken,
                    refresh_token = refreshTokenModel.RawToken,
                    expires_at = refreshTokenModel.ExpiresAt,
                };
                return ApiResponse.Response(200, "Đăng nhập thành công!", result);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex.Message, "LỖI khi Login cho {Email}", dto.Email);
                // Đào sâu để lấy InnerException (Lỗi gốc từ Database)
                Exception innerEx = ex;
                while (innerEx.InnerException != null)
                {
                    innerEx = innerEx.InnerException;
                }

                // Trả lỗi gốc ra ngoài để bạn biết chính xác cần sửa gì trong DB
                return ApiResponse.Response(500, "Lỗi Server/DB: " + innerEx.Message);

            }
        }

        public async Task<ApiResponse> LogoutAsync(LogoutRequestDto dto)
        {
            // Ghi log chi tiết về yêu cầu đăng xuất
            _logger.LogInformation("Đang xử lý đăng xuất!");
            string tokenHash = _tokenService.ComputeSha256Hash(dto.refresh_token);
            var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);
            if (existingToken == null || existingToken.UserId != _commonService.GetUserId())
            {
                // Ghi log chi tiết về lỗi đăng xuất
                _logger.LogWarning("Đăng xuất thất bại: Token không hợp lệ!.");
                return ApiResponse.Response(400, "Thẻ không hợp lệ hoặc bạn đã đăng xuất rồi!");
            }
            
            
            // Đánh dấu là đã thu hồi
            existingToken.IsRevoked = true;
            existingToken.RevokedAt = DateTime.UtcNow;
            await _refreshTokenRepository.SaveChangesAsync();
            // Ghi log chi tiết
            _logger.LogInformation("Đăng xuất thành công cho User ID: {UserId}", existingToken.UserId);
            return ApiResponse.Response(200, "Đăng xuất thành công!");
        }

        public async Task<ApiResponse> RefreshTokenAsync(RefreshTokenRequestDto dto, string? ipAddress, string? userAgent)
        {
            // Ghi log chi tiết về yêu cầu gia hạn token    
            _logger.LogInformation("Yêu cầu gia hạn (Refresh Token) từ IP: {IP}", ipAddress);
            string tokenHash = _tokenService.ComputeSha256Hash(dto.refresh_token);
            var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);
            if(existingToken == null)
            {
                _logger.LogWarning("Refresh thất bại: Token không hợp lệ hoặc đã bị xóa khỏi DB.");
                return ApiResponse.Response(404, "Thẻ gia hạn không tồn tại hoặc đã bị thu hồi!");
            }
            if(existingToken.ExpiresAt <= DateTime.UtcNow)
            {
                _logger.LogWarning("Refresh thất bại: Token đã hết hạn vào lúc {Expiry}", existingToken.ExpiresAt);
                return ApiResponse.Response(403, "Thẻ gia hạn đã hết hạn! Vui lòng đăng nhập lại.");
            }
            if(existingToken.User.DeleteFlg )
            {
                _logger.LogWarning("Refresh thất bại: Tài khoản {UserId} đang bị khóa", existingToken.UserId);
                return ApiResponse.Response(403, "Tài khoản của bạn đã bị khóa!");
            }
            
            using var transaction = await _userRepository.BeginTransactionAsync();
            try
            {
                existingToken.IsRevoked = true;
                existingToken.RevokedAt = DateTime.UtcNow;
                var newRefreshTokenModel = _tokenService.GenerateRefreshToken();
                var newRefreshToken = new RefreshToken
                {
                    UserId = existingToken.UserId,
                    TokenHash = newRefreshTokenModel.TokenHash,
                    ExpiresAt = newRefreshTokenModel.ExpiresAt,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    IsRevoked = false
                };
                await _refreshTokenRepository.CreateAsync(newRefreshToken);
                await _refreshTokenRepository.SaveChangesAsync();
                var newAcessToken = _tokenService.GenerateAccessToken(existingToken.UserId, existingToken.User.Username, newRefreshToken.Id.ToString());
                await transaction.CommitAsync();
                _logger.LogInformation("Gia hạn thành công cho User {UserId}. Token mới: {TokenId}", existingToken.UserId, newRefreshToken.Id);
                var result = new LoginResponseDto
                {
                    user_id = existingToken.UserId,
                    user_name = existingToken.User.Username,
                    access_token = newAcessToken,
                    refresh_token = newRefreshTokenModel.RawToken,
                    expires_at = newRefreshTokenModel.ExpiresAt,

                };
                
                return ApiResponse.Response(200, "Gia hạn phiên đăng nhập thành công!", result);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Lỗi hệ thống khi Refresh Token cho User ID: {UserId}", existingToken.UserId);
                await transaction.RollbackAsync();
                return ApiResponse.Response(500, "Lỗi hệ thống khi gia hạn!");
            }
        }

        public async Task<ApiResponse> RegisterAsync(RegisterRequestDto dto)
        {
            var emailRegex = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if(!Regex.IsMatch(dto.Email, emailRegex))
            {
                return ApiResponse.Response(400, "Email không hợp lệ!");
            }
            var passwordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";
            if (!Regex.IsMatch(dto.Password, passwordRegex))
            {
                return ApiResponse.Response(400, "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)!");
            }
            if (await _userRepository.ExistsByUserNameAsync(dto.Username))
            {
                return ApiResponse.Response(400, "Tên đăng nhập đã tồn tại!");
            }
            if(await _userRepository.ExistsByEmailAsync(dto.Email))
            {
                return ApiResponse.Response(400, "Email đã tồn tại!");
            }
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Password = passwordHash
            };
            await _userRepository.CreateAsync(user);
            await _userRepository.SaveChangesAsync();
            return ApiResponse.Response(200, "Đăng ký thành công!");

        }

        public async Task<ApiResponse> RevokeAllSessionsAsync()
        {
            var userId = _commonService.GetUserId();
            await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
            return ApiResponse.Response(200, "Đã thu hồi tất cả phiên đăng nhập của bạn!");

        }
    }
}
