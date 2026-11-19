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

        // FE: GET users/{username}/reposts?page=1&per_page=10
        [HttpGet("{username}/reposts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserReposts(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _userService.GetUserRepostsAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }

        // FE: POST users/{username}/follow → bật/tắt theo dõi (bắt buộc đăng nhập)
        [HttpPost("{username}/follow")]
        public async Task<IActionResult> ToggleFollow(string username)
        {
            var response = await _userService.ToggleFollowAsync(username);
            return StatusCode(response.StatusCode, response);
        }

        // FE: GET users/{username}/followers?page=1&per_page=20
        [HttpGet("{username}/followers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFollowers(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 20)
        {
            var response = await _userService.GetFollowersAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }

        // FE: GET users/{username}/following?page=1&per_page=20
        [HttpGet("{username}/following")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFollowing(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 20)
        {
            var response = await _userService.GetFollowingAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }

        // FE: GET users/{username}/replies?page=1&per_page=10
        [HttpGet("{username}/replies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserReplies(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _userService.GetUserRepliesAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }

        // FE: GET users/{username}/media?page=1&per_page=10
        [HttpGet("{username}/media")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserMedia(string username, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _userService.GetUserMediaAsync(username, page, perPage);
            return StatusCode(response.StatusCode, response);
        }
    }
}
