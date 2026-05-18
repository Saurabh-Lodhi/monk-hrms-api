//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using MonkHRMS.API.Data;
//using MonkHRMS.API.DTOs;
//using MonkHRMS.API.Models;
//using MonkHRMS.API.Services;

//namespace MonkHRMS.API.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class AttendanceController : ControllerBase
//    {
//        private readonly AppDbContext _db;
//        private readonly IJwtService _jwt;

//        public AttendanceController(AppDbContext db, IJwtService jwt) { _db = db; _jwt = jwt; }

//        /// <summary>GET /api/attendance/my?month=3&year=2025 — My attendance records</summary>
//        [HttpGet("my")]
//        public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetMine(
//            [FromQuery] int? month, [FromQuery] int? year)
//        {
//            var empId = _jwt.GetEmployeeIdFromToken(User);
//            return Ok(ApiResponse<List<AttendanceDto>>.Ok(await GetRecords(empId, month, year)));
//        }

//        /// <summary>GET /api/attendance/{employeeId}?month=3&year=2025 — Get for any employee (HR/Admin/Manager)</summary>
//        [HttpGet("{employeeId}")]
//        public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetForEmployee(
//            int employeeId, [FromQuery] int? month, [FromQuery] int? year)
//        {
//            var currentId = _jwt.GetEmployeeIdFromToken(User);
//            var currentRole = _jwt.GetRoleFromToken(User);
//            if (currentId != employeeId && currentRole is not ("admin" or "hr" or "manager"))
//                return Forbid();

//            return Ok(ApiResponse<List<AttendanceDto>>.Ok(await GetRecords(employeeId, month, year)));
//        }

//        /// <summary>GET /api/attendance/my/summary?month=3&year=2025 — Monthly summary</summary>
//        [HttpGet("my/summary")]
//        public async Task<ActionResult<ApiResponse<AttendanceSummaryDto>>> GetSummary(
//            [FromQuery] int? month, [FromQuery] int? year)
//        {
//            var empId = _jwt.GetEmployeeIdFromToken(User);
//            var m = month ?? DateTime.Now.Month;
//            var y = year ?? DateTime.Now.Year;

//            var records = await _db.AttendanceRecords
//                .Where(a => a.EmployeeId == empId && a.Date.Month == m && a.Date.Year == y)
//                .ToListAsync();

//            var summary = new AttendanceSummaryDto
//            {
//                Present = records.Count(r => r.Status == "present"),
//                Late = records.Count(r => r.Status == "late"),
//                Absent = records.Count(r => r.Status == "absent"),
//                HalfDay = records.Count(r => r.Status == "half-day"),
//                Weekend = records.Count(r => r.Status == "weekend"),
//                Holiday = records.Count(r => r.Status == "holiday"),
//                WorkingDays = records.Count(r => r.Status is not "weekend" and not "holiday"),
//                TotalHours = records.Where(r => r.WorkHours != "0")
//                    .Sum(r => double.TryParse(r.WorkHours, out var h) ? h : 0),
//            };

//            return Ok(ApiResponse<AttendanceSummaryDto>.Ok(summary));
//        }

//        /// <summary>POST /api/attendance/check-in — Check in for today</summary>
//        [HttpPost("check-in")]
//        public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckIn([FromBody] CheckInRequest req)
//        {
//            var empId = _jwt.GetEmployeeIdFromToken(User);
//            var today = DateTime.Today;

//            var existing = await _db.AttendanceRecords
//                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

//            if (existing != null && !string.IsNullOrEmpty(existing.CheckIn))
//                return Conflict(ApiResponse<AttendanceDto>.Fail("Already checked in today."));

//            var time = string.IsNullOrEmpty(req.Time)
//                ? DateTime.Now.ToString("hh:mm tt")
//                : req.Time;

//            var isLate = DateTime.Now.Hour >= 10 && DateTime.Now.Minute >= 10;

//            if (existing == null)
//            {
//                existing = new AttendanceRecord
//                {
//                    EmployeeId = empId, Date = today,
//                    CheckIn = time,
//                    Status = isLate ? "late" : "present",
//                    Source = req.Source,
//                    WorkHours = "0",
//                };
//                _db.AttendanceRecords.Add(existing);
//            }
//            else
//            {
//                existing.CheckIn = time;
//                existing.Status = isLate ? "late" : "present";
//                existing.Source = req.Source;
//            }

//            await _db.SaveChangesAsync();
//            return Ok(ApiResponse<AttendanceDto>.Ok(MapToDto(existing), "Checked in successfully!"));
//        }

//        /// <summary>POST /api/attendance/check-out — Check out for today</summary>
//        [HttpPost("check-out")]
//        public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckOut([FromBody] CheckOutRequest req)
//        {
//            var empId = _jwt.GetEmployeeIdFromToken(User);
//            var today = DateTime.Today;

