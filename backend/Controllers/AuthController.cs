using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Filters;
using Pharse2.Models.DtoModels.Auth;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly ICommonService _commonService;
        public AuthController(IAuthService authService, IUserService userService, ICommonService commonService)
        {
            _authService = authService;
            _userService = userService;
            _commonService = commonService;
        }

        // Mọi action trả đúng mã HTTP mà service đã quyết định (200/201/400/403/404/422/500)
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequestDto dto)
        {
            var response = await _authService.RegisterAsync(dto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var response = await _authService.LoginAsync(dto, GetIpAddress(), GetUserAgent());
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto dto)
        {
            var response = await _authService.RefreshTokenAsync(dto, GetIpAddress(), GetUserAgent());
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var response = await _authService.LogoutAsync();
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserInfo()
        {
            var response = await _userService.GetMeAsync(_commonService.GetUserId());
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("revoke-all-sessions")]
        [AuthorizeRole("Admin", "User")]
        public async Task<IActionResult> RevokeAllSessions()
        {
            var response = await _authService.RevokeAllSessionsAsync();
            return StatusCode(response.StatusCode, response);
        }

        private string? GetIpAddress() =>
            Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? HttpContext.Connection.RemoteIpAddress?.ToString();

        private string GetUserAgent() => Request.Headers["User-Agent"].ToString();
    }
}
