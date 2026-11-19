using Microsoft.AspNetCore.Mvc;
using Pharse2.Filters;
using Pharse2.Models.DtoModels.User;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    // Chức năng quản trị: bắt buộc đăng nhập + role Admin
    // shortcut: chưa có giao diện admin trên FE, gọi bằng curl / Swagger
    [Route("api/admin")]
    [ApiController]
    [AuthorizeRole("Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        // PUT admin/users/{username}/verified { "verified": true } → cấp / gỡ tích xanh
        [HttpPut("users/{username}/verified")]
        public async Task<IActionResult> SetVerified(string username, SetVerifiedRequestDto dto)
        {
            var response = await _userService.SetVerifiedAsync(username, dto.Verified);
            return StatusCode(response.StatusCode, response);
        }
    }
}
