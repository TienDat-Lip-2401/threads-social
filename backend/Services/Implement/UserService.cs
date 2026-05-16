using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels.User;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<ApiResponse> GetMeAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if(user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Tài khoản không tồn tại hoặc đã bị khóa.");
            }
            var result = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
            };
            return ApiResponse.Response(200, "Thành công", result);
        }

        public async Task<ApiResponse> GetUserInfoById(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if(user == null)
            {
                return ApiResponse.Response(404, "Khong tim thay User");
            }
            return ApiResponse.Response(201, "Da tim thay User!", user);
        }
    }
}
