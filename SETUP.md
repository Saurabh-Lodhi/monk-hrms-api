# MonkHRMS – Complete Setup Guide
## React Native (Expo) + .NET 8 Web API + SQL Server

---

## Project Structure

```
MonkHRMS_Complete/
├── Backend/                    ← .NET 8 Web API (SQL Server)
│   └── MonkHRMS.API/
│       ├── Controllers/        ← Auth, Employees, Attendance, Leave, News, Events, Notifications
│       ├── Data/               ← AppDbContext + DatabaseSeeder (20 employees + full seed data)
│       ├── DTOs/               ← Request/Response models
│       ├── Models/             ← EF Core entities
│       ├── Services/           ← JwtService
│       ├── Program.cs          ← App setup (auto-migrate + auto-seed on start)
│       └── appsettings.json    ← SQL Server connection string
│
└── Frontend/                   ← Expo React Native App
    ├── app/
    │   ├── (auth)/login.tsx    ← API login + quick login buttons
    │   ├── (tabs)/             ← Home, Attendance, Leave, Payroll, More
    │   └── screens/            ← All 11 detail screens (fully API-connected)
    ├── services/api.ts         ← Central API client (all endpoints)
    ├── store/index.ts          ← Redux store with async thunks
    └── data/company.ts         ← Static reference data (policies, departments)
```

---

## STEP 1 — Backend Setup (.NET 8 + SQL Server)

### 1.1 Prerequisites
- .NET 8 SDK: https://dotnet.microsoft.com/download/dotnet/8
- SQL Server (any edition) or SQL Server Express
- SQL Server running locally

### 1.2 Set Connection String
Open `Backend/MonkHRMS.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=MonkHRMS;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Common variants:
| Setup | Connection String |
|---|---|
| SQL Server (Windows Auth) | `Server=.;Database=MonkHRMS;Trusted_Connection=True;TrustServerCertificate=True;` |
| SQL Server Express | `Server=.\SQLEXPRESS;Database=MonkHRMS;Trusted_Connection=True;TrustServerCertificate=True;` |
| SQL Server with login | `Server=.;Database=MonkHRMS;User Id=sa;Password=yourpwd;TrustServerCertificate=True;` |

### 1.3 Run Backend
```bash
cd Backend/MonkHRMS.API
dotnet run
```

**On first run, the app automatically:**
1. Creates the `MonkHRMS` database
2. Runs all migrations
3. Seeds 20 employees, leave balances, news, events, holidays, notifications

Backend starts at: **http://localhost:5000**
Swagger UI at: **http://localhost:5000/** (root URL)

### 1.4 Verify Seeding
Open Swagger and call `POST /api/auth/login` with:
```json
{ "email": "kuldeep@monkoutsourcing.com", "password": "monk@123" }
```
You should get a JWT token back.

---

## STEP 2 — Frontend Setup (Expo React Native)

### 2.1 Set API URL
Open `Frontend/services/api.ts` and set `BASE_URL`:

| Environment | BASE_URL |
|---|---|
| **Android Emulator** | `http://10.0.2.2:5000` |
| **iOS Simulator** | `http://localhost:5000` |
| **Physical Android/iOS** | `http://192.168.X.X:5000` (your PC's WiFi IP) |
| **Production** | `https://your-api.com` |

To find your PC's IP:
- Windows: `ipconfig` → look for IPv4 address
- Mac/Linux: `ifconfig | grep inet`

### 2.2 Install Dependencies
```bash
cd Frontend
npm install
```

### 2.3 Start the App
```bash
npx expo start
```

Then press:
- `a` for Android Emulator
- `i` for iOS Simulator
- Scan QR code with Expo Go on physical device

---

## Default Login Credentials

All 20 seeded employees use password: **`monk@123`**

Quick login buttons in the app:
| Role | Email |
|---|---|
| Admin/CEO | kuldeep@monkoutsourcing.com |
| HR Manager | priya.verma@monkoutsourcing.com |
| Manager | amit.gupta@monkoutsourcing.com |
| Employee | rohit.mishra@monktraveltech.com |

---

## How Data Flows

```
Expo App (React Native)
    │  HTTP + Bearer JWT Token
    ▼
.NET 8 Web API (localhost:5000)
    │  Entity Framework Core
    ▼
SQL Server (MonkHRMS database)
```

### Login Flow
1. User taps login → `POST /api/auth/login`
2. Backend verifies BCrypt password, returns JWT + employee data
3. JWT saved to AsyncStorage → auto-restored on next app launch
4. All subsequent API calls include `Authorization: Bearer {token}`

### Data Fetch (Home Screen example)
```
Home mounts → dispatch 6 parallel thunks:
  fetchTodayAttendance  → GET /api/attendance/today
  fetchMyAttendance     → GET /api/attendance/my
  fetchEmployees        → GET /api/employees
  fetchNews             → GET /api/news
  fetchEvents           → GET /api/events
  fetchNotifications    → GET /api/notifications
                       ↓
Redux store updated → UI renders with live DB data
```

### Check-In Flow
```
Tap "Check In" → dispatch(checkInThunk())
→ POST /api/attendance/check-in { time: "09:15 AM", source: "manual" }
→ SQL Server: INSERT AttendanceRecords
→ Redux: today.status = 'in'
→ Button changes to "Check Out"
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Login → JWT token |
| GET | `/api/auth/me` | JWT | Validate token + get user |
| GET | `/api/employees` | JWT | All employees (filterable) |
| POST | `/api/employees` | Admin/HR | Create employee |
| PUT | `/api/employees/{id}` | Admin/HR | Update employee |
| PATCH | `/api/employees/{id}/toggle-status` | Admin/HR | Enable/disable |
| DELETE | `/api/employees/{id}` | Admin only | Delete employee |
| GET | `/api/attendance/my` | JWT | My attendance records |
| GET | `/api/attendance/today` | JWT | Today's check-in/out |
| POST | `/api/attendance/check-in` | JWT | Mark check-in |
| POST | `/api/attendance/check-out` | JWT | Mark check-out |
| GET | `/api/leave/balance` | JWT | My leave balance |
| GET | `/api/leave/my` | JWT | My leave applications |
| GET | `/api/leave/all` | Manager+ | All leave applications |
| POST | `/api/leave/apply` | JWT | Apply for leave |
| PATCH | `/api/leave/{id}/status` | Manager+ | Approve/reject |
| GET | `/api/news` | JWT | All announcements |
| POST | `/api/news` | Admin/HR | Create announcement |
| GET | `/api/events` | JWT | Calendar events |
| GET | `/api/events/holidays` | JWT | Public holidays |
| GET | `/api/notifications` | JWT | My notifications |
| PATCH | `/api/notifications/mark-all-read` | JWT | Mark all read |

---

## Troubleshooting

**"Network error – check BASE_URL"**
→ Is backend running? Check `dotnet run` output for errors.
→ Is `BASE_URL` in `services/api.ts` correct for your environment?
→ For physical device: use WiFi IP not localhost.

**"Login failed – Invalid email or password"**
→ Check if DB seeded: look for "🌱 Seeding database..." in backend console.
→ If not seeded: delete the MonkHRMS database and restart.

**Android "cleartext traffic" error**
→ Already handled in `app.json` (`"usesCleartextTraffic": true`)

**iOS "Network request failed"**
→ Use `http://localhost:5000` for simulator, WiFi IP for physical device.

**Migration errors on startup**
→ Ensure SQL Server is running: `services.msc` → SQL Server → Start.
→ Check connection string.

**"Cannot find module '../../store'"**
→ Run `npm install` from the Frontend folder.
