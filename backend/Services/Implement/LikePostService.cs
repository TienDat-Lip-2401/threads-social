using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.LikePost;
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
        // Check if user liked a post
        public async Task<ApiResponse> CheckUserLikePost(LikePostRequestDto dto)
        {
            var currentUserId = _commonService.GetUserId();
            var likePost = await _likePostRepository.GetLikePost(currentUserId, dto.postId);
            var result = likePost != null;
            return ApiResponse.Response(200, "Check like post successfully", result);
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
        // Toggle like/unlike post
        public async Task<ApiResponse> ToggleLikePostAsync(LikePostRequestDto dto)
        {
            var post  = await _postRepository.GetByIdAsync(dto.postId);
            if(post == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var currrentUserId = _commonService.GetUserId();
            
            var existingLike = await _likePostRepository.GetLikePost(currrentUserId, dto.postId);
            if (existingLike != null)
            {
                _likePostRepository.RemoveLike(existingLike);
                var isSave = await _likePostRepository.SaveChangesAsync();
                if(!isSave)
                {
                    return ApiResponse.Response(500, "Failed to unlike the post");
                }
                return ApiResponse.Response(200, "Post unliked successfully");
            }
            var newLikePost = new LikePost
            {
                UserId = currrentUserId,
                PostId = dto.postId,
                CreatedAt = DateTime.UtcNow
            };
            await _likePostRepository.AddLikeAsync(newLikePost);
            var isLiked = await _likePostRepository.SaveChangesAsync();
            if(!isLiked)
            {
                return ApiResponse.Response(500, "Failed to like the post");
            }
            return ApiResponse.Response(200, "Post liked successfully");
        }
    }
}
