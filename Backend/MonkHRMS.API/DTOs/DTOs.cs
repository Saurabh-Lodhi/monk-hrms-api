
namespace MonkHRMS.API.DTOs
{
    // ─── Auth DTOs ──────────────────────────────────────────────────────────────
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public EmployeeDto Employee { get; set; } = null!;
    }

    // ─── Employee DTOs ──────────────────────────────────────────────────────────
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string DateOfBirth { get; set; } = string.Empty;
        public string DateOfJoining { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public string? Quote { get; set; }
        public int? ReportingToId { get; set; }
        public string? ReportingToName { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? FingerprintId { get; set; }
        public string? PanCard { get; set; }
        public string? Aadhar { get; set; }
        public string? BankAccount { get; set; }
        public string? Ifsc { get; set; }
        public string? EmergencyContact { get; set; }
    }

    public class CreateEmployeeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Role { get; set; } = "employee";
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = "monk@123";
        public string Phone { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string DateOfBirth { get; set; } = string.Empty;
        public string DateOfJoining { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Salary { get; set; }
        public int? ReportingToId { get; set; }
        public string EmploymentType { get; set; } = "Full-time";
        public string Gender { get; set; } = string.Empty;
        public string? FingerprintId { get; set; }
        public string? PanCard { get; set; }
        public string? Aadhar { get; set; }
        public string? BankAccount { get; set; }
        public string? Ifsc { get; set; }
        public string? EmergencyContact { get; set; }
    }

    public class UpdateEmployeeRequest : CreateEmployeeRequest { }

    // ─── Attendance DTOs ────────────────────────────────────────────────────────
    public class AttendanceDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string? CheckIn { get; set; }
        public string? CheckOut { get; set; }
        public string Status { get; set; } = string.Empty;
        public string WorkHours { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
    }

    public class CheckInRequest
    {
        public string Time { get; set; } = string.Empty;
        public string Source { get; set; } = "manual";
    }

    public class CheckOutRequest
    {
        public string Time { get; set; } = string.Empty;
    }

    public class AttendanceSummaryDto
    {
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Late { get; set; }
        public int HalfDay { get; set; }
        public int Weekend { get; set; }
        public int Holiday { get; set; }
        public int WorkingDays { get; set; }
        public double TotalHours { get; set; }
    }

    // ─── Leave DTOs ─────────────────────────────────────────────────────────────
    public class LeaveApplicationDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeDesignation { get; set; } = string.Empty;
        public string LeaveType { get; set; } = string.Empty;
        public string FromDate { get; set; } = string.Empty;
        public string ToDate { get; set; } = string.Empty;
        public int Days { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AppliedOn { get; set; } = string.Empty;
        public string? ApprovedByName { get; set; }
        public string? RejectionReason { get; set; }
        public bool IsHalfDay { get; set; }
    }

    public class ApplyLeaveRequest
    {
        public string LeaveType { get; set; } = string.Empty;
        public string FromDate { get; set; } = string.Empty;
        public string ToDate { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public bool IsHalfDay { get; set; } = false;
    }

    public class UpdateLeaveStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
    }

    public class LeaveBalanceDto
    {
        public int CL { get; set; }
        public int SL { get; set; }
        public int EL { get; set; }
        public int ML { get; set; }
        public int PL { get; set; }
        public int LOP { get; set; }
        public int Year { get; set; }
    }

    public class LeaveTypeConfigDto
    {
        public string LeaveTypeCode { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public int AnnualLimit { get; set; }
    }

    public class UpdateLeaveBalanceRequest
    {
        public int? CL { get; set; }
        public int? SL { get; set; }
        public int? EL { get; set; }
        public int? ML { get; set; }
        public int? PL { get; set; }
        public int? LOP { get; set; }
    }

    public class UpdateLeaveLimitRequest
    {
        public int AnnualLimit { get; set; }
    }

    // ─── News DTOs ──────────────────────────────────────────────────────────────
    public class NewsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsUrgent { get; set; }
        public bool IsPinned { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string? AuthorAvatar { get; set; }
        public int Views { get; set; }
        public List<string> Tags { get; set; } = new();
        public string PublishedAt { get; set; } = string.Empty;
    }

    public class CreateNewsRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsUrgent { get; set; } = false;
        public bool IsPinned { get; set; } = false;
        public List<string> Tags { get; set; } = new();
    }

    // ─── Event DTOs ─────────────────────────────────────────────────────────────
    public class EventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Date { get; set; } = string.Empty;
        public string? Time { get; set; }
        public string Type { get; set; } = string.Empty;
        public int? RelatedEmployeeId { get; set; }
        public string? RelatedEmployeeName { get; set; }
        public string? RelatedEmployeeAvatar { get; set; }
        public string Color { get; set; } = string.Empty;
        public bool IsAllDay { get; set; }
        public bool IsAutoGenerated { get; set; }
    }

    public class CreateEventRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Date { get; set; } = string.Empty;
        public string? Time { get; set; }
        public string Type { get; set; } = "general";
        public string Color { get; set; } = "#F5A623";
        public bool IsAllDay { get; set; } = true;
    }

    // ─── Notification DTOs ──────────────────────────────────────────────────────
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string? ActionRoute { get; set; }
        public int? RelatedLeaveId { get; set; }
    }

    // ─── Common ─────────────────────────────────────────────────────────────────
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public int StatusCode { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Success") =>
            new() { Success = true, Data = data, Message = message, StatusCode = 200 };

        public static ApiResponse<T> Fail(string message, int code = 400) =>
            new() { Success = false, Message = message, StatusCode = code };
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
    }
}

