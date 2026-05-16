using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharse2.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseEntityFieldsToAllTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Danh sách các bảng cần thêm cột (vì tất cả đều kế thừa EntityBaseModel)
            var tables = new[] { "Post", "User", "Comment" };

            foreach (var table in tables)
            {
                // 1. Thêm cột DeleteFlg
                migrationBuilder.AddColumn<bool>(
                    name: "DeleteFlg",
                    table: table,
                    type: "bit",
                    nullable: false,
                    defaultValue: false);

                // 2. Thêm cột UpdatedAt
                migrationBuilder.AddColumn<DateTime>(
                    name: "UpdatedAt",
                    table: table,
                    type: "datetime2",
                    nullable: false,
                    defaultValueSql: "GETDATE()");
            }
        }
    }
}
