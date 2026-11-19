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


        public PostService(IPostRepository postRepository, ICommonService commonService, ILogger<PostService> logger)
        {
            _postRepository = postRepository;
            _commonService = commonService;
            _logger = logger;
        }
        public async Task<ApiResponse> CreatePostAsync(PostRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            var now = DateTime.UtcNow;
            var newPost = new Post
            {
                UserId = _commonService.GetUserId(),
                Content = dto.Content.Trim(),
                CreatedAt = now,
                UpdatedAt = now // không gán thì EF ghi 0001-01-01
            };
            await _postRepository.CreateAsync(newPost);
            var isSaved = await _postRepository.SaveChangesAsync();
            if(!isSaved)
            {
                return ApiResponse.Response(500, "Failed to create post");
            }
            // FE thêm bài mới lên đầu feed nên cần nguyên object bài viết (user, counts...)
            var created = await _postRepository.GetPostDtoByIdAsync(newPost.Id, _commonService.GetUserId());
            return ApiResponse.Response(201, "Post created successfully", created);
        }

        public async Task<ApiResponse> DeletePostAsync(int id)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null) return ApiResponse.Response(404, "Post not found");
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
            return ApiResponse.Response(200, "Post retrieved successfully", post);
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
            if(posts.Count == 0)
            {
                return ApiResponse.Response(404, "This user has no posts yet or does not exist.");
            }
            return ApiResponse.Response(200, "Posts retrieved successfully", posts);
        }

        // Trả { data: [...posts], pagination: {...} } đúng dạng FE đọc
        public async Task<ApiResponse> GetFeedAsync(int pageNumber, int pageSize)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50); // chặn per_page quá lớn
            var page = await _postRepository.GetFeedAsync(pageNumber, pageSize, _commonService.GetUserId());
            return ApiResponse.Paged(page, "Lấy danh sách thành công!");
        }
    }
}