//namespace MonkHRMS.API.DTOs
//{
//    // ─── Auth DTOs ──────────────────────────────────────────────────────────────
//    public class LoginRequest
//    {
//        public string Email { get; set; } = string.Empty;
//        public string Password { get; set; } = string.Empty;
//    }
//    // ─── ADD THESE TO DTOs folder ─────────────────────────────────────────────────



//        // ── Leave Type Config DTO ──────────────────────────────────────────────────
//        public class LeaveTypeConfigDto
//        {
//            public string LeaveTypeCode { get; set; } = string.Empty;
//            public bool IsEnabled { get; set; } = true;
//            public int AnnualLimit { get; set; }
//        }

//        // ── Update Leave Balance Request (HR/Admin) ────────────────────────────────
//        public class UpdateLeaveBalanceRequest
//        {
//            public int? CL { get; set; }
//            public int? SL { get; set; }
//            public int? EL { get; set; }
//            public int? ML { get; set; }
//            public int? PL { get; set; }
//            public int? LOP { get; set; }
//        }

//        // ── Update Leave Limit Request ─────────────────────────────────────────────
//        public class UpdateLeaveLimitRequest
//        {
//            public int AnnualLimit { get; set; }
//        }

//        // ── EXISTING DTOs — ensure these have all fields ───────────────────────────

//        // LeaveBalanceDto — already exists, ensure it has all fields:
//        public class LeaveBalanceDto
//        {
//            public int CL { get; set; }
//            public int SL { get; set; }
//            public int EL { get; set; }
//            public int ML { get; set; }
//            public int PL { get; set; }
//            public int LOP { get; set; }
//            public int Year { get; set; }
//        }

//        // LeaveApplicationDto — already exists, ensure all fields:
//        public class LeaveApplicationDto
//        {
//            public int Id { get; set; }
//            public int EmployeeId { get; set; }
//            public string EmployeeName { get; set; } = string.Empty;
//            public string EmployeeDesignation { get; set; } = string.Empty;
//            public string LeaveType { get; set; } = string.Empty;
//            public string FromDate { get; set; } = string.Empty;
//            public string ToDate { get; set; } = string.Empty;
//            public int Days { get; set; }
//            public string Reason { get; set; } = string.Empty;
//            public string Status { get; set; } = string.Empty;
//            public string AppliedOn { get; set; } = string.Empty;
//            public string? ApprovedByName { get; set; }
//            public string? RejectionReason { get; set; }
//            public bool IsHalfDay { get; set; }
//        }

//        // ApplyLeaveRequest — ensure it has IsHalfDay:
//        public class ApplyLeaveRequest
//        {
//            public string LeaveType { get; set; } = string.Empty;
//            public string FromDate { get; set; } = string.Empty;
//            public string ToDate { get; set; } = string.Empty;
//            public string Reason { get; set; } = string.Empty;
//            public bool IsHalfDay { get; set; } = false;
//        }

//        // UpdateLeaveStatusRequest — ensure it has RejectionReason:
//        public class UpdateLeaveStatusRequest
//        {
//            public string Status { get; set; } = string.Empty; // "approved" | "rejected"
//            public string? RejectionReason { get; set; }
//        }
//    }


