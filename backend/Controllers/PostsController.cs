using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Filters;
using Pharse2.Models.DtoModels;
using Pharse2.Services.Implement;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ICommonService _commonService;
        private readonly ICommentService _commentService;
        private readonly ILikePostService _likePostService;
        private readonly IRepostService _repostService;
        public PostsController(IPostService postService, ICommonService commonService, ICommentService commentService, ILikePostService likePostService, IRepostService repostService)
        {
            _repostService = repostService;
            _likePostService = likePostService;
            _postService = postService;
            _commonService = commonService;
            _commentService = commentService;

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
        // FE gửi multipart/form-data: content + media[] (file ảnh)
        [HttpPost]
        [RequestSizeLimit(LocalMediaStorage.MaxRequestBytes)]
        public async Task<IActionResult> CreatePost([FromForm] PostFormRequestDto dto)
        {
            var response = await _postService.CreatePostAsync(dto);
            return StatusCode(response.StatusCode, response);
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
        // FE: POST posts/{id}/like → bật/tắt like, trả { is_liked, likes_count }
        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> ToggleLike(int id)
        {
            var response = await _likePostService.ToggleLikePostAsync(id);
            return StatusCode(response.StatusCode, response);
        }
        // FE: POST posts/{id}/repost → bật/tắt repost, trả { is_reposted, reposts_and_quotes_count }
        [HttpPost("{id:int}/repost")]
        public async Task<IActionResult> ToggleRepost(int id)
        {
            var response = await _repostService.ToggleRepostAsync(id);
            return StatusCode(response.StatusCode, response);
        }
        // FE: GET posts/{id}/comments?page=1&per_page=10
        [HttpGet("{id:int}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostComments(int id, [FromQuery] int page = 1, [FromQuery(Name = "per_page")] int perPage = 10)
        {
            var response = await _commentService.GetPostCommentsAsync(id, page, perPage);
            return StatusCode(response.StatusCode, response);
        }
        // FE gửi multipart/form-data: content + media[] + reply_permission
        // shortcut: reply_permission chưa được lưu
        [HttpPost("{id:int}/comments")]
        [RequestSizeLimit(LocalMediaStorage.MaxRequestBytes)]
        public async Task<IActionResult> CreatePostComment(int id, [FromForm] PostFormRequestDto dto)
        {
            var response = await _commentService.CreatePostCommentAsync(id, dto);
            return StatusCode(response.StatusCode, response);
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