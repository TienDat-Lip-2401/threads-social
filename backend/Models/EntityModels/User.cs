using Pharse2.Models.EntityModels;
using System;
using System.Collections.Generic;

namespace Pharse2.Models;

public partial class User : EntityBaseModel
{

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
    public string Role { get; set; } = "User";

    // null = chưa xác thực email → không cho đăng nhập
    public DateTime? EmailVerifiedAt { get; set; }

    // Hồ sơ: tên hiển thị, giới thiệu, ảnh đại diện (đường dẫn tương đối trong wwwroot)
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarPath { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<LikeComment> LikeComments { get; set; } = new List<LikeComment>();

    public virtual ICollection<LikePost> LikePosts { get; set; } = new List<LikePost>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<UserToken> UserTokens { get; set; } = new List<UserToken>();
}