//    public class LoginResponse
//    {
//        public string Token { get; set; } = string.Empty;
//        public string RefreshToken { get; set; } = string.Empty;
//        public DateTime ExpiresAt { get; set; }
//        public EmployeeDto Employee { get; set; } = null!;
//    }

//    // ─── Employee DTOs ──────────────────────────────────────────────────────────
//    public class EmployeeDto
//    {
//        public int Id { get; set; }
//        public string EmployeeCode { get; set; } = string.Empty;
//        public string Name { get; set; } = string.Empty;
//        public string Designation { get; set; } = string.Empty;
//        public string Department { get; set; } = string.Empty;
//        public string Company { get; set; } = string.Empty;
//        public string Role { get; set; } = string.Empty;
//        public string Email { get; set; } = string.Empty;
//        public string Phone { get; set; } = string.Empty;
//        public string? Avatar { get; set; }
//        public string DateOfBirth { get; set; } = string.Empty;
//        public string DateOfJoining { get; set; } = string.Empty;
//        public string BloodGroup { get; set; } = string.Empty;
//        public string Address { get; set; } = string.Empty;
//        public decimal? Salary { get; set; }  // null if not authorized to see
//        public string? Quote { get; set; }
//        public int? ReportingToId { get; set; }
//        public string? ReportingToName { get; set; }
//        public string EmploymentType { get; set; } = string.Empty;
//        public string Gender { get; set; } = string.Empty;
//        public bool IsActive { get; set; }
//        public string? FingerprintId { get; set; }

//        // Sensitive - only shown to self/HR/Admin
//        public string? PanCard { get; set; }
//        public string? Aadhar { get; set; }
//        public string? BankAccount { get; set; }
//        public string? Ifsc { get; set; }
//        public string? EmergencyContact { get; set; }
//    }

//    public class CreateEmployeeRequest
//    {
//        public string Name { get; set; } = string.Empty;
//        public string Designation { get; set; } = string.Empty;
//        public string Department { get; set; } = string.Empty;
//        public string Company { get; set; } = string.Empty;
//        public string Role { get; set; } = "employee";
//        public string Email { get; set; } = string.Empty;
//        public string Password { get; set; } = "monk@123";
//        public string Phone { get; set; } = string.Empty;
//        public string? Avatar { get; set; }
//        public string DateOfBirth { get; set; } = string.Empty;
//        public string DateOfJoining { get; set; } = string.Empty;
//        public string BloodGroup { get; set; } = string.Empty;
//        public string Address { get; set; } = string.Empty;
//        public decimal Salary { get; set; }
//        public int? ReportingToId { get; set; }
//        public string EmploymentType { get; set; } = "Full-time";
//        public string Gender { get; set; } = string.Empty;
//        public string? FingerprintId { get; set; }
//        public string? PanCard { get; set; }
//        public string? Aadhar { get; set; }
//        public string? BankAccount { get; set; }
//        public string? Ifsc { get; set; }
//        public string? EmergencyContact { get; set; }
//    }

//    public class UpdateEmployeeRequest : CreateEmployeeRequest { }

//    // ─── Attendance DTOs ────────────────────────────────────────────────────────
//    public class AttendanceDto
//    {
//        public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public string EmployeeName { get; set; } = string.Empty;
//        public string Date { get; set; } = string.Empty;
//        public string? CheckIn { get; set; }
//        public string? CheckOut { get; set; }
//        public string Status { get; set; } = string.Empty;
//        public string WorkHours { get; set; } = string.Empty;
//        public string Source { get; set; } = string.Empty;
//    }

//    public class CheckInRequest
//    {
//        public string Time { get; set; } = string.Empty;
//        public string Source { get; set; } = "manual";
//    }

//    public class CheckOutRequest
//    {
//        public string Time { get; set; } = string.Empty;
//    }

//    public class AttendanceSummaryDto
//    {
//        public int Present { get; set; }
//        public int Absent { get; set; }
//        public int Late { get; set; }
//        public int HalfDay { get; set; }
//        public int Weekend { get; set; }
//        public int Holiday { get; set; }
//        public int WorkingDays { get; set; }
//        public double TotalHours { get; set; }
//    }