//            var record = await _db.AttendanceRecords
//                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

//            if (record == null || string.IsNullOrEmpty(record.CheckIn))
//                return BadRequest(ApiResponse<AttendanceDto>.Fail("You must check in first."));

//            if (!string.IsNullOrEmpty(record.CheckOut))
//                return Conflict(ApiResponse<AttendanceDto>.Fail("Already checked out today."));

//            var time = string.IsNullOrEmpty(req.Time)
//                ? DateTime.Now.ToString("hh:mm tt")
//                : req.Time;

//            record.CheckOut = time;

//            // Calculate work hours
//            if (TimeSpan.TryParse(ConvertTo24h(record.CheckIn), out var inTime) &&
//                TimeSpan.TryParse(ConvertTo24h(time), out var outTime))
//            {
//                var hours = (outTime - inTime).TotalHours;
//                record.WorkHours = Math.Max(0, hours).ToString("F1");
//            }

//            await _db.SaveChangesAsync();
//            return Ok(ApiResponse<AttendanceDto>.Ok(MapToDto(record), "Checked out successfully!"));
//        }

//        /// <summary>GET /api/attendance/today — Today's attendance status</summary>
//        [HttpGet("today")]
//        public async Task<ActionResult<ApiResponse<AttendanceDto?>>> GetToday()
//        {
//            var empId = _jwt.GetEmployeeIdFromToken(User);
//            var today = DateTime.Today;

//            var record = await _db.AttendanceRecords
//                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

//            return Ok(ApiResponse<AttendanceDto?>.Ok(record == null ? null : MapToDto(record)));
//        }

//        private async Task<List<AttendanceDto>> GetRecords(int empId, int? month, int? year)
//        {
//            var m = month ?? DateTime.Now.Month;
//            var y = year ?? DateTime.Now.Year;
//            var records = await _db.AttendanceRecords
//                .Include(a => a.Employee)
//                .Where(a => a.EmployeeId == empId && a.Date.Month == m && a.Date.Year == y)
//                .OrderByDescending(a => a.Date)
//                .ToListAsync();
//            return records.Select(MapToDto).ToList();
//        }

//        private static AttendanceDto MapToDto(AttendanceRecord a) => new()
//        {
//            Id = a.Id, EmployeeId = a.EmployeeId,
//            EmployeeName = a.Employee?.Name ?? "",
//            Date = a.Date.ToString("yyyy-MM-dd"),
//            CheckIn = a.CheckIn, CheckOut = a.CheckOut,
//            Status = a.Status, WorkHours = a.WorkHours, Source = a.Source,
//        };

//        private static string ConvertTo24h(string time12h)
//        {
//            if (DateTime.TryParse(time12h, out var dt))
//                return dt.ToString("HH:mm");
//            return time12h;
//        }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonkHRMS.API.Data;
using MonkHRMS.API.DTOs;
using MonkHRMS.API.Models;
using MonkHRMS.API.Services;

