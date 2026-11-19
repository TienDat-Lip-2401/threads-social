using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Pharse2.Models.EntityModels;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<LikeComment> LikeComments { get; set; }

    public virtual DbSet<LikePost> LikePosts { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<User> Users { get; set; }
    
    public virtual DbSet<RefreshToken> RefreshToken { get; set; }

    public virtual DbSet<Media> Media { get; set; }

    public virtual DbSet<UserToken> UserTokens { get; set; }

    public virtual DbSet<Repost> Reposts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Comment__3214EC07AD07D8F3");

            entity.ToTable("Comment");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.ParentComment).WithMany(p => p.InverseParentComment)
                .HasForeignKey(d => d.ParentCommentId)
                .HasConstraintName("FK_Comment_Parent");

            entity.HasOne(d => d.Post).WithMany(p => p.Comments)
                .HasForeignKey(d => d.PostId)
                .HasConstraintName("FK_Comment_Post");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comment_User");
        });

        modelBuilder.Entity<LikeComment>(entity =>
        {
            entity.HasKey(e => new { e.CommentId, e.UserId }).HasName("PK__LikeComm__12CC530ED994EBAC");

            entity.ToTable("LikeComment");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Comment).WithMany(p => p.LikeComments)
                .HasForeignKey(d => d.CommentId)
                .HasConstraintName("FK_LikeComment_Comment");

            entity.HasOne(d => d.User).WithMany(p => p.LikeComments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LikeComment_User");
        });

        modelBuilder.Entity<LikePost>(entity =>
        {
            entity.HasKey(e => new { e.PostId, e.UserId }).HasName("PK__LikePost__7B6AECDC88EFBA6E");

            entity.ToTable("LikePost");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Post).WithMany(p => p.LikePosts)
                .HasForeignKey(d => d.PostId)
                .HasConstraintName("FK_LikePost_Post");

            entity.HasOne(d => d.User).WithMany(p => p.LikePosts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LikePost_User");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Post__3214EC07229E9D19");

            entity.ToTable("Post");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Posts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC071C4B9939");

            entity.ToTable("User");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Username).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Bio).HasMaxLength(160);
            entity.Property(e => e.AvatarPath).HasMaxLength(255);
        });

        modelBuilder.Entity<Media>(entity =>
        {
            entity.ToTable("Media");

            entity.Property(e => e.Path).HasMaxLength(255);

            // Xóa bài → DB tự xóa ảnh của bài và ảnh của các comment trong bài
            entity.HasOne(d => d.Post).WithMany(p => p.Media)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // SQL Server không cho 2 đường cascade (Post→Comment→Media và Post→Media)
            // nên xóa comment phải tự xóa Media của comment trước (CommentRepository.DeleteByIdAsync)
            entity.HasOne(d => d.Comment).WithMany(p => p.Media)
                .HasForeignKey(d => d.CommentId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<UserToken>(entity =>
        {
            entity.ToTable("UserToken");

            entity.Property(e => e.Type).HasMaxLength(30);
            entity.Property(e => e.TokenHash).HasMaxLength(64); // SHA256 dạng hex

            entity.HasIndex(e => e.TokenHash).IsUnique();

            entity.HasOne(d => d.User).WithMany(p => p.UserTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Repost>(entity =>
        {
            entity.HasKey(e => new { e.PostId, e.UserId });

            entity.ToTable("Repost");

            // Tab Reposts trên hồ sơ: lọc theo user, sắp theo thời gian repost
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });

            // Xóa bài → DB tự xóa các repost của bài
            entity.HasOne(d => d.Post).WithMany(p => p.Reposts)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Giống LikePost: không tự xóa theo User (tránh nhiều đường cascade)
            entity.HasOne(d => d.User).WithMany(p => p.Reposts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
