using System;
using System.Collections.Generic;

namespace Pharse2.Models.EntityModels;

public partial class LikeComment
{
    public int CommentId { get; set; }

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Comment Comment { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
