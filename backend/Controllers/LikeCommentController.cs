using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Models.DtoModels.LikeComment;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikeCommentController : ControllerBase
    {
        private readonly ILikeCommentService _likeCommentService;
        public LikeCommentController(ILikeCommentService likeCommentService)
        {
            _likeCommentService = likeCommentService;
        }
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleLike(LikeCommentRequestDto dto)
        {
            var response = await _likeCommentService.ToggleLikeCommentAsync(dto);
            return Ok(response);
        }
        [HttpGet("{commentId}/likers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikers(int commentId)
        {
            var response = await _likeCommentService.GetLikersByCommentIdAsync(commentId);
            return StatusCode(response.StatusCode, response);
        }
    }
}
