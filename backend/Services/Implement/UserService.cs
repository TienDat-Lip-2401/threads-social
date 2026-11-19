using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.User;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class UserService : IUserService
    {
        public const int MaxNameLength = 50;
        public const int MaxBioLength = 160;

        private readonly IUserRepository _userRepository;
        private readonly IPostRepository _postRepository;
        private readonly IMediaStorage _mediaStorage;
        private readonly ICommonService _commonService;
        public UserService(IUserRepository userRepository, IPostRepository postRepository, IMediaStorage mediaStorage, ICommonService commonService)
        {
            _userRepository = userRepository;
            _postRepository = postRepository;
            _mediaStorage = mediaStorage;
            _commonService = commonService;
        }

        public async Task<ApiResponse> GetMeAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if(user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Tài khoản không tồn tại hoặc đã bị khóa.");
            }
            return ApiResponse.Response(200, "Thành công", ToCurrentUserDto(user));
        }

        private CurrentUserDto ToCurrentUserDto(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            EmailVerifiedAt = user.EmailVerifiedAt,
            Name = user.Name,
            Bio = user.Bio,
            AvatarUrl = _mediaStorage.ToPublicUrl(user.AvatarPath),
        };

        // FE: PUT auth/user (multipart: name, bio, avatar)
        // Gửi rỗng = xóa tên/bio; không gửi avatar = giữ avatar cũ
        public async Task<ApiResponse> UpdateMeAsync(UpdateProfileRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(_commonService.GetUserId());
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Tài khoản không tồn tại hoặc đã bị khóa.");
            }

            var name = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name.Trim();
            var bio = string.IsNullOrWhiteSpace(dto.Bio) ? null : dto.Bio.Trim();
            var errors = new Dictionary<string, string[]>();
            if (name?.Length > MaxNameLength)
                errors["name"] = new[] { $"Tên tối đa {MaxNameLength} ký tự!" };
            if (bio?.Length > MaxBioLength)
                errors["bio"] = new[] { $"Tiểu sử tối đa {MaxBioLength} ký tự!" };
            if (dto.Avatar != null)
            {
                var avatarErrors = _mediaStorage.Validate(new[] { dto.Avatar });
                if (avatarErrors != null) errors["avatar"] = avatarErrors["media"];
            }
            if (errors.Count > 0)
            {
                return ApiResponse.ValidationError(errors);
            }

            var oldAvatar = user.AvatarPath;
            string? newAvatar = null;
            if (dto.Avatar != null)
            {
                newAvatar = (await _mediaStorage.SaveAsync(new[] { dto.Avatar }))[0];
                user.AvatarPath = newAvatar;
            }
            user.Name = name;
            user.Bio = bio;
            user.UpdatedAt = DateTime.UtcNow;
            try
            {
                await _userRepository.SaveChangesAsync();
            }
            catch
            {
                if (newAvatar != null) _mediaStorage.Delete(new[] { newAvatar }); // lưu DB lỗi → bỏ file mới
                throw;
            }
            // Avatar chỉ thuộc về 1 user → đổi avatar thì xóa file cũ
            if (newAvatar != null && oldAvatar != null)
            {
                _mediaStorage.Delete(new[] { oldAvatar });
            }
            return ApiResponse.Response(200, "Cập nhật trang cá nhân thành công!", ToCurrentUserDto(user));
        }

        // FE: GET users/{username}
        public async Task<ApiResponse> GetProfileAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            var profile = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Name = user.Name,
                Bio = user.Bio,
                AvatarUrl = _mediaStorage.ToPublicUrl(user.AvatarPath),
                PostsCount = await _postRepository.CountByUserAsync(user.Id),
                IsMe = user.Id == _commonService.GetUserId(),
            };
            return ApiResponse.Response(200, "Thành công", profile);
        }

        // FE: GET users/{username}/posts?page=&per_page= → { data: [...], pagination: {...} }
        public Task<ApiResponse> GetUserPostsAsync(string username, int pageNumber, int pageSize) =>
            GetUserPagedPostsAsync(username, pageNumber, pageSize, _postRepository.GetUserPostsAsync);

        // FE: GET users/{username}/reposts?page=&per_page= → bài user đã repost
        public Task<ApiResponse> GetUserRepostsAsync(string username, int pageNumber, int pageSize) =>
            GetUserPagedPostsAsync(username, pageNumber, pageSize, _postRepository.GetUserRepostsAsync);

        // Dùng chung cho tab Threads / Reposts: tìm user theo username, chuẩn hóa phân trang, đổi URL ảnh
        private async Task<ApiResponse> GetUserPagedPostsAsync(string username, int pageNumber, int pageSize,
            Func<int, int, int, int, Task<PagedResult<PostResponseDto>>> query)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            pageNumber = Math.Max(1, pageNumber);
            pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50);
            var page = await query(user.Id, pageNumber, pageSize, _commonService.GetUserId());
            page.Items.ForEach(p => p.WithPublicUrls(_mediaStorage));
            return ApiResponse.Paged(page, "Lấy danh sách thành công!");
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
