using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikePostController : ControllerBase
    {
        private readonly ILikePostService _likePostService;
        private readonly IPostService _postService;
        private readonly ICommonService _commonService;
        public LikePostController(ILikePostService likePostService, IPostService postService, ICommonService commonService)
        {
            _likePostService = likePostService;
            _postService = postService;
            _commonService = commonService;
        }
        [HttpGet]
        [Route("likes/{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikerByPostId(int postId)
        {
            var count = await _likePostService.GetLikersByPostIdAsync(postId);
            return Ok(count);
        }
    }
}