//    // ─── Leave DTOs ─────────────────────────────────────────────────────────────
//    public class LeaveApplicationDto
//    {
//        public int Id { get; set; }
//        public int EmployeeId { get; set; }
//        public string EmployeeName { get; set; } = string.Empty;
//        public string EmployeeDesignation { get; set; } = string.Empty;
//        public string LeaveType { get; set; } = string.Empty;
//        public string FromDate { get; set; } = string.Empty;
//        public string ToDate { get; set; } = string.Empty;
//        public int Days { get; set; }
//        public string Reason { get; set; } = string.Empty;
//        public string Status { get; set; } = string.Empty;
//        public string AppliedOn { get; set; } = string.Empty;
//        public string? ApprovedByName { get; set; }
//        public string? RejectionReason { get; set; }
//        public bool IsHalfDay { get; set; }
//    }

//    public class ApplyLeaveRequest
//    {
//        public string LeaveType { get; set; } = string.Empty;
//        public string FromDate { get; set; } = string.Empty;
//        public string ToDate { get; set; } = string.Empty;
//        public string Reason { get; set; } = string.Empty;
//        public bool IsHalfDay { get; set; } = false;
//    }

//    public class UpdateLeaveStatusRequest
//    {
//        public string Status { get; set; } = string.Empty;  // approved/rejected
//        public string? RejectionReason { get; set; }
//    }

//    public class LeaveBalanceDto
//    {
//        public int CL { get; set; }
//        public int SL { get; set; }
//        public int EL { get; set; }
//        public int ML { get; set; }
//        public int PL { get; set; }
//        public int LOP { get; set; }
//        public int Year { get; set; }
//    }

//    // ─── News DTOs ──────────────────────────────────────────────────────────────
//    public class NewsDto
//    {
//        public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Category { get; set; } = string.Empty;
//        public string Content { get; set; } = string.Empty;
//        public bool IsUrgent { get; set; }
//        public bool IsPinned { get; set; }
//        public string AuthorName { get; set; } = string.Empty;
//        public string AuthorRole { get; set; } = string.Empty;
//        public string? AuthorAvatar { get; set; }
//        public int Views { get; set; }
//        public List<string> Tags { get; set; } = new();
//        public string PublishedAt { get; set; } = string.Empty;
//    }

//    public class CreateNewsRequest
//    {
//        public string Title { get; set; } = string.Empty;
//        public string Category { get; set; } = string.Empty;
//        public string Content { get; set; } = string.Empty;
//        public bool IsUrgent { get; set; } = false;
//        public bool IsPinned { get; set; } = false;
//        public List<string> Tags { get; set; } = new();
//    }

//    // ─── Event DTOs ─────────────────────────────────────────────────────────────
//    public class EventDto
//    {
//        public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string? Description { get; set; }
//        public string Date { get; set; } = string.Empty;
//        public string? Time { get; set; }
//        public string Type { get; set; } = string.Empty;
//        public int? RelatedEmployeeId { get; set; }
//        public string? RelatedEmployeeName { get; set; }
//        public string? RelatedEmployeeAvatar { get; set; }
//        public string Color { get; set; } = string.Empty;
//        public bool IsAllDay { get; set; }
//        public bool IsAutoGenerated { get; set; }
//    }

//    public class CreateEventRequest
//    {
//        public string Title { get; set; } = string.Empty;
//        public string? Description { get; set; }
//        public string Date { get; set; } = string.Empty;
//        public string? Time { get; set; }
//        public string Type { get; set; } = "general";
//        public string Color { get; set; } = "#F5A623";
//        public bool IsAllDay { get; set; } = true;
//    }

//    // ─── Notification DTOs ──────────────────────────────────────────────────────
//    public class NotificationDto
//    {
//        public int Id { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Message { get; set; } = string.Empty;
//        public string Type { get; set; } = string.Empty;
//        public bool IsRead { get; set; }
//        public string CreatedAt { get; set; } = string.Empty;
//        public string? ActionRoute { get; set; }
//        public int? RelatedLeaveId { get; set; }
//}



//    // ─── Common ─────────────────────────────────────────────────────────────────
//    public class ApiResponse<T>
//    {
//        public bool Success { get; set; }
//        public string Message { get; set; } = string.Empty;
//        public T? Data { get; set; }
//        public int StatusCode { get; set; }

//        public static ApiResponse<T> Ok(T data, string message = "Success") =>
//            new() { Success = true, Data = data, Message = message, StatusCode = 200 };

//        public static ApiResponse<T> Fail(string message, int code = 400) =>
//            new() { Success = false, Message = message, StatusCode = code };
//    }

//    public class PagedResult<T>
//    {
//        public List<T> Items { get; set; } = new();
//        public int Total { get; set; }
//        public int Page { get; set; }
//        public int PageSize { get; set; }
//        public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
//    }
