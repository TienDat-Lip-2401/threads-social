using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.LikeComment;
using Pharse2.Models.DtoModels.User;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class LikeCommentService : ILikeCommentService
    {
        private readonly ILikeCommentRepository _likeCommentRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly ICommonService _commonService;
        public LikeCommentService(ILikeCommentRepository likeCommentRepository, ICommentRepository commentRepository, ICommonService commonService)
        {
            _likeCommentRepository = likeCommentRepository;
            _commentRepository = commentRepository;
            _commonService = commonService;
        }

        public async Task<ApiResponse> GetLikersByCommentIdAsync(int commentId)
        {
            var users = await _likeCommentRepository.GetLikersAsync(commentId);
            var res = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
            });

            return ApiResponse.Response(200, "Lấy danh sách thành công", res);
        }

        public async Task<ApiResponse> ToggleLikeCommentAsync(LikeCommentRequestDto dto)
        {
            
            var comment = await _commentRepository.GetByIdAsync(dto.CommentId);
            if(comment == null)
            {
                return ApiResponse.Response(404, "Khong tim thay Comment!");
            }
            var currentUserId = _commonService.GetUserId();
            var existingLike = await _likeCommentRepository.GetLikeComment(currentUserId, dto.CommentId);
            if(existingLike != null)
            {
                _likeCommentRepository.RemoveLike(existingLike);
                await _likeCommentRepository.SaveChangesAsync();
                return ApiResponse.Response(200, "Da bo thich Comment!");
            }
            var newLikeComment = new LikeComment
            {
                UserId = currentUserId,
                CommentId = dto.CommentId,
                CreatedAt = DateTime.UtcNow,
            };
            await _likeCommentRepository.AddLikeAsync(newLikeComment);
            await _likeCommentRepository.SaveChangesAsync();
            return ApiResponse.Response(201, "Đã thích bình luận");
        }
    }
}
