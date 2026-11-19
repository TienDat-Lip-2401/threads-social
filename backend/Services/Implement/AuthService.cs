using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.Auth;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;
using Microsoft.AspNetCore.WebUtilities;
using System.Net;
using System.Security.Cryptography;
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
        private readonly IUserTokenRepository _userTokenRepository;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;

        // Dùng chung cho đăng ký và đặt lại mật khẩu
        private const string PasswordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";
        private const string PasswordRuleMessage = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)!";
        private static readonly TimeSpan ResetTokenLifetime = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan VerifyTokenLifetime = TimeSpan.FromHours(24);
        private static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            ITokenService tokenService,
            ICommonService commonService,
            ILogger<AuthService> logger,
            IUserTokenRepository userTokenRepository,
            IEmailSender emailSender,
            IConfiguration configuration
            )
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _tokenService = tokenService;
            _commonService = commonService;
            _logger = logger;
            _userTokenRepository = userTokenRepository;
            _emailSender = emailSender;
            _configuration = configuration;
        }
        public async Task<ApiResponse> LoginAsync(LoginRequestDto dto, string? ipAddress, string? userAgent)
        {
            _logger.LogInformation("Đang xử lý đăng nhập cho: {Login}", dto.Login);
            // FE gửi 1 ô "login": có thể là email hoặc username
            var user = await _userRepository.GetByEmailAsync(dto.Login)
                       ?? await _userRepository.GetByUsernameAsync(dto.Login);
            if (user == null || user.DeleteFlg || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            {
                _logger.LogWarning("Đăng nhập thất bại: Sai thông tin cho {Login} | IP: {IP}", dto.Login, ipAddress);
                return ApiResponse.Response(400, "Sai tên đăng nhập hoặc mật khẩu!");
            }
            if (user.EmailVerifiedAt == null)
            {
                _logger.LogInformation("Đăng nhập bị chặn: User {UserId} chưa xác thực email", user.Id);
                return ApiResponse.Response(403, "Email chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc gửi lại email xác thực.");
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
                var acessToken = _tokenService.GenerateAccessToken(user.Id, user.Username, refreshTokenId);
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
                // Lỗi gốc chỉ ghi vào log, không trả chi tiết DB ra cho client
                _logger.LogError(ex, "LỖI khi Login cho {Login}", dto.Login);
                return ApiResponse.Response(500, "Lỗi hệ thống khi đăng nhập!");
            }
        }

        // FE gọi logout không kèm body: thu hồi phiên gắn với access token hiện tại
        public async Task<ApiResponse> LogoutAsync()
        {
            // Ghi log chi tiết về yêu cầu đăng xuất
            _logger.LogInformation("Đang xử lý đăng xuất!");
            var existingToken = await _refreshTokenRepository.GetByIdAsync(_commonService.GetRefreshTokenId());
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
            // Gom lỗi theo từng ô để FE hiện ngay dưới ô đó: errors.{field}[0]
            var errors = new Dictionary<string, string[]>();
            var emailRegex = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if (!Regex.IsMatch(dto.Email, emailRegex))
                errors["email"] = new[] { "Email không hợp lệ!" };
            else if (await _userRepository.ExistsByEmailAsync(dto.Email))
                errors["email"] = new[] { "Email đã tồn tại!" };

            if (await _userRepository.ExistsByUserNameAsync(dto.Username))
                errors["username"] = new[] { "Tên đăng nhập đã tồn tại!" };

            if (!Regex.IsMatch(dto.Password, PasswordRegex))
                errors["password"] = new[] { PasswordRuleMessage };

            if (dto.PasswordConfirmation != dto.Password)
                errors["password_confirmation"] = new[] { "Mật khẩu xác nhận không khớp!" };

            if (errors.Count > 0)
            {
                return ApiResponse.ValidationError(errors);
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
            await SendVerificationEmailAsync(user);
            return ApiResponse.Response(201, "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");

        }

        // FE: POST auth/forgot-password { email }
        // Luôn trả 200 (kể cả email không tồn tại) để không lộ email nào đã đăng ký.
        public async Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordRequestDto dto)
        {
            const string message = "Nếu email đã đăng ký, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!";
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return ApiResponse.ValidationError(new() { ["email"] = ["Vui lòng nhập email!"] });
            }

            var user = await _userRepository.GetByEmailAsync(dto.Email.Trim());
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(200, message);
            }

            await SendTokenEmailAsync(user, UserToken.ResetPassword, ResetTokenLifetime, "reset-password",
                "Đặt lại mật khẩu Threads",
                link => $"<p>Bấm vào link dưới đây để đặt lại mật khẩu (hết hạn sau {ResetTokenLifetime.TotalMinutes} phút):</p>" +
                        $"<p><a href=\"{link}\">{link}</a></p>" +
                        "<p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>");
            return ApiResponse.Response(200, message);
        }

        // FE: POST auth/verify-email { token }
        public async Task<ApiResponse> VerifyEmailAsync(VerifyEmailRequestDto dto)
        {
            var token = string.IsNullOrWhiteSpace(dto.Token) ? null
                : await _userTokenRepository.GetValidAsync(_tokenService.ComputeSha256Hash(dto.Token), UserToken.VerifyEmail);
            if (token == null || token.User.DeleteFlg)
            {
                return ApiResponse.Response(400, "Link xác thực không hợp lệ hoặc đã hết hạn!");
            }
            var now = DateTime.UtcNow;
            token.User.EmailVerifiedAt ??= now;
            token.User.UpdatedAt = now;
            token.UsedAt = now;
            token.UpdatedAt = now;
            await _userTokenRepository.SaveChangesAsync();
            await _userTokenRepository.InvalidateAllAsync(token.UserId, UserToken.VerifyEmail);
            return ApiResponse.Response(200, "Xác thực email thành công! Bạn có thể đăng nhập.");
        }

        // FE: POST auth/resend-verification-email { email } (không cần đăng nhập)
        // Luôn trả 200 để không lộ email nào đã đăng ký / đã xác thực.
        public async Task<ApiResponse> ResendVerificationEmailAsync(ResendVerificationEmailRequestDto dto)
        {
            const string message = "Nếu email đã đăng ký và chưa xác thực, chúng tôi đã gửi lại link xác thực. Vui lòng kiểm tra hộp thư!";
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return ApiResponse.ValidationError(new() { ["email"] = ["Vui lòng nhập email!"] });
            }
            var user = await _userRepository.GetByEmailAsync(dto.Email.Trim());
            if (user != null && !user.DeleteFlg && user.EmailVerifiedAt == null)
            {
                await SendVerificationEmailAsync(user);
            }
            return ApiResponse.Response(200, message);
        }

        private Task SendVerificationEmailAsync(User user) =>
            SendTokenEmailAsync(user, UserToken.VerifyEmail, VerifyTokenLifetime, "verify-email",
                "Xác thực email Threads",
                link => $"<p>Cảm ơn bạn đã đăng ký Threads. Bấm vào link dưới đây để xác thực email (hết hạn sau {VerifyTokenLifetime.TotalHours} giờ):</p>" +
                        $"<p><a href=\"{link}\">{link}</a></p>" +
                        "<p>Nếu bạn không đăng ký, hãy bỏ qua email này.</p>");

        // Tạo token dùng 1 lần (lưu hash), vô hiệu link cũ cùng loại, gửi email chứa link {FrontendBaseUrl}/{path}?token=...
        // Trong 60 giây chỉ gửi 1 email/loại để tránh spam. Lỗi gửi email chỉ ghi log (không lộ ra ngoài).
        private async Task SendTokenEmailAsync(User user, string type, TimeSpan lifetime, string path,
            string subject, Func<string, string> buildBody)
        {
            var latest = await _userTokenRepository.GetLatestAsync(user.Id, type);
            if (latest != null && latest.CreatedAt > DateTime.UtcNow - ResendCooldown)
            {
                return;
            }

            await _userTokenRepository.InvalidateAllAsync(user.Id, type);
            var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            var now = DateTime.UtcNow;
            await _userTokenRepository.CreateAsync(new UserToken
            {
                UserId = user.Id,
                Type = type,
                TokenHash = _tokenService.ComputeSha256Hash(rawToken),
                ExpiresAt = now + lifetime,
                CreatedAt = now,
                UpdatedAt = now
            });
            await _userTokenRepository.SaveChangesAsync();

            // Link luôn dựng từ cấu hình, không tin header từ client (tránh link giả mạo)
            var frontendBaseUrl = (_configuration["App:FrontendBaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var link = $"{frontendBaseUrl}/{path}?token={rawToken}";
            try
            {
                await _emailSender.SendAsync(user.Email, subject,
                    $"<p>Xin chào <b>{WebUtility.HtmlEncode(user.Username)}</b>,</p>" + buildBody(link));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi email {Type} thất bại cho User ID: {UserId}", type, user.Id);
            }
        }

        // FE: POST auth/reset-password { token, email, password, password_confirmation }
        public async Task<ApiResponse> ResetPasswordAsync(ResetPasswordRequestDto dto)
        {
            var errors = new Dictionary<string, string[]>();
            if (string.IsNullOrEmpty(dto.Password) || !Regex.IsMatch(dto.Password, PasswordRegex))
                errors["password"] = new[] { PasswordRuleMessage };
            if (dto.PasswordConfirmation != dto.Password)
                errors["password_confirmation"] = new[] { "Mật khẩu xác nhận không khớp!" };
            if (errors.Count > 0)
            {
                return ApiResponse.ValidationError(errors);
            }

            var token = string.IsNullOrWhiteSpace(dto.Token) ? null
                : await _userTokenRepository.GetValidAsync(_tokenService.ComputeSha256Hash(dto.Token), UserToken.ResetPassword);
            if (token == null || token.User.DeleteFlg
                || !string.Equals(token.User.Email, dto.Email?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return ApiResponse.Response(400, "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!");
            }

            using var transaction = await _userRepository.BeginTransactionAsync();
            try
            {
                var now = DateTime.UtcNow;
                token.User.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                token.User.EmailVerifiedAt ??= now; // bấm được link trong email = đã sở hữu email
                token.User.UpdatedAt = now;
                token.UsedAt = now;
                token.UpdatedAt = now;
                await _userTokenRepository.SaveChangesAsync();
                await _userTokenRepository.InvalidateAllAsync(token.UserId, UserToken.ResetPassword);
                // Đổi mật khẩu → đăng xuất mọi thiết bị
                await _refreshTokenRepository.RevokeAllUserTokensAsync(token.UserId);
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi đặt lại mật khẩu cho User ID: {UserId}", token.UserId);
                return ApiResponse.Response(500, "Lỗi hệ thống khi đặt lại mật khẩu!");
            }
            return ApiResponse.Response(200, "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
        }

        public async Task<ApiResponse> RevokeAllSessionsAsync()
        {
            var userId = _commonService.GetUserId();
            await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
            return ApiResponse.Response(200, "Đã thu hồi tất cả phiên đăng nhập của bạn!");

        }
    }
}
