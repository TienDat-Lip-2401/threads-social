using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.Comment;

namespace Pharse2.Services.Interfaces
{
    public interface ICommentService
    {
        Task<ApiResponse> GetAllCommentsAsync();
        Task<ApiResponse> GetCommentByIdAsync(int id);
        Task<ApiResponse> CreateCommentAsync(CommentRequestDto dto);
        Task<ApiResponse> UpdateCommentAsync(int id, CommentUpdateRequestDto dto);
        Task<ApiResponse> DeleteCommentAsync(int id);
        Task<ApiResponse> GetCommentRepliesByIdAsync(int id);
        Task<ApiResponse> GetLikesCommentByIdAsync(int id);
        Task<ApiResponse> CreatePostCommentAsync(int postId, PostFormRequestDto dto);
        Task<ApiResponse> GetPostCommentsAsync(int postId, int pageNumber, int pageSize);
    }
}
