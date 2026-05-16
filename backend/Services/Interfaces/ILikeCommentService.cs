using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.LikeComment;

namespace Pharse2.Services.Interfaces
{
    public interface ILikeCommentService
    {
        Task<ApiResponse> ToggleLikeCommentAsync(LikeCommentRequestDto dto);
        Task<ApiResponse> GetLikersByCommentIdAsync(int commentId);
    }
}
