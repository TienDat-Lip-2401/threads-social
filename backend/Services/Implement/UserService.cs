using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.Comment;
using Pharse2.Models.EntityModels;
using Microsoft.EntityFrameworkCore;
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
        private readonly ICommentRepository _commentRepository;
        private readonly IFollowRepository _followRepository;
        private readonly IMediaStorage _mediaStorage;
        private readonly ICommonService _commonService;
        public UserService(IUserRepository userRepository, IPostRepository postRepository, ICommentRepository commentRepository, IFollowRepository followRepository, IMediaStorage mediaStorage, ICommonService commonService)
        {
            _followRepository = followRepository;
            _commentRepository = commentRepository;
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
            Verified = user.IsVerified,
            Role = user.Role,
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
            var viewerId = _commonService.GetUserId();
            var preview = await _followRepository.GetFollowersPreviewAsync(user.Id, 3);
            preview.ForEach(u => u.AvatarUrl = _mediaStorage.ToPublicUrl(u.AvatarUrl));
            var profile = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Name = user.Name,
                Bio = user.Bio,
                AvatarUrl = _mediaStorage.ToPublicUrl(user.AvatarPath),
                PostsCount = await _postRepository.CountByUserAsync(user.Id),
                IsMe = user.Id == viewerId,
                Verified = user.IsVerified,
                FollowersCount = await _followRepository.CountFollowersAsync(user.Id),
                FollowingCount = await _followRepository.CountFollowingAsync(user.Id),
                IsFollowing = viewerId != 0 && await _followRepository.ExistsAsync(viewerId, user.Id),
                FollowersPreview = preview,
            };
            return ApiResponse.Response(200, "Thành công", profile);
        }

        // FE: GET users/{username}/posts?page=&per_page= → { data: [...], pagination: {...} }
        public Task<ApiResponse> GetUserPostsAsync(string username, int pageNumber, int pageSize) =>
            GetUserPagedPostsAsync(username, pageNumber, pageSize, _postRepository.GetUserPostsAsync);

        // FE: GET users/{username}/reposts?page=&per_page= → bài user đã repost
        public Task<ApiResponse> GetUserRepostsAsync(string username, int pageNumber, int pageSize) =>
            GetUserPagedPostsAsync(username, pageNumber, pageSize, _postRepository.GetUserRepostsAsync);

        // FE: GET users/{username}/media?page=&per_page= → bài của user có ảnh
        public Task<ApiResponse> GetUserMediaAsync(string username, int pageNumber, int pageSize) =>
            GetUserPagedPostsAsync(username, pageNumber, pageSize, _postRepository.GetUserMediaPostsAsync);

        // FE: GET users/{username}/replies?page=&per_page= → comment của user, mỗi comment kèm bài gốc
        public async Task<ApiResponse> GetUserRepliesAsync(string username, int pageNumber, int pageSize)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            (pageNumber, pageSize) = NormalizePage(pageNumber, pageSize);
            var page = await _commentRepository.GetUserCommentsAsync(user.Id, pageNumber, pageSize);
            // Query thứ 2 lấy bài gốc của cả trang (repo đã lọc comment của bài bị xóa)
            var posts = (await _postRepository.GetPostDtosByIdsAsync(page.Items.Select(c => c.ParentId), _commonService.GetUserId()))
                .ToDictionary(p => p.Id, p => p.WithPublicUrls(_mediaStorage)!);
            var items = page.Items
                .Where(c => posts.ContainsKey(c.ParentId)) // bài vừa bị xóa giữa 2 query → bỏ
                .Select(c =>
                {
                    c.WithPublicUrls(_mediaStorage);
                    return new UserReplyDto
                    {
                        Id = c.Id, ParentId = c.ParentId, Content = c.Content,
                        CreatedAt = c.CreatedAt, UpdatedAt = c.UpdatedAt, User = c.User,
                        MediaUrls = c.MediaUrls, LikesCount = c.LikesCount, RepliesCount = c.RepliesCount,
                        Post = posts[c.ParentId],
                    };
                }).ToList();
            return ApiResponse.Paged(new PagedResult<UserReplyDto>(items, page.TotalItems, page.CurrentPage, page.PageSize), "Lấy danh sách thành công!");
        }

        // FE: POST users/{username}/follow → theo dõi nếu chưa, bỏ theo dõi nếu đã theo dõi
        // Trả { is_following, followers_count } để FE đồng bộ số liệu thật
        public async Task<ApiResponse> ToggleFollowAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            var currentUserId = _commonService.GetUserId();
            if (user.Id == currentUserId)
            {
                return ApiResponse.ValidationError(new() { ["username"] = ["Không thể tự theo dõi chính mình!"] });
            }
            var existing = await _followRepository.GetAsync(currentUserId, user.Id);
            if (existing != null)
            {
                _followRepository.Remove(existing);
            }
            else
            {
                await _followRepository.AddAsync(new Follow
                {
                    FollowerId = currentUserId,
                    FolloweeId = user.Id,
                    CreatedAt = DateTime.UtcNow,
                });
            }
            try
            {
                await _followRepository.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // 2 request cùng lúc (bấm liên tục): request kia đã thêm/xóa trước → trả trạng thái hiện tại
            }
            var result = new
            {
                IsFollowing = await _followRepository.ExistsAsync(currentUserId, user.Id),
                FollowersCount = await _followRepository.CountFollowersAsync(user.Id),
            };
            return ApiResponse.Response(200, result.IsFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi", result);
        }

        // FE: GET users/{username}/followers?page=&per_page=
        public Task<ApiResponse> GetFollowersAsync(string username, int pageNumber, int pageSize) =>
            GetFollowListAsync(username, pageNumber, pageSize, _followRepository.GetFollowersAsync);

        // FE: GET users/{username}/following?page=&per_page=
        public Task<ApiResponse> GetFollowingAsync(string username, int pageNumber, int pageSize) =>
            GetFollowListAsync(username, pageNumber, pageSize, _followRepository.GetFollowingAsync);

        private async Task<ApiResponse> GetFollowListAsync(string username, int pageNumber, int pageSize,
            Func<int, int, int, int, Task<PagedResult<FollowUserDto>>> query)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            (pageNumber, pageSize) = NormalizePage(pageNumber, pageSize);
            var page = await query(user.Id, pageNumber, pageSize, _commonService.GetUserId());
            page.Items.ForEach(u => u.AvatarUrl = _mediaStorage.ToPublicUrl(u.AvatarUrl));
            return ApiResponse.Paged(page, "Lấy danh sách thành công!");
        }

        // Admin: PUT admin/users/{username}/verified { verified } → cấp / gỡ tích xanh
        public async Task<ApiResponse> SetVerifiedAsync(string username, bool verified)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            user.IsVerified = verified;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync();
            return ApiResponse.Response(200, verified ? "Đã cấp tích xanh" : "Đã gỡ tích xanh",
                new { user.Username, Verified = user.IsVerified });
        }

        private static (int, int) NormalizePage(int pageNumber, int pageSize) =>
            (Math.Max(1, pageNumber), pageSize < 1 ? 10 : Math.Min(pageSize, 50));

        // Dùng chung cho tab Threads / Reposts / Media: tìm user theo username, chuẩn hóa phân trang, đổi URL ảnh
        private async Task<ApiResponse> GetUserPagedPostsAsync(string username, int pageNumber, int pageSize,
            Func<int, int, int, int, Task<PagedResult<PostResponseDto>>> query)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || user.DeleteFlg)
            {
                return ApiResponse.Response(404, "Không tìm thấy người dùng.");
            }
            (pageNumber, pageSize) = NormalizePage(pageNumber, pageSize);
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
