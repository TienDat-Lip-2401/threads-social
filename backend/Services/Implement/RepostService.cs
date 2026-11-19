using Microsoft.EntityFrameworkCore;
using Pharse2.Models.CommonModels;
using Pharse2.Models.EntityModels;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class RepostService : IRepostService
    {
        private readonly IRepostRepository _repostRepository;
        private readonly IPostRepository _postRepository;
        private readonly ICommonService _commonService;

        public RepostService(IRepostRepository repostRepository, IPostRepository postRepository, ICommonService commonService)
        {
            _repostRepository = repostRepository;
            _postRepository = postRepository;
            _commonService = commonService;
        }

        // FE: POST posts/{id}/repost → repost nếu chưa, gỡ nếu đã repost
        // Trả { is_reposted, reposts_and_quotes_count } để FE đồng bộ số liệu thật
        public async Task<ApiResponse> ToggleRepostAsync(int postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || post.DeleteFlg)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var currentUserId = _commonService.GetUserId();
            var existing = await _repostRepository.GetAsync(currentUserId, postId);
            if (existing != null)
            {
                _repostRepository.Remove(existing);
            }
            else
            {
                await _repostRepository.AddAsync(new Repost
                {
                    UserId = currentUserId,
                    PostId = postId,
                    CreatedAt = DateTime.UtcNow
                });
            }
            try
            {
                await _repostRepository.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // 2 request cùng lúc (bấm liên tục): request kia đã thêm/xóa trước → trả trạng thái hiện tại
            }
            var result = new
            {
                IsReposted = await _repostRepository.ExistsAsync(currentUserId, postId),
                RepostsAndQuotesCount = await _repostRepository.CountAsync(postId)
            };
            return ApiResponse.Response(200, result.IsReposted ? "Post reposted successfully" : "Repost removed successfully", result);
        }
    }
}
