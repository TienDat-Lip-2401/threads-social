using Pharse2.Models.DtoModels;
using Pharse2.Models.DtoModels.Comment;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    // DB lưu đường dẫn tương đối (ảnh bài/comment, avatar) → đổi thành URL đầy đủ trước khi trả cho FE
    public static class MediaUrlExtensions
    {
        public static PostResponseDto? WithPublicUrls(this PostResponseDto? post, IMediaStorage storage)
        {
            if (post == null) return null;
            post.MediaUrls = storage.ToPublicUrls(post.MediaUrls);
            post.User.AvatarUrl = storage.ToPublicUrl(post.User.AvatarUrl);
            if (post.QuotedPost != null)
            {
                post.QuotedPost.MediaUrls = storage.ToPublicUrls(post.QuotedPost.MediaUrls);
                post.QuotedPost.User.AvatarUrl = storage.ToPublicUrl(post.QuotedPost.User.AvatarUrl);
            }
            return post;
        }

        public static PostCommentDto? WithPublicUrls(this PostCommentDto? comment, IMediaStorage storage)
        {
            if (comment == null) return null;
            comment.MediaUrls = storage.ToPublicUrls(comment.MediaUrls);
            comment.User.AvatarUrl = storage.ToPublicUrl(comment.User.AvatarUrl);
            return comment;
        }
    }
}
