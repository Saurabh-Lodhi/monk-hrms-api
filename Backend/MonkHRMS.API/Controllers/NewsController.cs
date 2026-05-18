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
    public class NewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwt;

        public NewsController(AppDbContext db, IJwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        // GET /api/news
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<NewsDto>>>> GetAll()
        {
            var news = await _db.NewsItems
                .Where(n => n.IsActive)
                .Include(n => n.Author)
                .OrderByDescending(n => n.IsPinned)
                .ThenByDescending(n => n.PublishedAt)
                .ToListAsync();

            return Ok(ApiResponse<List<NewsDto>>.Ok(news.Select(MapToDto).ToList()));
        }

        // GET /api/news/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<NewsDto>>> GetById(int id)
        {
            var item = await _db.NewsItems
                .Include(n => n.Author)
                .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);

            if (item == null) return NotFound(ApiResponse<NewsDto>.Fail("Not found.", 404));

            item.Views++;
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<NewsDto>.Ok(MapToDto(item)));
        }

        // POST /api/news
        [HttpPost]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<NewsDto>>> Create([FromBody] CreateNewsRequest req)
        {
            var empId = _jwt.GetEmployeeIdFromToken(User);

            var newsItem = new NewsItem
            {
                Title = req.Title,
                Content = req.Content,
                Category = req.Category,
                IsUrgent = req.IsUrgent,
                IsPinned = req.IsPinned,
                Tags = req.Tags != null ? string.Join(",", req.Tags) : "",
                AuthorId = empId,
                PublishedAt = DateTime.UtcNow,
                Views = 0,
                IsActive = true,
            };

            _db.NewsItems.Add(newsItem);
            await _db.SaveChangesAsync();

            // Notify all active employees except the author
            var employeeIds = await _db.Employees
                .Where(e => e.IsActive && e.Id != empId)
                .Select(e => e.Id)
                .ToListAsync();

            var notifications = employeeIds.Select(eid => new Notification
            {
                EmployeeId = eid,
                Title = req.IsUrgent ? "🚨 Urgent: " + req.Title : "📢 " + req.Title,
                Message = req.Content.Length > 100 ? req.Content[..100] + "…" : req.Content,
                Type = "news",
                ActionRoute = $"/news/{newsItem.Id}",
                CreatedAt = DateTime.UtcNow,
            }).ToList();

            _db.Notifications.AddRange(notifications);
            await _db.SaveChangesAsync();

            // Re-fetch with Author included for the response
            var created = await _db.NewsItems
                .Include(n => n.Author)
                .FirstAsync(n => n.Id == newsItem.Id);

            return CreatedAtAction(nameof(GetById), new { id = newsItem.Id },
                ApiResponse<NewsDto>.Ok(MapToDto(created), "Announcement published successfully!"));
        }

        // DELETE /api/news/{id}  — soft delete to preserve notification links
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,hr")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var item = await _db.NewsItems.FindAsync(id);
            if (item == null) return NotFound(ApiResponse<string>.Fail("Not found.", 404));

            item.IsActive = false;   // soft delete
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("deleted", "Announcement deleted."));
        }

        private static NewsDto MapToDto(NewsItem n) => new()
        {
            Id = n.Id,
            Title = n.Title,
            Content = n.Content,
            Category = n.Category,
            IsUrgent = n.IsUrgent,
            IsPinned = n.IsPinned,
            Tags = string.IsNullOrEmpty(n.Tags)
                            ? new List<string>()
                            : n.Tags.Split(',').Select(t => t.Trim()).ToList(),
            AuthorName = n.Author?.Name ?? "Unknown",
            AuthorRole = n.Author?.Role ?? string.Empty,
            AuthorAvatar = n.Author?.Avatar,
            PublishedAt = n.PublishedAt.ToString("yyyy-MM-dd HH:mm"),
            Views = n.Views,
        };
    }
}