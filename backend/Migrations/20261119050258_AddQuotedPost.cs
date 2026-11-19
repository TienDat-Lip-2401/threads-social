using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharse2.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotedPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuotedPostId",
                table: "Post",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Post_QuotedPostId",
                table: "Post",
                column: "QuotedPostId");

            migrationBuilder.AddForeignKey(
                name: "FK_Post_Post_QuotedPostId",
                table: "Post",
                column: "QuotedPostId",
                principalTable: "Post",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Post_Post_QuotedPostId",
                table: "Post");

            migrationBuilder.DropIndex(
                name: "IX_Post_QuotedPostId",
                table: "Post");

            migrationBuilder.DropColumn(
                name: "QuotedPostId",
                table: "Post");
        }
    }
}
