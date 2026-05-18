// ─── 1. ADD to your existing NotificationDto class in DTOs ───────────────────
// Find NotificationDto and add this one property:
//
//   public int? RelatedLeaveId { get; set; }
//
// Full NotificationDto should look like:
//
// public class NotificationDto
// {
//     public int Id { get; set; }
//     public string Title { get; set; } = string.Empty;
//     public string Message { get; set; } = string.Empty;
//     public string Type { get; set; } = string.Empty;
//     public bool IsRead { get; set; }
//     public string CreatedAt { get; set; } = string.Empty;
//     public string? ActionRoute { get; set; }
//     public int? RelatedLeaveId { get; set; }   // ← ADD THIS
// }


// ─── 2. UPDATE MapToDto in NotificationsController ───────────────────────────
// Find the MapToDto method and replace it with this:

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
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public NotificationsController(AppDbContext db, IJwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetMine()
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var list = await _db.Notifications
                .Where(n => n.EmployeeId == empId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();
            return Ok(ApiResponse<List<NotificationDto>>.Ok(list.Select(MapToDto).ToList()));
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var count = await _db.Notifications.CountAsync(n => n.EmployeeId == empId && !n.IsRead);
            return Ok(ApiResponse<int>.Ok(count));
        }

        [HttpPatch("{id}/read")]
        public async Task<ActionResult<ApiResponse<string>>> MarkRead(int id)
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var notif = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.EmployeeId == empId);
            if (notif == null) return NotFound(ApiResponse<string>.Fail("Not found.", 404));
            notif.IsRead = true;
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("read", "Marked as read."));
        }

        [HttpPatch("mark-all-read")]
        public async Task<ActionResult<ApiResponse<string>>> MarkAllRead()
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);
            var unread = await _db.Notifications.Where(n => n.EmployeeId == empId && !n.IsRead).ToListAsync();
            unread.ForEach(n => n.IsRead = true);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("all-read", $"Marked {unread.Count} notifications as read."));
        }

        // ── MapToDto now includes RelatedLeaveId ─────────────────────────────
        private static NotificationDto MapToDto(Notification n) => new()
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            ActionRoute = n.ActionRoute,
            RelatedLeaveId = n.RelatedLeaveId,   // ← sends to frontend
        };
    }
}