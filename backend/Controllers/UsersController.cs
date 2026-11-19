using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // FE: GET users/{username} → hồ sơ công khai
        [HttpGet("{username}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProfile(string username)
        {
            var response = await _userService.GetProfileAsync(username);
            return StatusCode(response.StatusCode, response);
        }

        // FE: GET users/{username}/posts?page=1&per_page=10
        [HttpGet("{username}/posts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserPosts(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _userService.GetUserPostsAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }
    }
}
