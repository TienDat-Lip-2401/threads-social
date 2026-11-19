using Pharse2.Models.CommonModels;

namespace Pharse2.Services.Interfaces
{
    public interface IRepostService
    {
        Task<ApiResponse> ToggleRepostAsync(int postId);
    }
}
