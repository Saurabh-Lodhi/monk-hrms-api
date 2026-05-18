// ─── NEW MIGRATION: AddLeaveTypeConfigAndAccrual ──────────────────────────────
// Run: dotnet ef migrations add AddLeaveTypeConfigAndAccrual
// Then: dotnet ef database update
// OR: the auto-migrate in Program.cs will pick it up on next run

// This migration creates:
// 1. LeaveTypeConfigs table
// 2. LeaveAccrualLogs table
// 3. Adds RelatedLeaveId column to Notifications table

using Microsoft.EntityFrameworkCore.Migrations;

public partial class AddLeaveTypeConfigAndAccrual : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "LeaveTypeConfigs",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy",
                        Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Company = table.Column<string>(nullable: false, defaultValue: "all"),
                LeaveTypeCode = table.Column<string>(nullable: false),
                IsEnabled = table.Column<bool>(nullable: false, defaultValue: true),
                AnnualLimit = table.Column<int>(nullable: false, defaultValue: 0),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedById = table.Column<int>(nullable: false),
            },
            constraints: table => table.PrimaryKey("PK_LeaveTypeConfigs", x => x.Id));

        migrationBuilder.CreateTable(
            name: "LeaveAccrualLogs",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy",
                        Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Year = table.Column<int>(nullable: false),
                Month = table.Column<int>(nullable: false),
                ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                EmployeesProcessed = table.Column<int>(nullable: false),
            },
            constraints: table => table.PrimaryKey("PK_LeaveAccrualLogs", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_LeaveAccrualLogs_Year_Month",
            table: "LeaveAccrualLogs",
            columns: new[] { "Year", "Month" },
            unique: true);

        // Add RelatedLeaveId to Notifications
        migrationBuilder.AddColumn<int>(
            name: "RelatedLeaveId",
            table: "Notifications",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("LeaveTypeConfigs");
        migrationBuilder.DropTable("LeaveAccrualLogs");
        migrationBuilder.DropColumn("RelatedLeaveId", "Notifications");
    }
}
