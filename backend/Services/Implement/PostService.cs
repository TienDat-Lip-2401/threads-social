using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.Comment;
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
        public async Task<ApiResponse> GetAllPostsAsync()
        {
            var posts = await _postRepository.GetAllAsync();
            var result = posts.Select(p => new PostResponseDto
            {
                Id = p.Id,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                UserId = p.UserId,
                AuthorName = p.User.Username,
                CommentCount = p.Comments.Count,
                LikeCount = p.LikePosts.Count
            }).ToList();
            return ApiResponse.Response(200, "Posts retrieved successfully", result);
        }
        public async Task<ApiResponse> CreatePostAsync(PostRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            int currentId = _commonService.GetUserId();
            //if(currentId !=dto.UserId)
            //{
            //    return ApiResponse.Response(403, "You do not have permission to access this user");
            //}
           
            var newPost = new Post
            {
                UserId = currentId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };
            await _postRepository.CreateAsync(newPost);
            var isSaved = await _postRepository.SaveChangesAsync();
            if(!isSaved)
            {
                return ApiResponse.Response(500, "Failed to create post");
            }
            return ApiResponse.Response(201, "Post created successfully", newPost.Id);
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
            var post  = await _postRepository.GetByIdAsync(id);
            if(post == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var result = new PostResponseDto
            {
                Id = post.Id,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                UpdatedAt = DateTime.UtcNow,
                UserId = post.UserId,
                AuthorName = post.User.Username,
                CommentCount = post.Comments.Count,
                LikeCount = post.LikePosts.Count
            };
            return ApiResponse.Response(200, "Post retrieved successfully", result);
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

        public async Task<ApiResponse> GetCommentsPostAsync(int id)
        {
            var comments = await _postRepository.GetCommentsPostByIdAsync(id);
            if(comments == null)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var result = comments.Select(c => new CommentResponseDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Username = c.User.Username,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                
                
            }).ToList();
            return ApiResponse.Response(200, "Comments retrieved successfully", result);
        }

        public async Task<ApiResponse> GetPostsByUserIdAsync(int userId)
        {
            var posts = await _postRepository.GetPostsByUserIdAsync(userId);
            if(posts == null || !posts.Any())
            {
                return ApiResponse.Response(404, "This user has no posts yet or does not exist.");
            }
            var result = posts.Select(p => new PostResponseDto
            {
                Id = p.Id,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                UserId = p.UserId,
                AuthorName = p.User.Username,
                CommentCount = p.Comments.Count,
                LikeCount = p.LikePosts.Count
            }).ToList();
            return ApiResponse.Response(200, "Posts retrieved successfully", result);
        }

        public async Task<ApiResponse> GetPostAsync(int pageNumber, int pageSize)
        {
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 10 : pageSize;
            var pagedEntities = await _postRepository.GetPagedPostsAsync(pageNumber, pageSize);
            var postsDto = pagedEntities.Items.Select(p => new PostResponseDto
            {
                Id = p.Id,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                UserId = p.UserId,
                AuthorName = p.User.Username,
                CommentCount = p.Comments.Count,
                LikeCount = p.LikePosts.Count
            }).ToList();
            var result = new PagedResult<PostResponseDto>(postsDto, pagedEntities.TotalItems, pagedEntities.CurrentPage, pagedEntities.PageSize);
            return ApiResponse.Response(200, "Lấy danh sách thành công!", result);
        }
    }
}