namespace MonkHRMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public AttendanceController(AppDbContext db, IJwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        /// <summary>GET /api/attendance/my — My attendance records (ALWAYS filtered by JWT token)</summary>
        [HttpGet("my")]
        public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetMine(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            // Always use the logged-in employee's ID from JWT — never from query param
            var empId = _jwt.GetEmployeeIdFromToken(User);
            return Ok(ApiResponse<List<AttendanceDto>>.Ok(await GetRecords(empId, month, year)));
        }

        /// <summary>GET /api/attendance/{employeeId} — Get for specific employee (HR/Admin/Manager only)</summary>
        [HttpGet("{employeeId:int}")]
        public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetForEmployee(
            int employeeId, [FromQuery] int? month, [FromQuery] int? year)
        {
            var currentId = _jwt.GetEmployeeIdFromToken(User);
            var currentRole = _jwt.GetRoleFromToken(User);

            // Only allow self-access or privileged roles
            if (currentId != employeeId && currentRole is not ("admin" or "hr" or "manager"))
                return Forbid();

            return Ok(ApiResponse<List<AttendanceDto>>.Ok(await GetRecords(employeeId, month, year)));
        }

        /// <summary>GET /api/attendance/my/summary — Monthly summary for logged-in employee</summary>
        [HttpGet("my/summary")]
        public async Task<ActionResult<ApiResponse<AttendanceSummaryDto>>> GetSummary(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var m = month ?? DateTime.Now.Month;
            var y = year ?? DateTime.Now.Year;

            var records = await _db.AttendanceRecords
                .Where(a => a.EmployeeId == empId && a.Date.Month == m && a.Date.Year == y)
                .ToListAsync();

            var summary = new AttendanceSummaryDto
            {
                Present = records.Count(r => r.Status == "present"),
                Late = records.Count(r => r.Status == "late"),
                Absent = records.Count(r => r.Status == "absent"),
                HalfDay = records.Count(r => r.Status == "half-day"),
                Weekend = records.Count(r => r.Status == "weekend"),
                Holiday = records.Count(r => r.Status == "holiday"),
                WorkingDays = records.Count(r => r.Status is not "weekend" and not "holiday"),
                TotalHours = records.Where(r => r.WorkHours != "0")
                    .Sum(r => double.TryParse(r.WorkHours, out var h) ? h : 0),
            };

            return Ok(ApiResponse<AttendanceSummaryDto>.Ok(summary));
        }

        /// <summary>POST /api/attendance/check-in — Check in for TODAY (per JWT employee)</summary>
        [HttpPost("check-in")]
        public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckIn([FromBody] CheckInRequest req)
        {
            // Critical: always use JWT employee ID, not body data
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var today = DateTime.Today;

            var existing = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

            if (existing != null && !string.IsNullOrEmpty(existing.CheckIn))
                return Conflict(ApiResponse<AttendanceDto>.Fail("Already checked in today."));

            var time = string.IsNullOrEmpty(req.Time)
                ? DateTime.Now.ToString("hh:mm tt")
                : req.Time;

            // Late if checked in after 10:10 AM
            var nowHour = DateTime.Now.Hour;
            var nowMin = DateTime.Now.Minute;
            var isLate = nowHour > 10 || (nowHour == 10 && nowMin > 10);

            if (existing == null)
            {
                existing = new AttendanceRecord
                {
                    EmployeeId = empId,
                    Date = today,
                    CheckIn = time,
                    Status = isLate ? "late" : "present",
                    Source = req.Source ?? "manual",
                    WorkHours = "0",
                };
                _db.AttendanceRecords.Add(existing);
            }
            else
            {
                existing.CheckIn = time;
                existing.Status = isLate ? "late" : "present";
                existing.Source = req.Source ?? "manual";
            }

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<AttendanceDto>.Ok(MapToDto(existing), "Checked in successfully!"));
        }

        /// <summary>POST /api/attendance/check-out — Check out for TODAY (per JWT employee)</summary>
        [HttpPost("check-out")]
        public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckOut([FromBody] CheckOutRequest req)
        {
            // Critical: always use JWT employee ID
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var today = DateTime.Today;

            var record = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

            if (record == null || string.IsNullOrEmpty(record.CheckIn))
                return BadRequest(ApiResponse<AttendanceDto>.Fail("You must check in first."));

            if (!string.IsNullOrEmpty(record.CheckOut))
                return Conflict(ApiResponse<AttendanceDto>.Fail("Already checked out today."));

            var time = string.IsNullOrEmpty(req.Time)
                ? DateTime.Now.ToString("hh:mm tt")
                : req.Time;

            record.CheckOut = time;

            // Calculate work hours
            if (DateTime.TryParse(record.CheckIn, out var inTime) &&
                DateTime.TryParse(time, out var outTime))
            {
                var hours = (outTime - inTime).TotalHours;
                record.WorkHours = Math.Max(0, hours).ToString("F1");
            }

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<AttendanceDto>.Ok(MapToDto(record), "Checked out successfully!"));
        }

        /// <summary>GET /api/attendance/today — Today's status for the LOGGED-IN employee only</summary>
        [HttpGet("today")]
        public async Task<ActionResult<ApiResponse<AttendanceDto?>>> GetToday()
        {
            // Always scoped to the JWT token — each employee sees ONLY their own today record
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var today = DateTime.Today;

            var record = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date.Date == today);

            return Ok(ApiResponse<AttendanceDto?>.Ok(record == null ? null : MapToDto(record)));
        }

        // ── Private helpers ──────────────────────────────────────────────────

        private async Task<List<AttendanceDto>> GetRecords(int empId, int? month, int? year)
        {
            var m = month ?? DateTime.Now.Month;
            var y = year ?? DateTime.Now.Year;

            var records = await _db.AttendanceRecords
                .Include(a => a.Employee)
                .Where(a => a.EmployeeId == empId && a.Date.Month == m && a.Date.Year == y)
                .OrderByDescending(a => a.Date)
                .ToListAsync();

            return records.Select(MapToDto).ToList();
        }

        private static AttendanceDto MapToDto(AttendanceRecord a) => new()
        {
            Id = a.Id,
            EmployeeId = a.EmployeeId,
            EmployeeName = a.Employee?.Name ?? "",
            Date = a.Date.ToString("yyyy-MM-dd"),
            CheckIn = a.CheckIn,
            CheckOut = a.CheckOut,
            Status = a.Status,
            WorkHours = a.WorkHours,
            Source = a.Source,
        };
    }
}