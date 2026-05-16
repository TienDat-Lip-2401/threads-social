using System;
using System.Collections.Generic;

namespace Pharse2.Models.EntityModels;

public partial class LikePost
{
    public int PostId { get; set; }

    public int UserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
