using MonkHRMS.API.Models;

namespace MonkHRMS.API.Data.Seeders
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            // Already seeded
            if (db.Employees.Any()) return;

            Console.WriteLine("🌱 Seeding database...");

            // ── Employees ─────────────────────────────────────────────────────
            var employees = new List<Employee>
            {
                new() { EmployeeCode="EMP001", Name="Kuldeep Tyagi", Designation="Founder & CEO", Department="leadership", Company="monk-outsourcing", Role="admin", Email="kuldeep@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00001", Avatar="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1985,3,15), DateOfJoining=new DateTime(2018,1,1), BloodGroup="O+", Address="Noida, Uttar Pradesh", Salary=250000, Quote="\"Excellence isn't an act, it's a habit.\"", ReportingToId=null, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP001", PanCard="AABCT1234A", Aadhar="XXXX XXXX 0001", BankAccount="XXXX XXXX 1001", Ifsc="HDFC0001234", EmergencyContact="+91 98765 99001" },
                new() { EmployeeCode="EMP002", Name="Neelam Tyagi", Designation="Co-Founder & COO", Department="leadership", Company="monk-outsourcing", Role="admin", Email="neelam@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00002", Avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1988,7,22), DateOfJoining=new DateTime(2018,1,1), BloodGroup="A+", Address="Noida, Uttar Pradesh", Salary=220000, ReportingToId=null, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP002", PanCard="AABCT5678B", Aadhar="XXXX XXXX 0002", BankAccount="XXXX XXXX 1002", Ifsc="HDFC0001234", EmergencyContact="+91 98765 99002" },
                new() { EmployeeCode="EMP003", Name="Rahul Sharma", Designation="Chief Technology Officer", Department="it", Company="monk-travel-tech", Role="manager", Email="rahul.sharma@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00003", Avatar="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1987,11,30), DateOfJoining=new DateTime(2018,6,1), BloodGroup="B+", Address="Sector 62, Noida", Salary=180000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP003", PanCard="AABCS1234C", Aadhar="XXXX XXXX 0003", BankAccount="XXXX XXXX 1003", Ifsc="ICIC0001234", EmergencyContact="+91 98765 99003" },
                new() { EmployeeCode="EMP004", Name="Priya Verma", Designation="HR Manager", Department="hr", Company="monk-outsourcing", Role="hr", Email="priya.verma@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00004", Avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1991,4,18), DateOfJoining=new DateTime(2019,3,15), BloodGroup="AB+", Address="Greater Noida, UP", Salary=85000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP004", PanCard="AABCV1234D", Aadhar="XXXX XXXX 0004", BankAccount="XXXX XXXX 1004", Ifsc="SBIN0001234", EmergencyContact="+91 98765 99004" },
                new() { EmployeeCode="EMP005", Name="Amit Gupta", Designation="Senior SEO Manager", Department="seo", Company="monk-outsourcing", Role="manager", Email="amit.gupta@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00005", Avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1989,9,5), DateOfJoining=new DateTime(2019,7,1), BloodGroup="O-", Address="Indirapuram, Ghaziabad", Salary=95000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP005", PanCard="AABCG1234E", Aadhar="XXXX XXXX 0005", BankAccount="XXXX XXXX 1005", Ifsc="AXIS0001234", EmergencyContact="+91 98765 99005" },
                new() { EmployeeCode="EMP006", Name="Sneha Kapoor", Designation="SEO Analyst", Department="seo", Company="monk-outsourcing", Role="employee", Email="sneha.kapoor@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00006", Avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1995,2,14), DateOfJoining=new DateTime(2021,1,10), BloodGroup="A-", Address="Vasundhara, Ghaziabad", Salary=45000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP006", PanCard="AABCK1234F", Aadhar="XXXX XXXX 0006", BankAccount="XXXX XXXX 1006", Ifsc="HDFC0005678", EmergencyContact="+91 98765 99006" },
                new() { EmployeeCode="EMP007", Name="Rohit Mishra", Designation="Full Stack Developer", Department="it", Company="monk-travel-tech", Role="employee", Email="rohit.mishra@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00007", Avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1993,6,28), DateOfJoining=new DateTime(2020,8,1), BloodGroup="B-", Address="Sector 18, Noida", Salary=75000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP007", PanCard="AABCM1234G", Aadhar="XXXX XXXX 0007", BankAccount="XXXX XXXX 1007", Ifsc="KOTAK0001234", EmergencyContact="+91 98765 99007" },
                new() { EmployeeCode="EMP008", Name="Divya Saxena", Designation="UI/UX Designer", Department="design", Company="monk-outsourcing", Role="employee", Email="divya.saxena@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00008", Avatar="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1996,12,1), DateOfJoining=new DateTime(2021,5,20), BloodGroup="O+", Address="Mayur Vihar, Delhi", Salary=55000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP008", PanCard="AABCS5678H", Aadhar="XXXX XXXX 0008", BankAccount="XXXX XXXX 1008", Ifsc="PNB00001234", EmergencyContact="+91 98765 99008" },
                new() { EmployeeCode="EMP009", Name="Vikash Singh", Designation="Sales Executive", Department="sales", Company="monk-travel-tech", Role="employee", Email="vikash.singh@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00009", Avatar="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1994,8,17), DateOfJoining=new DateTime(2022,2,1), BloodGroup="AB-", Address="Sector 45, Noida", Salary=40000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP009", PanCard="AABCS9012I", Aadhar="XXXX XXXX 0009", BankAccount="XXXX XXXX 1009", Ifsc="IDBI0001234", EmergencyContact="+91 98765 99009" },
                new() { EmployeeCode="EMP010", Name="Anjali Mehta", Designation="HR Executive", Department="hr", Company="monk-outsourcing", Role="hr", Email="anjali.mehta@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00010", Avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1997,3,25), DateOfJoining=new DateTime(2022,6,15), BloodGroup="B+", Address="Kaushambi, Ghaziabad", Salary=38000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP010", PanCard="AABCM5678J", Aadhar="XXXX XXXX 0010", BankAccount="XXXX XXXX 1010", Ifsc="BOI00001234", EmergencyContact="+91 98765 99010" },
                new() { EmployeeCode="EMP011", Name="Suresh Yadav", Designation="Senior Developer", Department="it", Company="monk-travel-tech", Role="employee", Email="suresh.yadav@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00011", Avatar="https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1990,1,12), DateOfJoining=new DateTime(2019,11,1), BloodGroup="A+", Address="Indirapuram, Ghaziabad", Salary=90000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP011", PanCard="AABCY1234K", Aadhar="XXXX XXXX 0011", BankAccount="XXXX XXXX 1011", Ifsc="ICIC0005678", EmergencyContact="+91 98765 99011" },
                new() { EmployeeCode="EMP012", Name="Pooja Rawat", Designation="Content Writer", Department="seo", Company="monk-outsourcing", Role="employee", Email="pooja.rawat@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00012", Avatar="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1998,5,30), DateOfJoining=new DateTime(2023,1,15), BloodGroup="O-", Address="Noida Extension", Salary=32000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP012", PanCard="AABCR1234L", Aadhar="XXXX XXXX 0012", BankAccount="XXXX XXXX 1012", Ifsc="SBI00009012", EmergencyContact="+91 98765 99012" },
                new() { EmployeeCode="EMP013", Name="Manish Kumar", Designation="Sales Manager", Department="sales", Company="monk-travel-tech", Role="manager", Email="manish.kumar@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00013", Avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1988,10,3), DateOfJoining=new DateTime(2019,4,1), BloodGroup="B+", Address="Sector 93, Noida", Salary=110000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP013", PanCard="AABCK5678M", Aadhar="XXXX XXXX 0013", BankAccount="XXXX XXXX 1013", Ifsc="AXIS0005678", EmergencyContact="+91 98765 99013" },
                new() { EmployeeCode="EMP014", Name="Kavya Nair", Designation="Graphic Designer", Department="design", Company="monk-outsourcing", Role="employee", Email="kavya.nair@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00014", Avatar="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1999,7,11), DateOfJoining=new DateTime(2023,7,1), BloodGroup="AB+", Address="Greater Noida", Salary=30000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP014", PanCard="AABCN1234N", Aadhar="XXXX XXXX 0014", BankAccount="XXXX XXXX 1014", Ifsc="HDFC0009012", EmergencyContact="+91 98765 99014" },
                new() { EmployeeCode="EMP015", Name="Arjun Pandey", Designation="Backend Developer", Department="it", Company="monk-travel-tech", Role="employee", Email="arjun.pandey@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00015", Avatar="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1992,12,20), DateOfJoining=new DateTime(2020,3,1), BloodGroup="O+", Address="Sector 62, Noida", Salary=80000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP015", PanCard="AABCP5678O", Aadhar="XXXX XXXX 0015", BankAccount="XXXX XXXX 1015", Ifsc="KOTAK0005678", EmergencyContact="+91 98765 99015" },
                new() { EmployeeCode="EMP016", Name="Ritu Sharma", Designation="Accounts Manager", Department="accounts", Company="monk-outsourcing", Role="manager", Email="ritu.sharma@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00016", Avatar="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1986,9,14), DateOfJoining=new DateTime(2018,8,1), BloodGroup="A-", Address="Vaishali, Ghaziabad", Salary=100000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP016", PanCard="AABCS9012P", Aadhar="XXXX XXXX 0016", BankAccount="XXXX XXXX 1016", Ifsc="SBIN0005678", EmergencyContact="+91 98765 99016" },
                new() { EmployeeCode="EMP017", Name="Deepak Joshi", Designation="SEO Specialist", Department="seo", Company="monk-outsourcing", Role="employee", Email="deepak.joshi@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00017", Avatar="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1994,11,22), DateOfJoining=new DateTime(2021,9,1), BloodGroup="B-", Address="Crossings Republik", Salary=50000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP017", PanCard="AABCJ1234Q", Aadhar="XXXX XXXX 0017", BankAccount="XXXX XXXX 1017", Ifsc="PNB00005678", EmergencyContact="+91 98765 99017" },
                new() { EmployeeCode="EMP018", Name="Meera Pillai", Designation="Operations Executive", Department="operations", Company="monk-travel-tech", Role="employee", Email="meera.pillai@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00018", Avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1995,3,8), DateOfJoining=new DateTime(2022,10,1), BloodGroup="O+", Address="Noida, UP", Salary=42000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP018", PanCard="AABCP9012R", Aadhar="XXXX XXXX 0018", BankAccount="XXXX XXXX 1018", Ifsc="BOI00005678", EmergencyContact="+91 98765 99018" },
                new() { EmployeeCode="EMP019", Name="Aakash Chandra", Designation="Marketing Executive", Department="sales", Company="monk-travel-tech", Role="employee", Email="aakash.chandra@monktraveltech.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00019", Avatar="https://images.unsplash.com/photo-1542178243-bc20204b769f?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1996,6,16), DateOfJoining=new DateTime(2023,3,15), BloodGroup="AB-", Address="Sector 50, Noida", Salary=36000, EmploymentType="Full-time", Gender="Male", IsActive=true, FingerprintId="FP019", PanCard="AABCC1234S", Aadhar="XXXX XXXX 0019", BankAccount="XXXX XXXX 1019", Ifsc="IDBI0005678", EmergencyContact="+91 98765 99019" },
                new() { EmployeeCode="EMP020", Name="Tanvi Agarwal", Designation="Web Developer", Department="it", Company="monk-outsourcing", Role="employee", Email="tanvi.agarwal@monkoutsourcing.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("monk@123"), Phone="+91 98765 00020", Avatar="https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=200&h=200&fit=crop&crop=face", DateOfBirth=new DateTime(1997,10,7), DateOfJoining=new DateTime(2022,4,1), BloodGroup="A+", Address="Vasundhara, Ghaziabad", Salary=58000, EmploymentType="Full-time", Gender="Female", IsActive=true, FingerprintId="FP020", PanCard="AABCA5678T", Aadhar="XXXX XXXX 0020", BankAccount="XXXX XXXX 1020", Ifsc="ICIC0009012", EmergencyContact="+91 98765 99020" },
            };

            // Set reporting relationships after all employees added
            await db.Employees.AddRangeAsync(employees);
            await db.SaveChangesAsync();

            // Fix reporting-to IDs
            var empMap = employees.ToDictionary(e => e.EmployeeCode, e => e.Id);
            employees[2].ReportingToId = empMap["EMP001"];  // Rahul → Kuldeep
            employees[3].ReportingToId = empMap["EMP002"];  // Priya → Neelam
            employees[4].ReportingToId = empMap["EMP001"];  // Amit → Kuldeep
            employees[5].ReportingToId = empMap["EMP005"];  // Sneha → Amit
            employees[6].ReportingToId = empMap["EMP003"];  // Rohit → Rahul
            employees[7].ReportingToId = empMap["EMP001"];  // Divya → Kuldeep
            employees[8].ReportingToId = empMap["EMP013"];  // Vikash → Manish
            employees[9].ReportingToId = empMap["EMP004"];  // Anjali → Priya
            employees[10].ReportingToId = empMap["EMP003"]; // Suresh → Rahul
            employees[11].ReportingToId = empMap["EMP005"]; // Pooja → Amit
            employees[12].ReportingToId = empMap["EMP001"]; // Manish → Kuldeep
            employees[13].ReportingToId = empMap["EMP008"]; // Kavya → Divya
            employees[14].ReportingToId = empMap["EMP003"]; // Arjun → Rahul
            employees[15].ReportingToId = empMap["EMP001"]; // Ritu → Kuldeep
            employees[16].ReportingToId = empMap["EMP005"]; // Deepak → Amit
            employees[17].ReportingToId = empMap["EMP002"]; // Meera → Neelam
            employees[18].ReportingToId = empMap["EMP013"]; // Aakash → Manish
            employees[19].ReportingToId = empMap["EMP003"]; // Tanvi → Rahul
            await db.SaveChangesAsync();

            // ── Leave Balances ─────────────────────────────────────────────────
            var balances = employees.Select(e => new LeaveBalance
            {
                EmployeeId = e.Id, Year = DateTime.Now.Year,
                CL = 10, SL = 11, EL = 14, ML = 180, PL = 15, LOP = 0
            }).ToList();
            await db.LeaveBalances.AddRangeAsync(balances);

            // ── Sample Leave Applications ──────────────────────────────────────
            await db.LeaveApplications.AddRangeAsync(new List<LeaveApplication>
            {
                new() { EmployeeId=empMap["EMP006"], LeaveType="cl", FromDate=new DateTime(2025,3,20), ToDate=new DateTime(2025,3,21), Days=2, Reason="Personal work", Status="approved", AppliedOn=new DateTime(2025,3,10), ApprovedById=empMap["EMP004"] },
                new() { EmployeeId=empMap["EMP007"], LeaveType="sl", FromDate=new DateTime(2025,3,15), ToDate=new DateTime(2025,3,15), Days=1, Reason="Not feeling well", Status="approved", AppliedOn=new DateTime(2025,3,14), ApprovedById=empMap["EMP003"] },
                new() { EmployeeId=empMap["EMP009"], LeaveType="cl", FromDate=new DateTime(2025,4,1), ToDate=new DateTime(2025,4,3), Days=3, Reason="Family function", Status="pending", AppliedOn=new DateTime(2025,3,12) },
                new() { EmployeeId=empMap["EMP012"], LeaveType="el", FromDate=new DateTime(2025,3,25), ToDate=new DateTime(2025,3,28), Days=4, Reason="Vacation", Status="pending", AppliedOn=new DateTime(2025,3,15) },
            });

            // ── News ───────────────────────────────────────────────────────────
            await db.NewsItems.AddRangeAsync(new List<NewsItem>
            {
                new() { Title="POSH Act Implementation – Mandatory Training", Category="Policy", Content="All employees must complete mandatory POSH awareness training by March 31, 2025. Non-compliance will result in disciplinary action.", IsUrgent=true, IsPinned=true, AuthorId=empMap["EMP004"], Tags="POSH,Mandatory,Compliance", PublishedAt=new DateTime(2025,3,10) },
                new() { Title="New Work From Home Policy Effective April 2025", Category="Policy", Content="Employees can now WFH up to 2 days per week with manager approval. Core hours 10 AM - 4 PM must be maintained.", IsUrgent=false, AuthorId=empMap["EMP002"], Tags="WFH,Policy", PublishedAt=new DateTime(2025,3,8) },
                new() { Title="Q1 2025 Performance Review Schedule", Category="HR", Content="Q1 Performance reviews will be conducted from March 15-31, 2025. All managers must complete team evaluations by March 28.", IsUrgent=false, AuthorId=empMap["EMP004"], Tags="Performance,Review,Q1", PublishedAt=new DateTime(2025,3,5) },
                new() { Title="🏆 Monk Group Achieves 10+ International Awards", Category="Announcement", Content="We are proud to announce Monk Outsourcing has been recognized by top-tier global award platforms.", IsUrgent=false, IsPinned=true, AuthorId=empMap["EMP001"], Tags="Achievement,Award", PublishedAt=new DateTime(2025,2,28) },
                new() { Title="Health Insurance Enrollment – Deadline March 20", Category="Benefits", Content="All employees who have not enrolled in the company health insurance plan must do so by March 20, 2025.", IsUrgent=true, AuthorId=empMap["EMP010"], Tags="Health,Benefits,Deadline", PublishedAt=new DateTime(2025,3,1) },
            });

            // ── Holidays ───────────────────────────────────────────────────────
            await db.Holidays.AddRangeAsync(new List<Holiday>
            {
                new() { Date=new DateTime(2025,1,26), Name="Republic Day", Icon="🇮🇳", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,3,14), Name="Holi", Icon="🎨", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,4,14), Name="Dr. Ambedkar Jayanti", Icon="🙏", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,4,18), Name="Good Friday", Icon="✝️", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,8,15), Name="Independence Day", Icon="🇮🇳", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,9,15), Name="Monk Foundation Day", Icon="🏆", Type="company", Year=2025 },
                new() { Date=new DateTime(2025,10,2), Name="Gandhi Jayanti", Icon="🕊️", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,10,20), Name="Dussehra", Icon="🏹", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,11,5), Name="Diwali", Icon="🪔", Type="national", Year=2025 },
                new() { Date=new DateTime(2025,12,25), Name="Christmas Day", Icon="🎄", Type="national", Year=2025 },
            });

            // ── Events (birthdays + meetings) ──────────────────────────────────
            var year = DateTime.Now.Year;
            var events = new List<CalendarEvent>();
            foreach (var emp in employees)
            {
                var bday = new DateTime(year, emp.DateOfBirth.Month, emp.DateOfBirth.Day);
                events.Add(new CalendarEvent { Title=$"🎂 {emp.Name}'s Birthday", EventDate=bday, Type="birthday", RelatedEmployeeId=emp.Id, CreatedById=empMap["EMP001"], Color="#E91E63", IsAllDay=true, IsAutoGenerated=true });

                var anniv = new DateTime(year, emp.DateOfJoining.Month, emp.DateOfJoining.Day);
                var years = year - emp.DateOfJoining.Year;
                if (years > 0)
                    events.Add(new CalendarEvent { Title=$"🏆 {emp.Name} — {years} Year Anniversary", EventDate=anniv, Type="anniversary", RelatedEmployeeId=emp.Id, CreatedById=empMap["EMP001"], Color="#F5A623", IsAllDay=true, IsAutoGenerated=true });
            }
            events.Add(new CalendarEvent { Title="Q1 Town Hall Meeting", Description="Company-wide town hall. Q1 results and Q2 plan.", EventDate=new DateTime(2025,3,25), EventTime="11:00 AM", Type="meeting", CreatedById=empMap["EMP001"], Color="#2196F3", IsAllDay=false });
            events.Add(new CalendarEvent { Title="POSH Training Session", Description="Mandatory POSH awareness training.", EventDate=new DateTime(2025,3,28), EventTime="2:00 PM", Type="training", CreatedById=empMap["EMP004"], Color="#E91E63", IsAllDay=false });
            await db.CalendarEvents.AddRangeAsync(events);

            // ── Notifications ─────────────────────────────────────────────────
            var notifs = new List<Notification>();
            foreach (var emp in employees)
            {
                notifs.Add(new Notification { EmployeeId=emp.Id, Title="Welcome to Monk HRMS 👋", Message="Your account is ready. Explore all features.", Type="general", IsRead=false });
                notifs.Add(new Notification { EmployeeId=emp.Id, Title="POSH Training Reminder", Message="Complete mandatory POSH training by March 31.", Type="policy", IsRead=false });
            }
            await db.Notifications.AddRangeAsync(notifs);

            await db.SaveChangesAsync();
            Console.WriteLine("✅ Database seeded successfully with 20 employees!");
        }
    }
}
