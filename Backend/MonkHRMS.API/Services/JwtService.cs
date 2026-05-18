using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MonkHRMS.API.Models;

namespace MonkHRMS.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(Employee employee);
        ClaimsPrincipal? ValidateToken(string token);
        int GetEmployeeIdFromToken(ClaimsPrincipal principal);
        string GetRoleFromToken(ClaimsPrincipal principal);
    }

    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config) => _config = config;

        public string GenerateToken(Employee employee)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, employee.Id.ToString()),
                new Claim(ClaimTypes.Email, employee.Email),
                new Claim(ClaimTypes.Name, employee.Name),
                new Claim(ClaimTypes.Role, employee.Role),
                new Claim("employeeCode", employee.EmployeeCode),
                new Claim("company", employee.Company),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
                var handler = new JwtSecurityTokenHandler();
                return handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = true,
                }, out _);
            }
            catch { return null; }
        }

        public int GetEmployeeIdFromToken(ClaimsPrincipal principal) =>
            int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        public string GetRoleFromToken(ClaimsPrincipal principal) =>
            principal.FindFirstValue(ClaimTypes.Role) ?? "employee";
    }
}
