using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonkHRMS.API.Models
{
    // ─── Employee ──────────────────────────────────────────────────────────────
    public class Employee
    {
        [Key] public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = "employee";
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime DateOfJoining { get; set; }
        public string BloodGroup { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Salary { get; set; }
        public string? Quote { get; set; }
        public int? ReportingToId { get; set; }
        public string EmploymentType { get; set; } = "Full-time";
        public string Gender { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string? FingerprintId { get; set; }
        public string? PanCard { get; set; }
        public string? Aadhar { get; set; }
        public string? BankAccount { get; set; }
        public string? Ifsc { get; set; }
        public string? EmergencyContact { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ReportingToId")]
        public Employee? ReportingTo { get; set; }
        public ICollection<LeaveApplication> LeaveApplications { get; set; } = new List<LeaveApplication>();
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    }

    // ─── Attendance ────────────────────────────────────────────────────────────
    public class AttendanceRecord
    {
        [Key] public int Id { get; set; }
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public string? CheckIn { get; set; }
        public string? CheckOut { get; set; }
        public string Status { get; set; } = "present";
        public string WorkHours { get; set; } = "0";
        public string Source { get; set; } = "manual";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
    }

    // ─── Leave Application ─────────────────────────────────────────────────────
    public class LeaveApplication
    {
        [Key] public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string LeaveType { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int Days { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
        public int? ApprovedById { get; set; }
        public string? RejectionReason { get; set; }
        public bool IsHalfDay { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
        [ForeignKey("ApprovedById")]
        public Employee? ApprovedBy { get; set; }
    }

    // ─── Leave Balance ─────────────────────────────────────────────────────────
    public class LeaveBalance
    {
        [Key] public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int Year { get; set; }
        public int CL { get; set; } = 12;
        public int SL { get; set; } = 12;
        public int EL { get; set; } = 15;
        public int ML { get; set; } = 180;
        public int PL { get; set; } = 15;
        public int LOP { get; set; } = 0;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
    }

    // ─── Leave Type Config ─────────────────────────────────────────────────────
    public class LeaveTypeConfig
    {
        [Key] public int Id { get; set; }
        public string Company { get; set; } = "all";
        public string LeaveTypeCode { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public int AnnualLimit { get; set; } = 0;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int UpdatedById { get; set; }
    }

    // ─── Leave Accrual Log ─────────────────────────────────────────────────────
    public class LeaveAccrualLog
    {
        [Key] public int Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public int EmployeesProcessed { get; set; }
    }

    // ─── News / Announcement ───────────────────────────────────────────────────
    // Single canonical model — removed the duplicate `News` class
    public class NewsItem
    {
        [Key] public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsUrgent { get; set; } = false;
        public bool IsPinned { get; set; } = false;
        public int AuthorId { get; set; }
        public int Views { get; set; } = 0;
        public string Tags { get; set; } = string.Empty; // comma-separated
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        [ForeignKey("AuthorId")]
        public Employee? Author { get; set; }
    }

    // ─── Calendar Event ────────────────────────────────────────────────────────
    public class CalendarEvent
    {
        [Key] public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public string? EventTime { get; set; }
        public string Type { get; set; } = "general";
        public int? RelatedEmployeeId { get; set; }
        public int CreatedById { get; set; }
        public string Color { get; set; } = "#F5A623";
        public bool IsAllDay { get; set; } = true;
        public bool IsAutoGenerated { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RelatedEmployeeId")]
        public Employee? RelatedEmployee { get; set; }
        [ForeignKey("CreatedById")]
        public Employee? CreatedBy { get; set; }
    }

    // ─── Notification ──────────────────────────────────────────────────────────
    public class Notification
    {
        [Key] public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "general";
        public bool IsRead { get; set; } = false;
        public string? ActionRoute { get; set; }
        public int? RelatedLeaveId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
    }

    // ─── Holiday ───────────────────────────────────────────────────────────────
    public class Holiday
    {
        [Key] public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = "🏖️";
        public string Type { get; set; } = "national";
        public int Year { get; set; }
    }
}


//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace MonkHRMS.API.Models
//{
//    // ─── Employee ──────────────────────────────────────────────────────────────
//    public class Employee
//    {
//        [Key] public int Id { get; set; }
//        public string EmployeeCode { get; set; } = string.Empty;
//        public string Name { get; set; } = string.Empty;
//        public string Designation { get; set; } = string.Empty;
//        public string Department { get; set; } = string.Empty;
//        public string Company { get; set; } = string.Empty;
//        public string Role { get; set; } = "employee";
//        public string Email { get; set; } = string.Empty;
//        public string PasswordHash { get; set; } = string.Empty;
//        public string Phone { get; set; } = string.Empty;
//        public string? Avatar { get; set; }
//        public DateTime DateOfBirth { get; set; }
//        public DateTime DateOfJoining { get; set; }
//        public string BloodGroup { get; set; } = string.Empty;
//        public string Address { get; set; } = string.Empty;
//        public decimal Salary { get; set; }
//        public string? Quote { get; set; }
//        public int? ReportingToId { get; set; }
//        public string EmploymentType { get; set; } = "Full-time";
//        public string Gender { get; set; } = string.Empty;
//        public bool IsActive { get; set; } = true;
//        public string? FingerprintId { get; set; }
//        public string? PanCard { get; set; }
//        public string? Aadhar { get; set; }
//        public string? BankAccount { get; set; }
//        public string? Ifsc { get; set; }
//        public string? EmergencyContact { get; set; }
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

//        [ForeignKey("ReportingToId")]
//        public Employee? ReportingTo { get; set; }
//        public ICollection<LeaveApplication> LeaveApplications { get; set; } = new List<LeaveApplication>();
//        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
//    }

//    // ─── Attendance ────────────────────────────────────────────────────────────
//    public class AttendanceRecord
//    {
//        [Key] public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public DateTime Date { get; set; }
//        public string? CheckIn { get; set; }
//        public string? CheckOut { get; set; }
//        public string Status { get; set; } = "present";
//        public string WorkHours { get; set; } = "0";
//        public string Source { get; set; } = "manual";
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        [ForeignKey("EmployeeId")]
//        public Employee? Employee { get; set; }
//    }

//    // ─── Leave Application ─────────────────────────────────────────────────────
//    public class LeaveApplication
//    {
//        [Key] public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public string LeaveType { get; set; } = string.Empty;
//        public DateTime FromDate { get; set; }
//        public DateTime ToDate { get; set; }
//        public int Days { get; set; }
//        public string Reason { get; set; } = string.Empty;
//        public string Status { get; set; } = "pending";
//        public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
//        public int? ApprovedById { get; set; }
//        public string? RejectionReason { get; set; }
//        public bool IsHalfDay { get; set; } = false;
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        [ForeignKey("EmployeeId")]
//        public Employee? Employee { get; set; }
//        [ForeignKey("ApprovedById")]
//        public Employee? ApprovedBy { get; set; }
//    }

//    // ─── Leave Balance ─────────────────────────────────────────────────────────
//    public class LeaveBalance
//    {
//        [Key] public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public int Year { get; set; }
//        public int CL { get; set; } = 12;
//        public int SL { get; set; } = 12;
//        public int EL { get; set; } = 15;
//        public int ML { get; set; } = 180;
//        public int PL { get; set; } = 15;
//        public int LOP { get; set; } = 0;

//        [ForeignKey("EmployeeId")]
//        public Employee? Employee { get; set; }
//    }

//    // ─── Leave Type Config ─────────────────────────────────────────────────────
//    public class LeaveTypeConfig
//    {
//        [Key] public int Id { get; set; }
//        public string Company { get; set; } = "all";
//        public string LeaveTypeCode { get; set; } = string.Empty;
//        public bool IsEnabled { get; set; } = true;
//        public int AnnualLimit { get; set; } = 0;
//        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
//        public int UpdatedById { get; set; }
//    }

//    // ─── Leave Accrual Log ─────────────────────────────────────────────────────
//    public class LeaveAccrualLog
//    {
//        [Key] public int Id { get; set; }
//        public int Year { get; set; }
//        public int Month { get; set; }
//        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
//        public int EmployeesProcessed { get; set; }
//    }

//    // ─── News / Announcement ───────────────────────────────────────────────────
//    public class NewsItem
//    {
//        [Key] public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Category { get; set; } = string.Empty;
//        public string Content { get; set; } = string.Empty;
//        public bool IsUrgent { get; set; } = false;
//        public bool IsPinned { get; set; } = false;
//        public int AuthorId { get; set; }
//        public int Views { get; set; } = 0;
//        public string Tags { get; set; } = string.Empty;
//        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
//        public bool IsActive { get; set; } = true;

//        [ForeignKey("AuthorId")]
//        public Employee? Author { get; set; }
//    }

//    // ─── Calendar Event ────────────────────────────────────────────────────────
//    public class CalendarEvent
//    {
//        [Key] public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string? Description { get; set; }
//        public DateTime EventDate { get; set; }
//        public string? EventTime { get; set; }
//        public string Type { get; set; } = "general";
//        public int? RelatedEmployeeId { get; set; }
//        public int CreatedById { get; set; }
//        public string Color { get; set; } = "#F5A623";
//        public bool IsAllDay { get; set; } = true;
//        public bool IsAutoGenerated { get; set; } = false;
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        [ForeignKey("RelatedEmployeeId")]
//        public Employee? RelatedEmployee { get; set; }
//        [ForeignKey("CreatedById")]
//        public Employee? CreatedBy { get; set; }
//    }

//    // ─── Notification ──────────────────────────────────────────────────────────
//    public class Notification
//    {
//        [Key] public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Message { get; set; } = string.Empty;
//        public string Type { get; set; } = "general";
//        public bool IsRead { get; set; } = false;
//        public string? ActionRoute { get; set; }
//        public int? RelatedLeaveId { get; set; }
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        [ForeignKey("EmployeeId")]
//        public Employee? Employee { get; set; }
//    }

//    // Models/News.cs
//    public class News
//    {
//        public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Content { get; set; } = string.Empty;
//        public string Category { get; set; } = "Announcement";
//        public bool IsUrgent { get; set; }
//        public bool IsPinned { get; set; }
//        public string Tags { get; set; } = string.Empty; // comma-separated
//        public int AuthorId { get; set; }
//        public Employee? Author { get; set; }
//        public DateTime PublishedAt { get; set; }
//        public int Views { get; set; }
//    }

//    // ─── Holiday ───────────────────────────────────────────────────────────────
//    public class Holiday
//    {
//        [Key] public int Id { get; set; }
//        public DateTime Date { get; set; }
//        public string Name { get; set; } = string.Empty;
//        public string Icon { get; set; } = "🏖️";
//        public string Type { get; set; } = "national";
//        public int Year { get; set; }
//    }
//}