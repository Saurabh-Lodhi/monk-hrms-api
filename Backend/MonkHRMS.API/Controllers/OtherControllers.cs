using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonkHRMS.API.Data;
using MonkHRMS.API.DTOs;
using MonkHRMS.API.Models;
using MonkHRMS.API.Services;
using System.Security.Claims;

namespace MonkHRMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public LeaveController(AppDbContext db, IJwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        private int GetEmpId() =>
            int.Parse(User.Claims.First(c =>
                c.Type == "employeeId" || c.Type == "id" || c.Type == ClaimTypes.NameIdentifier
            ).Value);

        private string GetRole() => _jwt.GetRoleFromToken(User);

        // ── Balance ──────────────────────────────────────────────────────────

        [HttpGet("balance")]
        public async Task<ActionResult<ApiResponse<LeaveBalanceDto>>> GetBalance()
        {
            var balance = await EnsureBalance(GetEmpId());
            return Ok(ApiResponse<LeaveBalanceDto>.Ok(MapBalanceToDto(balance)));
        }

        [HttpGet("balance/{employeeId:int}")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<LeaveBalanceDto>>> GetBalanceFor(int employeeId)
        {
            var balance = await EnsureBalance(employeeId);
            return Ok(ApiResponse<LeaveBalanceDto>.Ok(MapBalanceToDto(balance)));
        }

        [HttpPut("balance/{employeeId:int}")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<LeaveBalanceDto>>> UpdateBalance(
            int employeeId, [FromBody] UpdateLeaveBalanceRequest req)
        {
            var balance = await EnsureBalance(employeeId);
            if (req.CL.HasValue) balance.CL = Math.Max(0, req.CL.Value);
            if (req.SL.HasValue) balance.SL = Math.Max(0, req.SL.Value);
            if (req.EL.HasValue) balance.EL = Math.Max(0, req.EL.Value);
            if (req.ML.HasValue) balance.ML = Math.Max(0, req.ML.Value);
            if (req.PL.HasValue) balance.PL = Math.Max(0, req.PL.Value);
            if (req.LOP.HasValue) balance.LOP = Math.Max(0, req.LOP.Value);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<LeaveBalanceDto>.Ok(MapBalanceToDto(balance), "Balance updated successfully."));
        }

        // ── Leave Type Config ────────────────────────────────────────────────

        [HttpGet("types/config")]
        public async Task<ActionResult<ApiResponse<List<LeaveTypeConfigDto>>>> GetLeaveTypeConfigs()
        {
            var configs = await _db.LeaveTypeConfigs.ToListAsync();
            var result = GetAllLeaveTypeCodes().Select(code =>
            {
                var existing = configs.FirstOrDefault(c => c.LeaveTypeCode == code);
                return new LeaveTypeConfigDto
                {
                    LeaveTypeCode = code,
                    IsEnabled = existing?.IsEnabled ?? true,
                    AnnualLimit = existing?.AnnualLimit ?? GetDefaultLimit(code),
                };
            }).ToList();
            return Ok(ApiResponse<List<LeaveTypeConfigDto>>.Ok(result));
        }

        [HttpPatch("types/config/{code}/toggle")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<LeaveTypeConfigDto>>> ToggleLeaveType(string code)
        {
            code = code.ToUpper();
            if (!GetAllLeaveTypeCodes().Contains(code))
                return BadRequest(ApiResponse<LeaveTypeConfigDto>.Fail($"Unknown leave type: {code}"));

            var updatedById = GetEmpId();
            var config = await _db.LeaveTypeConfigs.FirstOrDefaultAsync(c => c.LeaveTypeCode == code);
            if (config == null)
            {
                config = new LeaveTypeConfig
                {
                    LeaveTypeCode = code,
                    Company = "all",
                    IsEnabled = false,
                    AnnualLimit = GetDefaultLimit(code),
                    UpdatedById = updatedById,
                };
                _db.LeaveTypeConfigs.Add(config);
            }
            else
            {
                config.IsEnabled = !config.IsEnabled;
                config.UpdatedAt = DateTime.UtcNow;
                config.UpdatedById = updatedById;
            }
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<LeaveTypeConfigDto>.Ok(new LeaveTypeConfigDto
            {
                LeaveTypeCode = config.LeaveTypeCode,
                IsEnabled = config.IsEnabled,
                AnnualLimit = config.AnnualLimit,
            }, $"{code} leave {(config.IsEnabled ? "enabled" : "disabled")} successfully."));
        }

        [HttpPut("types/config/{code}/limit")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<LeaveTypeConfigDto>>> UpdateLeaveLimit(
            string code, [FromBody] UpdateLeaveLimitRequest req)
        {
            code = code.ToUpper();
            var updatedById = GetEmpId();
            var config = await _db.LeaveTypeConfigs.FirstOrDefaultAsync(c => c.LeaveTypeCode == code);
            if (config == null)
            {
                config = new LeaveTypeConfig
                {
                    LeaveTypeCode = code,
                    Company = "all",
                    IsEnabled = true,
                    AnnualLimit = req.AnnualLimit,
                    UpdatedById = updatedById,
                };
                _db.LeaveTypeConfigs.Add(config);
            }
            else
            {
                config.AnnualLimit = req.AnnualLimit;
                config.UpdatedAt = DateTime.UtcNow;
                config.UpdatedById = updatedById;
            }
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<LeaveTypeConfigDto>.Ok(new LeaveTypeConfigDto
            {
                LeaveTypeCode = code,
                IsEnabled = config.IsEnabled,
                AnnualLimit = config.AnnualLimit,
            }, "Limit updated."));
        }

        // ── Monthly Accrual ──────────────────────────────────────────────────

        [HttpPost("accrue")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<string>>> AccrueMonthlyLeave()
        {
            var today = DateTime.Now;
            int year = today.Year;
            int month = today.Month;

            var alreadyAccrued = await _db.LeaveAccrualLogs
                .AnyAsync(l => l.Year == year && l.Month == month);
            if (alreadyAccrued)
                return Conflict(ApiResponse<string>.Fail($"Accrual already done for {month}/{year}."));

            var activeEmployeeIds = await _db.Employees
                .Where(e => e.IsActive)
                .Select(e => e.Id)
                .ToListAsync();

            int count = 0;
            foreach (var empId in activeEmployeeIds)
            {
                var balance = await EnsureBalance(empId);
                // Alternates +1 / +2 each month → average 1.5/month = 18/year
                balance.EL += (month % 2 == 0) ? 2 : 1;
                count++;
            }

            _db.LeaveAccrualLogs.Add(new LeaveAccrualLog
            {
                Year = year,
                Month = month,
                ProcessedAt = DateTime.UtcNow,
                EmployeesProcessed = count,
            });

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("accrued", $"Accrued leave for {count} employees for {month}/{year}."));
        }

        // ── Applications ─────────────────────────────────────────────────────

        [HttpGet("my")]
        public async Task<ActionResult<ApiResponse<List<LeaveApplicationDto>>>> GetMine()
        {
            var empId = GetEmpId();
            var list = await _db.LeaveApplications
                .Include(l => l.Employee)
                .Include(l => l.ApprovedBy)
                .Where(l => l.EmployeeId == empId)
                .OrderByDescending(l => l.AppliedOn)
                .ToListAsync();
            return Ok(ApiResponse<List<LeaveApplicationDto>>.Ok(list.Select(MapToDto).ToList()));
        }

        [HttpGet("all")]
        [Authorize(Roles = "admin,hr,manager")]
        public async Task<ActionResult<ApiResponse<List<LeaveApplicationDto>>>> GetAll([FromQuery] string? status)
        {
            int currentId = GetEmpId();
            string currentRole = GetRole();

            IQueryable<LeaveApplication> query = _db.LeaveApplications
                .Include(l => l.Employee)
                .Include(l => l.ApprovedBy);

            if (currentRole is "admin" or "hr")
            {
                if (!string.IsNullOrEmpty(status))
                    query = query.Where(l => l.Status == status);
            }
            else if (currentRole == "manager")
            {
                var reportingIds = await _db.Employees
                    .Where(e => e.ReportingToId == currentId && e.IsActive)
                    .Select(e => e.Id)
                    .ToListAsync();
                query = query.Where(l => reportingIds.Contains(l.EmployeeId));
                if (!string.IsNullOrEmpty(status))
                    query = query.Where(l => l.Status == status);
            }

            var list = await query.OrderByDescending(l => l.AppliedOn).ToListAsync();
            return Ok(ApiResponse<List<LeaveApplicationDto>>.Ok(list.Select(MapToDto).ToList()));
        }

        [HttpPost("apply")]
        public async Task<ActionResult<ApiResponse<LeaveApplicationDto>>> Apply([FromBody] ApplyLeaveRequest req)
        {
            int empId = GetEmpId();

            if (string.IsNullOrEmpty(req.FromDate) || string.IsNullOrEmpty(req.ToDate))
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("From date and to date are required."));

            if (!DateTime.TryParse(req.FromDate, out var from) || !DateTime.TryParse(req.ToDate, out var to))
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("Invalid date format. Use YYYY-MM-DD."));

            if (from.Date < DateTime.Today)
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("From date cannot be in the past."));

            if (to.Date < from.Date)
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("To date cannot be before From date."));

            if (string.IsNullOrWhiteSpace(req.Reason))
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("Reason is required."));

            string leaveCode = req.LeaveType.ToUpper();

            // Check if leave type is enabled
            var typeConfig = await _db.LeaveTypeConfigs
                .FirstOrDefaultAsync(c => c.LeaveTypeCode == leaveCode);
            if (typeConfig != null && !typeConfig.IsEnabled)
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail(
                    $"{leaveCode} leave type is currently disabled by HR/Admin."));

            var balance = await EnsureBalance(empId);
            int days = req.IsHalfDay ? 1 : (int)(to.Date - from.Date).TotalDays + 1;

            if (leaveCode != "LOP")
            {
                int available = GetAvailableBalance(balance, leaveCode);
                if (available >= 0 && days > available)
                    return BadRequest(ApiResponse<LeaveApplicationDto>.Fail(
                        $"Insufficient {leaveCode} balance. Available: {available} day(s), Requested: {days} day(s)."));
            }

            // Overlap check
            bool overlap = await _db.LeaveApplications.AnyAsync(l =>
                l.EmployeeId == empId &&
                l.Status != "rejected" &&
                l.FromDate.Date <= to.Date &&
                l.ToDate.Date >= from.Date);
            if (overlap)
                return Conflict(ApiResponse<LeaveApplicationDto>.Fail(
                    "You already have a leave application overlapping these dates."));

            var application = new LeaveApplication
            {
                EmployeeId = empId,
                LeaveType = leaveCode,
                FromDate = from,
                ToDate = to,
                Days = days,
                Reason = req.Reason.Trim(),
                Status = "pending",
                AppliedOn = DateTime.UtcNow,
                IsHalfDay = req.IsHalfDay,
            };

            _db.LeaveApplications.Add(application);
            await _db.SaveChangesAsync();
            await _db.Entry(application).Reference(a => a.Employee).LoadAsync();

            var employee = application.Employee;
            var notifList = new List<Notification>();

            if (employee?.ReportingToId != null)
            {
                notifList.Add(new Notification
                {
                    EmployeeId = employee.ReportingToId.Value,
                    Title = "📋 New Leave Request",
                    Message = $"{employee.Name} applied for {days} day(s) of {leaveCode} leave ({from:dd MMM} → {to:dd MMM}). Reason: {req.Reason}",
                    Type = "leave",
                    ActionRoute = "/(tabs)/leave",
                    RelatedLeaveId = application.Id,
                });
            }

            var hrIds = await _db.Employees
                .Where(e => e.Role == "hr" && e.IsActive && e.Id != empId)
                .Select(e => e.Id)
                .ToListAsync();

            foreach (int hrId in hrIds)
            {
                if (hrId != employee?.ReportingToId)
                {
                    notifList.Add(new Notification
                    {
                        EmployeeId = hrId,
                        Title = "📋 New Leave Request",
                        Message = $"{employee?.Name} applied for {days} day(s) of {leaveCode} leave ({from:dd MMM} → {to:dd MMM}).",
                        Type = "leave",
                        ActionRoute = "/(tabs)/leave",
                        RelatedLeaveId = application.Id,
                    });
                }
            }

            var adminIds = await _db.Employees
                .Where(e => e.Role == "admin" && e.IsActive && e.Id != empId)
                .Select(e => e.Id)
                .ToListAsync();

            foreach (int adminId in adminIds)
            {
                if (adminId != employee?.ReportingToId && !hrIds.Contains(adminId))
                {
                    notifList.Add(new Notification
                    {
                        EmployeeId = adminId,
                        Title = "📋 New Leave Request",
                        Message = $"{employee?.Name} applied for {days} day(s) of {leaveCode} leave.",
                        Type = "leave",
                        ActionRoute = "/(tabs)/leave",
                        RelatedLeaveId = application.Id,
                    });
                }
            }

            if (notifList.Any())
            {
                await _db.Notifications.AddRangeAsync(notifList);
                await _db.SaveChangesAsync();
            }

            return Ok(ApiResponse<LeaveApplicationDto>.Ok(MapToDto(application), "Leave application submitted successfully!"));
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin,hr,manager")]
        public async Task<ActionResult<ApiResponse<LeaveApplicationDto>>> UpdateStatus(
            int id, [FromBody] UpdateLeaveStatusRequest req)
        {
            int approverId = GetEmpId();
            string approverRole = GetRole();

            var leave = await _db.LeaveApplications
                .Include(l => l.Employee)
                .Include(l => l.ApprovedBy)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leave == null)
                return NotFound(ApiResponse<LeaveApplicationDto>.Fail("Application not found.", 404));

            if (leave.Status != "pending")
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail($"Leave is already {leave.Status}."));

            string normalizedStatus = req.Status.ToLower();
            if (normalizedStatus != "approved" && normalizedStatus != "rejected")
                return BadRequest(ApiResponse<LeaveApplicationDto>.Fail("Status must be 'approved' or 'rejected'."));

            if (approverRole == "manager")
            {
                bool isDirectReport = await _db.Employees
                    .AnyAsync(e => e.Id == leave.EmployeeId && e.ReportingToId == approverId);
                if (!isDirectReport) return Forbid();
            }

            leave.Status = normalizedStatus;
            leave.ApprovedById = approverId;
            leave.RejectionReason = req.RejectionReason;
            await _db.SaveChangesAsync();

            if (normalizedStatus == "approved")
            {
                var balance = await _db.LeaveBalances
                    .FirstOrDefaultAsync(b => b.EmployeeId == leave.EmployeeId && b.Year == DateTime.Now.Year);
                if (balance != null)
                {
                    int deduct = leave.Days;
                    switch (leave.LeaveType.ToUpper())
                    {
                        case "CL": balance.CL = Math.Max(0, balance.CL - deduct); break;
                        case "SL": balance.SL = Math.Max(0, balance.SL - deduct); break;
                        case "EL": balance.EL = Math.Max(0, balance.EL - deduct); break;
                        case "ML": balance.ML = Math.Max(0, balance.ML - deduct); break;
                        case "PL": balance.PL = Math.Max(0, balance.PL - deduct); break;
                        case "LOP": balance.LOP += deduct; break;
                    }
                    await _db.SaveChangesAsync();
                }
            }

            var approver = await _db.Employees.FindAsync(approverId);
            _db.Notifications.Add(new Notification
            {
                EmployeeId = leave.EmployeeId,
                Title = normalizedStatus == "approved" ? "✅ Leave Approved" : "❌ Leave Rejected",
                Message = normalizedStatus == "approved"
                    ? $"Your {leave.LeaveType} leave for {leave.Days} day(s) ({leave.FromDate:dd MMM} → {leave.ToDate:dd MMM}) has been approved by {approver?.Name ?? "your manager"}."
                    : $"Your {leave.LeaveType} leave was rejected by {approver?.Name ?? "your manager"}. Reason: {req.RejectionReason ?? "Not specified"}",
                Type = "leave",
                ActionRoute = "/(tabs)/leave",
                RelatedLeaveId = leave.Id,
            });
            await _db.SaveChangesAsync();

            await _db.Entry(leave).Reference(l => l.ApprovedBy).LoadAsync();
            return Ok(ApiResponse<LeaveApplicationDto>.Ok(MapToDto(leave), $"Leave {normalizedStatus}!"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            int empId = GetEmpId();
            string role = GetRole();
            var leave = await _db.LeaveApplications.FindAsync(id);

            if (leave == null) return NotFound(ApiResponse<string>.Fail("Not found.", 404));
            if (leave.EmployeeId != empId && role is not ("admin" or "hr")) return Forbid();
            if (leave.Status == "approved" && role is not ("admin" or "hr"))
                return BadRequest(ApiResponse<string>.Fail("Cannot delete an approved leave. Contact HR."));

            _db.LeaveApplications.Remove(leave);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("deleted", "Leave application deleted."));
        }

        // ── Private helpers ──────────────────────────────────────────────────

        private async Task<LeaveBalance> EnsureBalance(int empId)
        {
            var balance = await _db.LeaveBalances
                .FirstOrDefaultAsync(b => b.EmployeeId == empId && b.Year == DateTime.Now.Year);
            if (balance == null)
            {
                balance = new LeaveBalance
                {
                    EmployeeId = empId,
                    Year = DateTime.Now.Year,
                    CL = 12,
                    SL = 12,
                    EL = 15,
                    ML = 180,
                    PL = 15,
                    LOP = 0,
                };
                _db.LeaveBalances.Add(balance);
                await _db.SaveChangesAsync();
            }
            return balance;
        }

        private static int GetAvailableBalance(LeaveBalance b, string code) => code switch
        {
            "CL" => b.CL,
            "SL" => b.SL,
            "EL" => b.EL,
            "ML" => b.ML,
            "PL" => b.PL,
            "LOP" => int.MaxValue,
            _ => -1,
        };

        private static List<string> GetAllLeaveTypeCodes() =>
            new() { "CL", "SL", "EL", "ML", "PL", "LOP" };

        private static int GetDefaultLimit(string code) => code switch
        {
            "CL" => 12,
            "SL" => 12,
            "EL" => 15,
            "ML" => 180,
            "PL" => 15,
            "LOP" => 0,
            _ => 0,
        };

        private static LeaveBalanceDto MapBalanceToDto(LeaveBalance b) => new()
        {
            CL = b.CL,
            SL = b.SL,
            EL = b.EL,
            ML = b.ML,
            PL = b.PL,
            LOP = b.LOP,
            Year = b.Year,
        };

        private static LeaveApplicationDto MapToDto(LeaveApplication l) => new()
        {
            Id = l.Id,
            EmployeeId = l.EmployeeId,
            EmployeeName = l.Employee?.Name ?? "",
            EmployeeDesignation = l.Employee?.Designation ?? "",
            LeaveType = l.LeaveType,
            FromDate = l.FromDate.ToString("yyyy-MM-dd"),
            ToDate = l.ToDate.ToString("yyyy-MM-dd"),
            Days = l.Days,
            Reason = l.Reason,
            Status = l.Status,
            AppliedOn = l.AppliedOn.ToString("yyyy-MM-dd"),
            ApprovedByName = l.ApprovedBy?.Name,
            RejectionReason = l.RejectionReason,
            IsHalfDay = l.IsHalfDay,
        };
    }
}


