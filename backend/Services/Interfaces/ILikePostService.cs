using Pharse2.Models.CommonModels;

namespace Pharse2.Services.Interfaces
{
    public interface ILikePostService
    {
        //Toggle like/unlike a post
        Task<ApiResponse> ToggleLikePostAsync(int postId);
        //Get ra danh sach user thich bai viet
        Task<ApiResponse> GetLikersByPostIdAsync(int postId);
    }
}
