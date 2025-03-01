using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CryptoTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCoinModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Coins_CoinId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Coins",
                table: "Coins");

            migrationBuilder.DropColumn(
                name: "CoinId",
                table: "Coins");

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "Coins",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Coins",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "QuoteAsset",
                table: "Coins",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Coins",
                table: "Coins",
                column: "Symbol");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Coins_CoinId",
                table: "Transactions",
                column: "CoinId",
                principalTable: "Coins",
                principalColumn: "Symbol",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Coins_CoinId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Coins",
                table: "Coins");

            migrationBuilder.DropColumn(
                name: "QuoteAsset",
                table: "Coins");

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Coins",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "Coins",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "CoinId",
                table: "Coins",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Coins",
                table: "Coins",
                column: "CoinId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Coins_CoinId",
                table: "Transactions",
                column: "CoinId",
                principalTable: "Coins",
                principalColumn: "CoinId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
