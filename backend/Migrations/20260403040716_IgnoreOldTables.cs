using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharse2.Migrations
{
    /// <summary>
    /// Baseline: tạo các bảng gốc (trước đây được tạo bằng script ngoài EF, nên migration này từng rỗng).
    /// DB nào đã ghi nhận migration này trong __EFMigrationsHistory sẽ KHÔNG chạy lại;
    /// chỉ DB mới (vd. SQL Server trong Docker) mới chạy để có đủ bảng cho các migration sau.
    /// Cột DeleteFlg/UpdatedAt của Post/User/Comment do migration AddBaseEntityFieldsToAllTables thêm sau.
    /// </summary>
    public partial class IgnoreOldTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__User__3214EC071C4B9939", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Post",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Post__3214EC07229E9D19", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Post_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PostId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ParentCommentId = table.Column<int>(type: "int", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Comment__3214EC07AD07D8F3", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comment_Parent",
                        column: x => x.ParentCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Comment_Post",
                        column: x => x.PostId,
                        principalTable: "Post",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LikePost",
                columns: table => new
                {
                    PostId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LikePost__7B6AECDC88EFBA6E", x => new { x.PostId, x.UserId });
                    table.ForeignKey(
                        name: "FK_LikePost_Post",
                        column: x => x.PostId,
                        principalTable: "Post",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LikePost_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            // CreatedAt nullable: migration AddAuthEnterprise đổi sang NOT NULL sau
            migrationBuilder.CreateTable(
                name: "LikeComment",
                columns: table => new
                {
                    CommentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__LikeComm__12CC530ED994EBAC", x => new { x.CommentId, x.UserId });
                    table.ForeignKey(
                        name: "FK_LikeComment_Comment",
                        column: x => x.CommentId,
                        principalTable: "Comment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LikeComment_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(name: "IX_Post_UserId", table: "Post", column: "UserId");
            migrationBuilder.CreateIndex(name: "IX_Comment_ParentCommentId", table: "Comment", column: "ParentCommentId");
            migrationBuilder.CreateIndex(name: "IX_Comment_PostId", table: "Comment", column: "PostId");
            migrationBuilder.CreateIndex(name: "IX_Comment_UserId", table: "Comment", column: "UserId");
            migrationBuilder.CreateIndex(name: "IX_LikePost_UserId", table: "LikePost", column: "UserId");
            migrationBuilder.CreateIndex(name: "IX_LikeComment_UserId", table: "LikeComment", column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LikeComment");
            migrationBuilder.DropTable(name: "LikePost");
            migrationBuilder.DropTable(name: "Comment");
            migrationBuilder.DropTable(name: "Post");
            migrationBuilder.DropTable(name: "User");
        }
    }
}
