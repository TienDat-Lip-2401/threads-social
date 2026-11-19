using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharse2.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerifiedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerifiedAt",
                table: "User",
                type: "datetime2",
                nullable: true);

            // Tài khoản tạo trước khi có xác thực email: coi như đã xác thực để không bị khóa đăng nhập
            migrationBuilder.Sql("UPDATE [User] SET [EmailVerifiedAt] = [CreatedAt] WHERE [EmailVerifiedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerifiedAt",
                table: "User");
        }
    }
}
