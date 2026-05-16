using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pharse2.Models.DtoModels.Comment;
using Pharse2.Services.Interfaces;

namespace Pharse2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;
        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }
        [HttpGet]

        public async Task<IActionResult> GetAllComments()
        {
            var response = await _commentService.GetAllCommentsAsync();
            return Ok(response);
        }
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetCommentById(int id)
        {
            var response = await _commentService.GetCommentByIdAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpPost]
        public async Task<IActionResult> CreateComment(CommentRequestDto dto)
        {
            var response = await _commentService.CreateCommentAsync(dto);
            if (response.StatusCode == 400)
            {
                return BadRequest(response);
            }
            if (response.StatusCode == 500)
            {
                return StatusCode(500, response);
            }
            return CreatedAtAction(nameof(GetCommentById), new { id = response.Data }, response);
        }
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var response = await _commentService.DeleteCommentAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateComment(int id, CommentUpdateRequestDto dto)
        {
            var response = await _commentService.UpdateCommentAsync(id, dto);
            if (response.StatusCode == 400)
            {
                return BadRequest(response);
            }
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            if (response.StatusCode == 500)
            {
                return StatusCode(500, response);
            }
            return Ok(response);

        }
        [HttpGet]
        [Route("{id}/replies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentRepliesById(int id)
        {
            var response = await _commentService.GetCommentRepliesByIdAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
        [HttpGet]
        [Route("{id}/likes")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikesCommentById(int id)
        {
            var response = await _commentService.GetLikesCommentByIdAsync(id);
            if (response.StatusCode == 404)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
    }
}