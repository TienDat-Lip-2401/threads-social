using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.LikePost;

namespace Pharse2.Services.Interfaces
{
    public interface ILikePostService
    {
        //Toggle like/unlike a post
        Task<ApiResponse> ToggleLikePostAsync(LikePostRequestDto dto);
        //Get ra danh sach user thich bai viet
        Task<ApiResponse> GetLikersByPostIdAsync(int postId);
        // Check user da thich bai viet chua
        Task<ApiResponse> CheckUserLikePost(LikePostRequestDto dto);
    }
}
