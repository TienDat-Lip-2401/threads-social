using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.User;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly ICommonService _commonService;
        private readonly ILogger<PostService> _logger;
        private readonly IMediaStorage _mediaStorage;


        public PostService(IPostRepository postRepository, ICommonService commonService, ILogger<PostService> logger, IMediaStorage mediaStorage)
        {
            _postRepository = postRepository;
            _commonService = commonService;
            _logger = logger;
            _mediaStorage = mediaStorage;
        }
        public async Task<ApiResponse> CreatePostAsync(PostFormRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            var mediaErrors = _mediaStorage.Validate(dto.Media);
            if (mediaErrors != null)
            {
                return ApiResponse.ValidationError(mediaErrors);
            }
            if (dto.QuotedPostId.HasValue)
            {
                var quoted = await _postRepository.GetByIdAsync(dto.QuotedPostId.Value);
                if (quoted == null || quoted.DeleteFlg)
                {
                    return ApiResponse.ValidationError(new() { ["quoted_post_id"] = ["Bài viết được trích dẫn không tồn tại!"] });
                }
            }
            var paths = dto.Media is { Count: > 0 } ? await _mediaStorage.SaveAsync(dto.Media) : new List<string>();
            var now = DateTime.UtcNow;
            var newPost = new Post
            {
                UserId = _commonService.GetUserId(),
                Content = dto.Content.Trim(),
                QuotedPostId = dto.QuotedPostId,
                CreatedAt = now,
                UpdatedAt = now, // không gán thì EF ghi 0001-01-01
                Media = paths.Select((path, i) => new Media { Path = path, SortOrder = i, CreatedAt = now, UpdatedAt = now }).ToList()
            };
            try
            {
                await _postRepository.CreateAsync(newPost);
                if (!await _postRepository.SaveChangesAsync())
                {
                    _mediaStorage.Delete(paths);
                    return ApiResponse.Response(500, "Failed to create post");
                }
            }
            catch
            {
                _mediaStorage.Delete(paths); // lưu DB lỗi → không để file rác
                throw;
            }
            // FE thêm bài mới lên đầu feed nên cần nguyên object bài viết (user, counts...)
            var created = await _postRepository.GetPostDtoByIdAsync(newPost.Id, _commonService.GetUserId());
            return ApiResponse.Response(201, "Post created successfully", created.WithPublicUrls(_mediaStorage));
        }


        public async Task<ApiResponse> DeletePostAsync(int id)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null || post.DeleteFlg) return ApiResponse.Response(404, "Post not found");
            int currentUserId = _commonService.GetUserId();
            if (post.UserId != currentUserId)
            {
                return ApiResponse.Response(403, "You do not have permission to delete another user's post!");
            }
            var isDeleted = await _postRepository.DeleteByIdAsync(id);
            if(!isDeleted)
            {
                return ApiResponse.Response(500, "Failed to deleted post");
            }
            return ApiResponse.Response(200, "Post deleted successfully");
        }

        

        public async Task<ApiResponse> GetPostByIdAsync(int id)
        {
            var post = await _postRepository.GetPostDtoByIdAsync(id, _commonService.GetUserId());
            if(post == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            return ApiResponse.Response(200, "Post retrieved successfully", post.WithPublicUrls(_mediaStorage));
        }

        public async Task<ApiResponse> UpdatePostAsync(int id, PostRequestDto dto)
        {
            if(string.IsNullOrEmpty(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            var post = await _postRepository.GetByIdAsync(id);
            if(post == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var currentUserId  = _commonService.GetUserId();
            if(currentUserId != post.UserId)
            {
                return ApiResponse.Response(403, "You are not authorized to update this post");
            }
            post.Content = dto.Content;
            post.UpdatedAt = DateTime.UtcNow;
            await _postRepository.UpdateAsync(post);
            var isSaved = await _postRepository.SaveChangesAsync();
            if(!isSaved)
            {
                return ApiResponse.Response(500, "Failed to update post");
            }
            return ApiResponse.Response(200, "Post updated successfully");

        }

        public async Task<ApiResponse> GetUsersLikePostAsync(int id)
        {
            var users = await _postRepository.GetUsersLikePostByIdAsync(id);
            if(users == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var userList = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                //CreatedAt = u.CreatedAt,
                //UpdatedAt = u.UpdatedAt,
                //// Nếu muốn đếm số lượng bài viết/comment của user đó
                //PostCount = u.Posts?.Count ?? 0,
                //CommentCount = u.Comments?.Count ?? 0
            }).ToList();
            return ApiResponse.Response(200, "Users who liked the post retrieved successfully", userList);

        }

        public async Task<ApiResponse> GetPostsByUserIdAsync(int userId)
        {
            var posts = await _postRepository.GetPostsByUserIdAsync(userId, _commonService.GetUserId());
            posts.ForEach(p => p.WithPublicUrls(_mediaStorage));
            if(posts.Count == 0)
            {
                return ApiResponse.Response(404, "This user has no posts yet or does not exist.");
            }
            return ApiResponse.Response(200, "Posts retrieved successfully", posts);
        }

        // Trả { data: [...posts], pagination: {...} } đúng dạng FE đọc
        // type: "following" → feed Đang theo dõi (bắt buộc đăng nhập); còn lại → Dành cho bạn
        public async Task<ApiResponse> GetFeedAsync(int pageNumber, int pageSize, string? type)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50); // chặn per_page quá lớn
            var viewerId = _commonService.GetUserId();
            var isFollowing = type == "following";
            if (isFollowing && viewerId == 0)
            {
                return ApiResponse.Response(401, "Vui lòng đăng nhập để xem bài của người bạn theo dõi.");
            }
            var page = isFollowing
                ? await _postRepository.GetFollowingFeedAsync(pageNumber, pageSize, viewerId)
                : await _postRepository.GetFeedAsync(pageNumber, pageSize, viewerId);
            page.Items.ForEach(p => p.WithPublicUrls(_mediaStorage));
            return ApiResponse.Paged(page, "Lấy danh sách thành công!");
        }
    }
}
