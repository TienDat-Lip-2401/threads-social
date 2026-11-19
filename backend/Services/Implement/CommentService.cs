using Pharse2.Models;
using Pharse2.Models.CommonModels;
using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.Comment;
using Pharse2.Models.DtoModels.LikeComment;
using Pharse2.Repositories.Interfaces;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly ICommonService _commonService;
        private readonly IPostRepository _postRepository;
        private readonly IMediaStorage _mediaStorage;
        public CommentService(ICommentRepository commentRepository, ICommonService commonService, IPostRepository postRepository, IMediaStorage mediaStorage)
        {
            _commentRepository = commentRepository;
            _commonService = commonService;
            _postRepository = postRepository;
            _mediaStorage = mediaStorage;
        }

        // FE: POST posts/{id}/comments (multipart: content, media[])
        public async Task<ApiResponse> CreatePostCommentAsync(int postId, PostFormRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                return ApiResponse.ValidationError(new() { ["content"] = ["Nội dung không được để trống!"] });
            }
            var mediaErrors = _mediaStorage.Validate(dto.Media);
            if (mediaErrors != null)
            {
                return ApiResponse.ValidationError(mediaErrors);
            }
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || post.DeleteFlg)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            var paths = dto.Media is { Count: > 0 } ? await _mediaStorage.SaveAsync(dto.Media) : new List<string>();
            var now = DateTime.UtcNow;
            var newComment = new Comment
            {
                UserId = _commonService.GetUserId(),
                PostId = postId,
                Content = dto.Content.Trim(),
                CreatedAt = now,
                UpdatedAt = now,
                // Ảnh của comment vẫn ghi PostId để xóa bài thì DB xóa ảnh theo
                Media = paths.Select((path, i) => new Media { PostId = postId, Path = path, SortOrder = i, CreatedAt = now, UpdatedAt = now }).ToList()
            };
            try
            {
                await _commentRepository.CreateAsync(newComment);
                if (!await _commentRepository.SaveChangesAsync())
                {
                    _mediaStorage.Delete(paths);
                    return ApiResponse.Response(500, "Failed to create comment");
                }
            }
            catch
            {
                _mediaStorage.Delete(paths); // lưu DB lỗi → không để file rác
                throw;
            }
            var created = await _commentRepository.GetCommentDtoByIdAsync(newComment.Id);
            return ApiResponse.Response(201, "Comment created successfully", created.WithPublicUrls(_mediaStorage));
        }


        // FE: GET posts/{id}/comments?page=&per_page= → { data: [...], pagination: {...} }
        public async Task<ApiResponse> GetPostCommentsAsync(int postId, int pageNumber, int pageSize)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || post.DeleteFlg)
            {
                return ApiResponse.Response(404, "Post not found");
            }
            pageNumber = Math.Max(1, pageNumber);
            pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 50);
            var page = await _commentRepository.GetPostCommentsAsync(postId, pageNumber, pageSize);
            page.Items.ForEach(c => c.WithPublicUrls(_mediaStorage));
            return ApiResponse.Paged(page, "Comments retrieved successfully");
        }
        public async Task<ApiResponse> CreateCommentAsync(CommentRequestDto dto)
        {
            if(dto.ParentCommentId.HasValue && dto.ParentCommentId > 0)
            {
                var parentComment = await _commentRepository.GetByIdAsync(dto.ParentCommentId.Value);
                if(parentComment == null)
                {
                    return ApiResponse.Response(404, "Parent comment not found");
                }
                if(parentComment.PostId != dto.PostId)
                {
                    return ApiResponse.Response(400, "Parent comment does not belong to the same post");
                }
            }
            if(string.IsNullOrEmpty(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            var currentUseId = _commonService.GetUserId();
            
            var newComment = new Comment
            {
                UserId = currentUseId,
                
                PostId = dto.PostId,
                Content = dto.Content,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _commentRepository.CreateAsync(newComment);
            var isSave = await _commentRepository.SaveChangesAsync();
            if(!isSave)
            {
                return ApiResponse.Response(500, "Failed to create comment");
            }
            var resultDto = await _commentRepository.GetCommentDtoByIdAsync(newComment.Id);
            return ApiResponse.Response(201, "Comment created successfully", resultDto.WithPublicUrls(_mediaStorage));
        }

        

        public async Task<ApiResponse> DeleteCommentAsync(int id)
        {
            var currentUserId = _commonService.GetUserId();
            var cmt = await _commentRepository.GetByIdAsync(id);
            if(cmt == null)
            {
                return ApiResponse.Response(404, "Comment not found");
            }
            if(currentUserId != cmt.UserId)
            {
                return ApiResponse.Response(403, "You do not have permission to perform this action.");
            }
            var comment = await _commentRepository.DeleteByIdAsync(id);
            if(!comment)
            {
                return ApiResponse.Response(500, "Failed to deleted comment!");
            }
            
            return ApiResponse.Response(200, "Comment deleted successfully", comment);
        }

        public async Task<ApiResponse> GetAllCommentsAsync()
        {
            var comments = await _commentRepository.GetAllAsync();
            var result = comments.Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId,
                PostId = c.PostId,
                ParentCommentId = c.ParentCommentId,
            }).ToList();
            return ApiResponse.Response(200, "Comment retrieved successfully", result);
        }

        public async Task<ApiResponse> GetCommentByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if(comment == null)
            {
                return ApiResponse.Response(404, "Comment not found");
            }
            var result = new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UserId = comment.UserId,
                PostId = comment.PostId,
                ParentCommentId = comment.ParentCommentId,
            };
            return ApiResponse.Response(200, "Comment retrieved successfully", result);
        }

        public async Task<ApiResponse> GetCommentRepliesByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if(comment == null)
            {
                return ApiResponse.Response(404, "Comment not found");
            }
            var comments = await _commentRepository.GetCommentRepliesById(id);
            var list = comments.Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId,
                PostId = c.PostId,
                ParentCommentId = c.ParentCommentId,
                Username = c.User.Username
            }).ToList();
            return ApiResponse.Response(200, "Comment retrieved successfully", list);
        }

        public async Task<ApiResponse> GetLikesCommentByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if( comment == null)
            {
                return ApiResponse.Response(404, "Comment not found");
            }
            var likeComments = await _commentRepository.GetLikesCommentById(id);
            var result = likeComments.Select(lc => new LikeCommentReponseDto
            {
                UserId = lc.UserId,
                CommentId = lc.CommentId,
                CreatedAt = lc.CreatedAt,
                Username = lc.User.Username

            }).ToList();
            return ApiResponse.Response(200, "Comment retrieved successfully", result);
        }

        public async Task<ApiResponse> UpdateCommentAsync(int id, CommentUpdateRequestDto dto)
        {
            if(string.IsNullOrEmpty(dto.Content))
            {
                return ApiResponse.Response(400, "Content cannot be empty");
            }
            var comment = await _commentRepository.GetByIdAsync(id);
            if(comment == null)
            {
                return ApiResponse.Response(404, "Comment not found");
            }
            if(comment.UserId!= _commonService.GetUserId())
            {
                return ApiResponse.Response(403, "You are not authorized to update this comment");
            }
            comment.Content = dto.Content;
            comment.UpdatedAt = DateTime.UtcNow;
            await _commentRepository.UpdateAsync(comment);
            var isSave = await _commentRepository.SaveChangesAsync();
            if (!isSave)
            {
                return ApiResponse.Response(500, "Failed to update comment");
            }
            var resultDto = new CommentUpdateRequestDto
            {
                Content = comment.Content,
            };
            return ApiResponse.Response(200, "Comment updated successfully", resultDto);
        }
    }
}
