using Microsoft.EntityFrameworkCore;
using MonkHRMS.API.Models;

namespace MonkHRMS.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }
        public DbSet<NewsItem> NewsItems { get; set; }
        public DbSet<CalendarEvent> CalendarEvents { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<LeaveTypeConfig> LeaveTypeConfigs { get; set; }
        public DbSet<LeaveAccrualLog> LeaveAccrualLogs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Employee self-reference
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.ReportingTo)
                .WithMany()
                .HasForeignKey(e => e.ReportingToId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<LeaveAccrualLog>()
    .HasIndex(l => new { l.Year, l.Month })
    .IsUnique(); // prevent duplicate accruals

            // Employee → Leaves
            modelBuilder.Entity<LeaveApplication>()
                .HasOne(l => l.Employee)
                .WithMany(e => e.LeaveApplications)
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LeaveApplication>()
                .HasOne(l => l.ApprovedBy)
                .WithMany()
                .HasForeignKey(l => l.ApprovedById)
                .OnDelete(DeleteBehavior.NoAction);

            // Employee → Attendance
            modelBuilder.Entity<AttendanceRecord>()
                .HasOne(a => a.Employee)
                .WithMany(e => e.AttendanceRecords)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique attendance per employee per day
            modelBuilder.Entity<AttendanceRecord>()
                .HasIndex(a => new { a.EmployeeId, a.Date })
                .IsUnique();

            // News author
            modelBuilder.Entity<NewsItem>()
                .HasOne(n => n.Author)
                .WithMany()
                .HasForeignKey(n => n.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Events
            modelBuilder.Entity<CalendarEvent>()
                .HasOne(e => e.RelatedEmployee)
                .WithMany()
                .HasForeignKey(e => e.RelatedEmployeeId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CalendarEvent>()
                .HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // Decimal precision
            modelBuilder.Entity<Employee>()
                .Property(e => e.Salary)
                .HasColumnType("decimal(18,2)");

            // Unique email
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            // Unique employee code
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.EmployeeCode)
                .IsUnique();
        }
    }
}
