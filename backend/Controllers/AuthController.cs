using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Filters;
using Pharse2.Models.DtoModels.Auth;
using Pharse2.Services.Interfaces;
using System.Security.Claims;

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
        [HttpPost]
        [Route("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequestDto dto)
        {
            var response = await _authService.RegisterAsync(dto);
            if (response.StatusCode == 400)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        [HttpPost]
        [Route("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault()
                            ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();
            var response = await _authService.LoginAsync(dto, ipAddress, userAgent);
            if (response.StatusCode == 400)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        [HttpPost]
        [Route("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto dto)
        {
            var ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault()
                           ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();
            var response = await _authService.RefreshTokenAsync(dto, ipAddress, userAgent);
            if (response.StatusCode != 200) return BadRequest(response);
            return Ok(response);
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(LogoutRequestDto dto)
        {
            var response = await _authService.LogoutAsync(dto);
            if (response.StatusCode != 200) return BadRequest(response);
            return Ok(response);
        }
        [HttpGet]
        [Route("me")]
        public async Task<IActionResult> GetUserInfo()
        {
            int userId = _commonService.GetUserId();
            var response = await _userService.GetMeAsync(userId);

            if (response.StatusCode == 404) return NotFound(response);

            return Ok(response);
        }
        [HttpPost]
        [Route("revoke-all-sessions")]
        [AuthorizeRole("Admin", "User")]
        public async Task<IActionResult> RevokeAllSessions()
        {
            var response = await _authService.RevokeAllSessionsAsync();
            if (response.StatusCode != 200) return BadRequest(response);
            return Ok(response);
        }
    }
}
