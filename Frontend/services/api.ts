/**
 * MonkHRMS – API Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Change BASE_URL to match your machine:
 *   Android Emulator  → http://10.0.2.2:5000
 *   iOS Simulator     → http://localhost:5000
 *   Physical Device   → http://<YOUR_PC_IP>:5000  (e.g. http://192.168.1.5:5000)
 *   Production        → https://your-api.com
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// export const BASE_URL = 'http://10.0.2.2:5000'; // ← Change this for your env
// export const BASE_URL = 'http://localhost:54844';
const isAndroidEmulator = true;

// export const BASE_URL = isAndroidEmulator
//   ? 'http://10.0.2.2:54844'
//   : 'http://localhost:54844';
export const BASE_URL = 'http://localhost:54844';

const TOKEN_KEY = 'monk_hrms_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const saveToken  = (t: string) => AsyncStorage.setItem(TOKEN_KEY, t);
export const getToken   = ()          => AsyncStorage.getItem(TOKEN_KEY);
export const clearToken = ()          => AsyncStorage.removeItem(TOKEN_KEY);

// ─── Core fetch ───────────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<{ success: boolean; data?: T; message?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (requiresAuth) {
    const tok = await getToken();
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
  }
  try {
    const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
   let json;
try {
  json = await res.json();
} catch {
  return {
    success: false,
    message: 'Invalid server response',
  };
}
    if (!res.ok) return { success: false, message: json?.message || `HTTP ${res.status}` };
    return json; // backend wraps: { success, data, message }
  } catch (e: any) {
    return { success: false, message: e?.message || 'Network error — check BASE_URL and server.' };
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }, false),
  me: () => apiFetch<any>('/api/auth/me'),
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const EmployeesAPI = {
  getAll: (params?: { search?:string; department?:string; company?:string; role?:string; isActive?:boolean }) => {
    const qs = params
      ? '?' + Object.entries(params).filter(([,v]) => v !== undefined && v !== '').map(([k,v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
      : '';
    return apiFetch<any[]>(`/api/employees${qs}`);
  },
  getById:      (id: number)            => apiFetch<any>(`/api/employees/${id}`),
  create:       (data: any)             => apiFetch<any>('/api/employees',     { method:'POST',   body: JSON.stringify(data) }),
  update:       (id: number, data: any) => apiFetch<any>(`/api/employees/${id}`, { method:'PUT', body: JSON.stringify(data) }),
  toggleStatus: (id: number)            => apiFetch<string>(`/api/employees/${id}/toggle-status`, { method:'PATCH' }),
  delete:       (id: number)            => apiFetch<string>(`/api/employees/${id}`, { method:'DELETE' }),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const AttendanceAPI = {
  getMine:    (month?:number, year?:number) => apiFetch<any[]>(`/api/attendance/my${month ? `?month=${month}&year=${year??new Date().getFullYear()}` : ''}`),
  getSummary: (month?:number, year?:number) => apiFetch<any>(`/api/attendance/my/summary${month ? `?month=${month}&year=${year??new Date().getFullYear()}` : ''}`),
  getToday:   ()                            => apiFetch<any>('/api/attendance/today'),
  checkIn:    (time:string, source='manual') => apiFetch<any>('/api/attendance/check-in',  { method:'POST', body: JSON.stringify({ time, source }) }),
  checkOut:   (time:string, source='manual') => apiFetch<any>('/api/attendance/check-out', { method:'POST', body: JSON.stringify({ time, source }) }),
};

// ─── Leave ────────────────────────────────────────────────────────────────────
export const LeaveAPI = {
  getMine:     ()           => apiFetch<any[]>('/api/leave/my'),
  getAll:      (st?:string) => apiFetch<any[]>(`/api/leave/all${st ? `?status=${st}` : ''}`),
  getBalance:  ()           => apiFetch<any>('/api/leave/balance'),
  apply:       (data: any)  => apiFetch<any>('/api/leave/apply', { method:'POST', body: JSON.stringify(data) }),
  updateStatus:(id:number, status:string, rejectionReason?:string) =>
    apiFetch<any>(`/api/leave/${id}/status`, { method:'PATCH', body: JSON.stringify({ status, rejectionReason }) }),
  delete:      (id: number) => apiFetch<string>(`/api/leave/${id}`, { method:'DELETE' }),
};

// ─── News ─────────────────────────────────────────────────────────────────────
export const NewsAPI = {
  getAll:  ()           => apiFetch<any[]>('/api/news'),
  getById: (id:number)  => apiFetch<any>(`/api/news/${id}`),
  create:  (data:any)   => apiFetch<any>('/api/news', { method:'POST', body: JSON.stringify(data) }),
  delete:  (id:number)  => apiFetch<string>(`/api/news/${id}`, { method:'DELETE' }),
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const EventsAPI = {
  getAll:     (type?:string, month?:number) => {
    const p: string[] = [];
    if (type)  p.push(`type=${type}`);
    if (month) p.push(`month=${month}`);
    return apiFetch<any[]>(`/api/events${p.length ? '?'+p.join('&') : ''}`);
  },
  getHolidays: (year?:number) => apiFetch<any[]>(`/api/events/holidays${year ? `?year=${year}` : ''}`),
  create:      (data:any)     => apiFetch<any>('/api/events', { method:'POST', body: JSON.stringify(data) }),
  delete:      (id:number)    => apiFetch<string>(`/api/events/${id}`, { method:'DELETE' }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const NotificationsAPI = {
  getMine:       ()          => apiFetch<any[]>('/api/notifications'),
  getUnreadCount:()          => apiFetch<number>('/api/notifications/unread-count'),
  markRead:      (id:number) => apiFetch<string>(`/api/notifications/${id}/read`, { method:'PATCH' }),
  markAllRead:   ()          => apiFetch<string>('/api/notifications/mark-all-read', { method:'PATCH' }),
};
