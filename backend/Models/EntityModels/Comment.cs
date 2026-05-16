using Pharse2.Models.EntityModels;
using System;
using System.Collections.Generic;

namespace Pharse2.Models;

public partial class Comment : EntityBaseModel
{

    public int PostId { get; set; }

    public int UserId { get; set; }

    public int? ParentCommentId { get; set; }

    public string Content { get; set; } = null!;

    public virtual ICollection<Comment> InverseParentComment { get; set; } = new List<Comment>();

    public virtual ICollection<LikeComment> LikeComments { get; set; } = new List<LikeComment>();

    public virtual Comment? ParentComment { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
