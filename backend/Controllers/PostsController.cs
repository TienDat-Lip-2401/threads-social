using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Filters;
using Pharse2.Models.DtoModels;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ICommonService _commonService;
        public PostsController(IPostService postService, ICommonService commonService)
        {
            _postService = postService;
            _commonService = commonService;

        }
        
        // FE: GET posts/feed?type=for_you&page=1&per_page=10 (type chưa dùng, chỉ có 1 feed)
        [HttpGet("feed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _postService.GetFeedAsync(page, perPage);
            return Ok(response);
        }
        [HttpGet]
        [Route("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostById(int id)
        {
            var response = await _postService.GetPostByIdAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpPost]

        public async Task<IActionResult> CreatePost(PostRequestDto dto)
        {
            var response = await _postService.CreatePostAsync(dto);
            if (response.StatusCode == 400)
            {
                return BadRequest(response);
            }
            if (response.StatusCode == 500)
            {
                return StatusCode(500, response);
            }
            return CreatedAtAction(nameof(GetPostById), new { id = response.Data }, response);
        }
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var response = await _postService.DeletePostAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdatePost(int id, PostRequestDto dto)
        {
            var response = await _postService.UpdatePostAsync(id, dto);

            if (response.StatusCode == 404) return NotFound(response);
            if (response.StatusCode == 400) return BadRequest(response);
            if (response.StatusCode == 500) return StatusCode(500, response);

            return Ok(response);
        }
        [HttpGet]
        [Route("{id}/likes")]

        [AuthorizeRole("Admin")]
        public async Task<IActionResult> GetUsersLikePost(int id)
        {
            var response = await _postService.GetUsersLikePostAsync(id);
            if (response.StatusCode == 404) return NotFound(response);
            return Ok(response);
        }
        [HttpGet]
        [Route("{id}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentsPost(int id)
        {
            var response = await _postService.GetCommentsPostAsync(id);
            if (response.StatusCode == 404) return NotFound(response);
            return Ok(response);
        }
        [HttpGet]
        [Route("user/{userId}")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> GetPostsByUserId(int userId)
        {
            var response = await _postService.GetPostsByUserIdAsync(userId);
            if (response.StatusCode == 404) return NotFound(response);
            return Ok(response);
        }
    }
}