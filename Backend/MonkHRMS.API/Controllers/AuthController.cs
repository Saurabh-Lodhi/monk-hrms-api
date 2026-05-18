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
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public AuthController(AppDbContext db, IJwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        /// <summary>
        /// Login with email and password. Returns JWT token + employee info.
        /// </summary>
        //[HttpPost("login")]
        //public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        //{
        //    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        //        return BadRequest(ApiResponse<LoginResponse>.Fail("Email and password are required."));

        //    var employee = await _db.Employees
        //        .FirstOrDefaultAsync(e => e.Email.ToLower() == request.Email.ToLower().Trim());

        //    if (employee == null)
        //        return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password.", 401));

        //    if (!BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
        //        return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password.", 401));

        //    if (!employee.IsActive)
        //        return Unauthorized(ApiResponse<LoginResponse>.Fail("Your account has been disabled. Please contact HR.", 401));

        //    var token = _jwt.GenerateToken(employee);

        //    var response = new LoginResponse
        //    {
        //        Token = token,
        //        RefreshToken = Guid.NewGuid().ToString(), // simplified
        //        ExpiresAt = DateTime.UtcNow.AddDays(7),
        //        Employee = MapToDto(employee, includePrivate: true)
        //    };

        //    return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful!"));
        //}
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(ApiResponse<LoginResponse>.Fail("Email and password are required."));

            var email = request.Email.Trim().ToLower();

            var employee = await _db.Employees
                .AsNoTracking() // 🔥 faster query
                .FirstOrDefaultAsync(e => e.Email.ToLower() == email);

            if (employee == null)
                return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password.", 401));

            // 🔥 BCrypt (main delay)
            if (!BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
                return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password.", 401));

            if (!employee.IsActive)
                return Unauthorized(ApiResponse<LoginResponse>.Fail("Your account has been disabled. Please contact HR.", 401));

            var token = _jwt.GenerateToken(employee);

            return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
            {
                Token = token,
                RefreshToken = Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Employee = MapToDto(employee, includePrivate: true)
            }, "Login successful!"));
        }

        /// <summary>
        /// Validate current token and return employee info.
        /// </summary>
        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> Me()
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var employee = await _db.Employees.FindAsync(empId);

            if (employee == null || !employee.IsActive)
                return Unauthorized(ApiResponse<EmployeeDto>.Fail("Account not found or disabled.", 401));

            return Ok(ApiResponse<EmployeeDto>.Ok(MapToDto(employee, includePrivate: true)));
        }

        private static EmployeeDto MapToDto(Employee e, bool includePrivate = false) => new()
        {
            Id = e.Id,
            EmployeeCode = e.EmployeeCode,
            Name = e.Name,
            Designation = e.Designation,
            Department = e.Department,
            Company = e.Company,
            Role = e.Role,
            Email = e.Email,
            Phone = e.Phone,
            Avatar = e.Avatar,
            DateOfBirth = e.DateOfBirth.ToString("yyyy-MM-dd"),
            DateOfJoining = e.DateOfJoining.ToString("yyyy-MM-dd"),
            BloodGroup = e.BloodGroup,
            Address = e.Address,
            Salary = includePrivate ? e.Salary : null,
            Quote = e.Quote,
            ReportingToId = e.ReportingToId,
            EmploymentType = e.EmploymentType,
            Gender = e.Gender,
            IsActive = e.IsActive,
            FingerprintId = includePrivate ? e.FingerprintId : null,
            PanCard = includePrivate ? e.PanCard : null,
            Aadhar = includePrivate ? e.Aadhar : null,
            BankAccount = includePrivate ? e.BankAccount : null,
            Ifsc = includePrivate ? e.Ifsc : null,
            EmergencyContact = includePrivate ? e.EmergencyContact : null,
        };
    }
}
