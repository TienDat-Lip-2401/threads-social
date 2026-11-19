using Microsoft.EntityFrameworkCore;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.User;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class LikePostService : ILikePostService
    {
        private readonly ILikePostRepository _likePostRepository;
        private readonly IPostRepository _postRepository;
        private readonly ICommonService _commonService;
        public LikePostService(ILikePostRepository likePostRepository, IPostRepository postRepository, ICommonService commonService)
        {
            _likePostRepository = likePostRepository;
            _postRepository = postRepository;
            _commonService = commonService;
        }
        // Get list of users who liked a post
        public async Task<ApiResponse> GetLikersByPostIdAsync(int postId)
        {
            var users = await _likePostRepository.GetLikersAsync(postId);
            var result =  users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
            }).ToList();
            return ApiResponse.Response(200, "Get likers successfully", result);
        }
        // FE: POST posts/{id}/like → like nếu chưa like, bỏ like nếu đã like
        // Trả { is_liked, likes_count } để FE đồng bộ lại số liệu thật
        public async Task<ApiResponse> ToggleLikePostAsync(int postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || post.DeleteFlg)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var currentUserId = _commonService.GetUserId();
            var existingLike = await _likePostRepository.GetLikePost(currentUserId, postId);
            if (existingLike != null)
            {
                _likePostRepository.RemoveLike(existingLike);
            }
            else
            {
                await _likePostRepository.AddLikeAsync(new LikePost
                {
                    UserId = currentUserId,
                    PostId = postId,
                    CreatedAt = DateTime.UtcNow
                });
            }
            try
            {
                await _likePostRepository.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // 2 request cùng lúc (bấm liên tục): request kia đã thêm/xóa trước → trả trạng thái hiện tại
            }
            var result = new
            {
                IsLiked = await _likePostRepository.IsLikePost(currentUserId, postId),
                LikesCount = await _likePostRepository.GetLikeCountAsync(postId)
            };
            return ApiResponse.Response(200, result.IsLiked ? "Post liked successfully" : "Post unliked successfully", result);
        }
    }
}
