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
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public EmployeesController(AppDbContext db, IJwtService jwt) { _db = db; _jwt = jwt; }

        /// <summary>GET /api/employees — List all employees (salary shown only to HR/Admin)</summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<EmployeeDto>>>> GetAll(
            [FromQuery] string? search, [FromQuery] string? department,
            [FromQuery] string? company, [FromQuery] string? role,
            [FromQuery] bool? isActive)
        {
            var currentId = _jwt.GetEmployeeIdFromToken(User);
            var currentRole = _jwt.GetRoleFromToken(User);
            var canSeeSalary = currentRole is "admin" or "hr";

            var query = _db.Employees
                .Include(e => e.ReportingTo)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e => e.Name.Contains(search) || e.Email.Contains(search) || e.EmployeeCode.Contains(search) || e.Designation.Contains(search));

            if (!string.IsNullOrEmpty(department)) query = query.Where(e => e.Department == department);
            if (!string.IsNullOrEmpty(company)) query = query.Where(e => e.Company == company);
            if (!string.IsNullOrEmpty(role)) query = query.Where(e => e.Role == role);
            if (isActive.HasValue) query = query.Where(e => e.IsActive == isActive.Value);

            var employees = await query.OrderBy(e => e.Name).ToListAsync();
            var dtos = employees.Select(e => MapToDto(e, canSeeSalary || e.Id == currentId, canSeeSalary || e.Id == currentId)).ToList();

            return Ok(ApiResponse<List<EmployeeDto>>.Ok(dtos));
        }

        /// <summary>GET /api/employees/{id} — Get single employee</summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> GetById(int id)
        {
            var currentId = _jwt.GetEmployeeIdFromToken(User);
            var currentRole = _jwt.GetRoleFromToken(User);
            var canSeePrivate = currentRole is "admin" or "hr" || currentId == id;
            var canSeeSalary = currentRole is "admin" or "hr" || currentId == id;

            var emp = await _db.Employees.Include(e => e.ReportingTo).FirstOrDefaultAsync(e => e.Id == id);
            if (emp == null) return NotFound(ApiResponse<EmployeeDto>.Fail("Employee not found.", 404));

            return Ok(ApiResponse<EmployeeDto>.Ok(MapToDto(emp, canSeeSalary, canSeePrivate)));
        }

        /// <summary>POST /api/employees — Create new employee (Admin/HR only)</summary>
        [HttpPost]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> Create([FromBody] CreateEmployeeRequest req)
        {
            if (await _db.Employees.AnyAsync(e => e.Email == req.Email))
                return Conflict(ApiResponse<EmployeeDto>.Fail("Email already exists."));

            var lastCode = await _db.Employees.MaxAsync(e => (string?)e.EmployeeCode) ?? "EMP000";
            var nextNum = int.Parse(lastCode.Replace("EMP", "")) + 1;
            var newCode = $"EMP{nextNum:D3}";

            var emp = new Employee
            {
                EmployeeCode = newCode,
                Name = req.Name, Designation = req.Designation, Department = req.Department,
                Company = req.Company, Role = req.Role, Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 8),
                Phone = req.Phone, Avatar = req.Avatar,
                DateOfBirth = DateTime.Parse(req.DateOfBirth),
                DateOfJoining = DateTime.Parse(req.DateOfJoining),
                BloodGroup = req.BloodGroup, Address = req.Address,
                Salary = req.Salary, ReportingToId = req.ReportingToId,
                EmploymentType = req.EmploymentType, Gender = req.Gender,
                FingerprintId = req.FingerprintId, PanCard = req.PanCard,
                Aadhar = req.Aadhar, BankAccount = req.BankAccount,
                Ifsc = req.Ifsc, EmergencyContact = req.EmergencyContact,
                IsActive = true,
            };

            _db.Employees.Add(emp);
            await _db.SaveChangesAsync();

            // Create leave balance
            _db.LeaveBalances.Add(new LeaveBalance { EmployeeId = emp.Id, Year = DateTime.Now.Year });
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = emp.Id },
                ApiResponse<EmployeeDto>.Ok(MapToDto(emp, true, true), $"Employee {newCode} created successfully!"));
        }

        /// <summary>PUT /api/employees/{id} — Update employee (Admin/HR only)</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> Update(int id, [FromBody] UpdateEmployeeRequest req)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return NotFound(ApiResponse<EmployeeDto>.Fail("Employee not found.", 404));

            emp.Name = req.Name; emp.Designation = req.Designation;
            emp.Department = req.Department; emp.Company = req.Company;
            emp.Role = req.Role; emp.Phone = req.Phone;
            if (!string.IsNullOrEmpty(req.Avatar)) emp.Avatar = req.Avatar;
            if (!string.IsNullOrEmpty(req.DateOfBirth)) emp.DateOfBirth = DateTime.Parse(req.DateOfBirth);
            if (!string.IsNullOrEmpty(req.DateOfJoining)) emp.DateOfJoining = DateTime.Parse(req.DateOfJoining);
            emp.BloodGroup = req.BloodGroup; emp.Address = req.Address;
            emp.Salary = req.Salary; emp.ReportingToId = req.ReportingToId;
            emp.EmploymentType = req.EmploymentType; emp.Gender = req.Gender;
            emp.FingerprintId = req.FingerprintId; emp.PanCard = req.PanCard;
            emp.Aadhar = req.Aadhar; emp.BankAccount = req.BankAccount;
            emp.Ifsc = req.Ifsc; emp.EmergencyContact = req.EmergencyContact;
            if (!string.IsNullOrEmpty(req.Password))
                emp.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 8);
            emp.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<EmployeeDto>.Ok(MapToDto(emp, true, true), "Employee updated successfully!"));
        }

        /// <summary>PATCH /api/employees/{id}/toggle-status — Enable/Disable (Admin/HR only)</summary>
        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<string>>> ToggleStatus(int id)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return NotFound(ApiResponse<string>.Fail("Employee not found.", 404));

            emp.IsActive = !emp.IsActive;
            emp.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<string>.Ok(emp.IsActive ? "enabled" : "disabled",
                $"Employee {(emp.IsActive ? "enabled" : "disabled")} successfully."));
        }

        /// <summary>DELETE /api/employees/{id} — Delete employee (Admin only)</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return NotFound(ApiResponse<string>.Fail("Employee not found.", 404));

            _db.Employees.Remove(emp);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("deleted", "Employee deleted successfully."));
        }

        private static EmployeeDto MapToDto(Employee e, bool canSeeSalary, bool canSeePrivate) => new()
        {
            Id = e.Id, EmployeeCode = e.EmployeeCode, Name = e.Name,
            Designation = e.Designation, Department = e.Department,
            Company = e.Company, Role = e.Role, Email = e.Email,
            Phone = canSeePrivate ? e.Phone : "••••••••",
            Avatar = e.Avatar,
            DateOfBirth = e.DateOfBirth.ToString("yyyy-MM-dd"),
            DateOfJoining = e.DateOfJoining.ToString("yyyy-MM-dd"),
            BloodGroup = e.BloodGroup, Address = e.Address,
            Salary = canSeeSalary ? e.Salary : null,
            Quote = e.Quote, ReportingToId = e.ReportingToId,
            ReportingToName = e.ReportingTo?.Name,
            EmploymentType = e.EmploymentType, Gender = e.Gender,
            IsActive = e.IsActive,
            FingerprintId = canSeePrivate ? e.FingerprintId : null,
            PanCard = canSeePrivate ? e.PanCard : null,
            Aadhar = canSeePrivate ? e.Aadhar : null,
            BankAccount = canSeePrivate ? e.BankAccount : null,
            Ifsc = canSeePrivate ? e.Ifsc : null,
            EmergencyContact = canSeePrivate ? e.EmergencyContact : null,
        };
    }
}
