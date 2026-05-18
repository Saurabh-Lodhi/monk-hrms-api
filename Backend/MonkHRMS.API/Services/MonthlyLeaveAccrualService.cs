// ─── MonthlyLeaveAccrualService.cs ────────────────────────────────────────────
// Place in Services/ folder
// Register in Program.cs: builder.Services.AddHostedService<MonthlyLeaveAccrualService>();

using Microsoft.EntityFrameworkCore;
using MonkHRMS.API.Data;
using MonkHRMS.API.Models;

namespace MonkHRMS.API.Services
{
    public class MonthlyLeaveAccrualService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<MonthlyLeaveAccrualService> _logger;

        public MonthlyLeaveAccrualService(
            IServiceScopeFactory scopeFactory,
            ILogger<MonthlyLeaveAccrualService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;

                // Run on the 1st of every month
                if (now.Day == 1)
                {
                    await TryAccrueAsync(now.Year, now.Month);
                }

                // Check again in 6 hours
                await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            }
        }

        private async Task TryAccrueAsync(int year, int month)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                // Idempotency check — skip if already done this month
                var alreadyDone = await db.LeaveAccrualLogs
                    .AnyAsync(l => l.Year == year && l.Month == month);

                if (alreadyDone)
                {
                    _logger.LogInformation("Leave accrual for {Month}/{Year} already done. Skipping.", month, year);
                    return;
                }

                var activeEmployees = await db.Employees
                    .Where(e => e.IsActive)
                    .Select(e => e.Id)
                    .ToListAsync();

                int count = 0;

                foreach (var empId in activeEmployees)
                {
                    var balance = await db.LeaveBalances
                        .FirstOrDefaultAsync(b => b.EmployeeId == empId && b.Year == year);

                    if (balance == null)
                    {
                        balance = new LeaveBalance
                        {
                            EmployeeId = empId,
                            Year = year,
                            CL = 12, SL = 12, EL = 15, ML = 180, PL = 15, LOP = 0,
                        };
                        db.LeaveBalances.Add(balance);
                    }

                    // Add 1.5 EL per month:
                    // Since DB stores int, alternate between +1 and +2 to average 1.5/month
                    // Month 1→6: odd months +1, even months +2 = (1+2)*6/12 = 1.5 ✓
                    var accrualAmount = (month % 2 == 0) ? 2 : 1;
                    balance.EL += accrualAmount;
                    count++;
                }

                db.LeaveAccrualLogs.Add(new LeaveAccrualLog
                {
                    Year = year,
                    Month = month,
                    ProcessedAt = DateTime.UtcNow,
                    EmployeesProcessed = count,
                });

                await db.SaveChangesAsync();
                _logger.LogInformation("✅ Leave accrual done for {Month}/{Year}: {Count} employees processed.", month, year, count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Leave accrual failed for {Month}/{Year}", month, year);
            }
        }
    }
}

// ─── ADD TO Program.cs ────────────────────────────────────────────────────────
// After builder.Services.AddScoped<IJwtService, JwtService>();
// Add:
// builder.Services.AddHostedService<MonthlyLeaveAccrualService>();
