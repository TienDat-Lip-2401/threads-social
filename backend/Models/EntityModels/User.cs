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

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<LikeComment> LikeComments { get; set; } = new List<LikeComment>();

    public virtual ICollection<LikePost> LikePosts { get; set; } = new List<LikePost>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
