using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharse2.Migrations
{
    /// <inheritdoc />
    public partial class AddUserVerified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // Tài khoản quản trị đầu tiên (đã xác thực email, có tích xanh).
            // Chỉ lưu hash BCrypt; mật khẩu không nằm trong repo → đổi mật khẩu sau lần đăng nhập đầu.
            // Bỏ qua nếu DB đã có user trùng username / email.
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM [User] WHERE [Username] = N'admin' OR [Email] = N'admin@threadclone.local')
    INSERT INTO [User] ([Username], [Email], [Password], [Role], [EmailVerifiedAt], [Name], [IsVerified], [CreatedAt], [UpdatedAt], [DeleteFlg])
    VALUES (N'admin', N'admin@threadclone.local', N'$2a$11$4jba58k5ICv/bd5ouFSG7O8IMnhb2dOexJX438YUTQkhLoWuBz362', N'Admin', SYSUTCDATETIME(), N'Admin', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), 0);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Không xóa tài khoản admin: có thể đã có bài viết / token tham chiếu tới.
            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "User");
        }
    }
}
