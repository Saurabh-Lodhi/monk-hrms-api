/**
 * MonkHRMS – Redux Store (fully API-driven)
 */
import { createSlice, PayloadAction, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import {
  AuthAPI, EmployeesAPI, AttendanceAPI, LeaveAPI,
  NewsAPI, EventsAPI, NotificationsAPI,
  saveToken, clearToken, getToken,
} from '../services/api';

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const res = await AuthAPI.login(email, password);
    if (!res.success || !res.data) return rejectWithValue(res.message || 'Login failed');
    await saveToken(res.data.token);
    return res.data;
  },
);
export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
  const tok = await getToken();
  if (!tok) return null;
  const res = await AuthAPI.me();
  if (!res.success || !res.data) { await clearToken(); return null; }
  return res.data;
});
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await clearToken();
});
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as any,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
    restored: false,
  },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: b => {
    b.addCase(loginThunk.pending,   s => { s.loading = true; s.error = null; });
    b.addCase(loginThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.employee; s.isAuthenticated = true; });
    b.addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
    b.addCase(logoutThunk.fulfilled, s => { s.user = null; s.isAuthenticated = false; s.error = null; });
    b.addCase(restoreSessionThunk.fulfilled, (s, a) => {
      s.restored = true;
      if (a.payload) { s.user = a.payload; s.isAuthenticated = true; }
    });
    b.addCase(restoreSessionThunk.rejected, s => { s.restored = true; });
  },
});

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
export const fetchEmployeesThunk = createAsyncThunk<any[], void>(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await EmployeesAPI.getAll();
    if (!res.success) return rejectWithValue(res.message);
    return res.data || [];
  }
);
export const createEmployeeThunk = createAsyncThunk('employees/create', async (data: any, { rejectWithValue }) => {
  const res = await EmployeesAPI.create(data);
  if (!res.success) return rejectWithValue(res.message);
  return res.data;
});
export const updateEmployeeThunk = createAsyncThunk('employees/update', async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  const res = await EmployeesAPI.update(id, data);
  if (!res.success) return rejectWithValue(res.message);
  return res.data;
});
export const toggleEmployeeStatusThunk = createAsyncThunk('employees/toggle', async (id: number, { rejectWithValue }) => {
  const res = await EmployeesAPI.toggleStatus(id);
  if (!res.success) return rejectWithValue(res.message);
  return id;
});
export const deleteEmployeeThunk = createAsyncThunk('employees/delete', async (id: number, { rejectWithValue }) => {
  const res = await EmployeesAPI.delete(id);
  if (!res.success) return rejectWithValue(res.message);
  return id;
});
const employeesSlice = createSlice({
  name: 'employees',
  initialState: { list: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchEmployeesThunk.pending,   s => { s.loading = true; s.error = null; });
    b.addCase(fetchEmployeesThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; });
    b.addCase(fetchEmployeesThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
    b.addCase(createEmployeeThunk.fulfilled, (s, a) => { if (a.payload) s.list.push(a.payload); });
    b.addCase(updateEmployeeThunk.fulfilled, (s, a) => {
      if (!a.payload) return;
      const i = s.list.findIndex(e => e.id === a.payload.id);
      if (i !== -1) s.list[i] = a.payload;
    });
    b.addCase(toggleEmployeeStatusThunk.fulfilled, (s, a) => {
      const e = s.list.find(e => e.id === a.payload);
      if (e) e.isActive = !e.isActive;
    });
    b.addCase(deleteEmployeeThunk.fulfilled, (s, a) => {
      s.list = s.list.filter(e => e.id !== a.payload);
    });
  },
});

// ─── TODAY ATTENDANCE ─────────────────────────────────────────────────────────
export const fetchTodayAttendanceThunk = createAsyncThunk('today/fetch', async () => {
  const res = await AttendanceAPI.getToday();
  return res.data || null;
});
export const checkInThunk = createAsyncThunk('today/checkIn', async (_, { rejectWithValue }) => {
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const res = await AttendanceAPI.checkIn(time, 'manual');
  if (!res.success) return rejectWithValue(res.message);
  return { time, data: res.data };
});
export const checkOutThunk = createAsyncThunk('today/checkOut', async (_, { rejectWithValue }) => {
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const res = await AttendanceAPI.checkOut(time, 'manual');
  if (!res.success) return rejectWithValue(res.message);
  return { time, data: res.data };
});
const todaySlice = createSlice({
  name: 'today',
  initialState: {
    status: 'out' as 'out' | 'in' | 'done',
    checkIn: null as string | null,
    checkOut: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: { resetToday: s => { s.status = 'out'; s.checkIn = null; s.checkOut = null; s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchTodayAttendanceThunk.fulfilled, (s, a) => {
      const r = a.payload;
      if (!r) { s.status = 'out'; s.checkIn = null; s.checkOut = null; return; }
      if (r.checkIn && r.checkOut) { s.status = 'done'; s.checkIn = r.checkIn; s.checkOut = r.checkOut; }
      else if (r.checkIn) { s.status = 'in'; s.checkIn = r.checkIn; }
      else { s.status = 'out'; s.checkIn = null; s.checkOut = null; }
    });
    b.addCase(checkInThunk.pending,    s => { s.loading = true; s.error = null; });
    b.addCase(checkInThunk.fulfilled,  (s, a) => { s.loading = false; s.status = 'in'; s.checkIn = a.payload.time; });
    b.addCase(checkInThunk.rejected,   (s, a) => { s.loading = false; s.error = a.payload as string; });
    b.addCase(checkOutThunk.pending,   s => { s.loading = true; s.error = null; });
    b.addCase(checkOutThunk.fulfilled, (s, a) => { s.loading = false; s.status = 'done'; s.checkOut = a.payload.time; });
    b.addCase(checkOutThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

// ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
export const fetchMyAttendanceThunk = createAsyncThunk(
  'attendance/fetchMine',
  async ({ month, year }: { month?: number; year?: number } = {}) => {
    const res = await AttendanceAPI.getMine(month, year);
    return res.data || [];
  }
);
export const fetchAttendanceSummaryThunk = createAsyncThunk(
  'attendance/summary',
  async ({ month, year }: { month?: number; year?: number } = {}) => {
    const res = await AttendanceAPI.getSummary(month, year);
    return res.data || null;
  }
);
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { records: [] as any[], summary: null as any, loading: false },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchMyAttendanceThunk.pending,   s => { s.loading = true; });
    b.addCase(fetchMyAttendanceThunk.fulfilled, (s, a) => { s.loading = false; s.records = a.payload; });
    b.addCase(fetchMyAttendanceThunk.rejected,  s => { s.loading = false; });
    b.addCase(fetchAttendanceSummaryThunk.fulfilled, (s, a) => { s.summary = a.payload; });
  },
});

// ─── LEAVE ────────────────────────────────────────────────────────────────────
export const fetchMyLeavesThunk = createAsyncThunk<any[], void>(
  'leave/mine',
  async (_, { rejectWithValue }) => {
    const r = await LeaveAPI.getMine();
    if (!r.success) return rejectWithValue(r.message);
    return r.data || [];
  }
);

// KEY FIX: never rejectWithValue here — always return array (even empty)
// so allApplications always gets set and loading always clears
export const fetchAllLeavesThunk = createAsyncThunk<any[], void>(
  'leave/all',
  async () => {
    try {
      const r = await LeaveAPI.getAll();
      console.log('[fetchAllLeaves] success:', r.success, 'count:', r.data?.length, 'msg:', r.message);
      if (!r.success) {
        console.warn('[fetchAllLeaves] API returned success=false:', r.message);
        return [];
      }
      return r.data || [];
    } catch (err) {
      console.error('[fetchAllLeaves] exception:', err);
      return [];
    }
  }
);

export const fetchLeaveBalanceThunk = createAsyncThunk<any, void>(
  'leave/balance',
  async (_, { rejectWithValue }) => {
    const r = await LeaveAPI.getBalance();
    if (!r.success) return rejectWithValue(r.message);
    return r.data || null;
  }
);

export const applyLeaveThunk = createAsyncThunk('leave/apply', async (data: any, { rejectWithValue }) => {
  const res = await LeaveAPI.apply(data);
  if (!res.success) return rejectWithValue(res.message || 'Failed to apply leave');
  return res.data;
});

export const updateLeaveStatusThunk = createAsyncThunk<
  any,
  { id: number; status: string; rejectionReason?: string },
  { rejectValue: string }
>(
  'leave/updateStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await LeaveAPI.updateStatus(id, status, rejectionReason);
      console.log('[updateLeaveStatus] res:', res.success, res.data, res.message);
      if (!res.success) return rejectWithValue(res.message || 'Failed to update status');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Network error');
    }
  }
);

export const deleteLeaveThunk = createAsyncThunk('leave/delete', async (id: number, { rejectWithValue }) => {
  const res = await LeaveAPI.delete(id);
  if (!res.success) return rejectWithValue(res.message);
  return id;
});

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    applications: [] as any[],
    allApplications: [] as any[],
    balance: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: { clearLeaveError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchMyLeavesThunk.pending,   s => { s.loading = true; });
    b.addCase(fetchMyLeavesThunk.fulfilled, (s, a) => { s.loading = false; s.applications = a.payload; });
    b.addCase(fetchMyLeavesThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    // fetchAllLeaves — always fulfills (never rejects), loading always clears
    b.addCase(fetchAllLeavesThunk.pending,   s => { s.loading = true; });
    b.addCase(fetchAllLeavesThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.allApplications = a.payload;
      console.log('[leaveSlice] allApplications set to', a.payload.length, 'items');
    });
    b.addCase(fetchAllLeavesThunk.rejected,  (s) => { s.loading = false; }); // safety

    b.addCase(fetchLeaveBalanceThunk.fulfilled, (s, a) => { s.balance = a.payload; });

    b.addCase(applyLeaveThunk.pending,   s => { s.loading = true; s.error = null; });
    b.addCase(applyLeaveThunk.fulfilled, (s, a) => {
      s.loading = false;
      if (a.payload) {
        s.applications.unshift(a.payload);
        s.allApplications.unshift(a.payload);
      }
    });
    b.addCase(applyLeaveThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    b.addCase(updateLeaveStatusThunk.pending,   s => { s.loading = true; s.error = null; });
    b.addCase(updateLeaveStatusThunk.fulfilled, (s, a) => {
      s.loading = false;
      if (!a.payload) return;
      const upd = (list: any[]) => {
        const i = list.findIndex(l => l.id === a.payload.id);
        if (i !== -1) list[i] = { ...list[i], ...a.payload };
      };
      upd(s.applications);
      upd(s.allApplications);
    });
    b.addCase(updateLeaveStatusThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    b.addCase(deleteLeaveThunk.fulfilled, (s, a) => {
      s.applications    = s.applications.filter(l => l.id !== a.payload);
      s.allApplications = s.allApplications.filter(l => l.id !== a.payload);
    });
  },
});

// ─── NEWS ─────────────────────────────────────────────────────────────────────
export const fetchNewsThunk  = createAsyncThunk('news/all',    async () => { const r = await NewsAPI.getAll();  return r.data || []; });
export const createNewsThunk = createAsyncThunk('news/create', async (data: any, { rejectWithValue }) => {
  const r = await NewsAPI.create(data);
  if (!r.success) return rejectWithValue(r.message);
  return r.data;
});
export const deleteNewsThunk = createAsyncThunk('news/delete', async (id: number) => { await NewsAPI.delete(id); return id; });
const newsSlice = createSlice({
  name: 'news',
  initialState: { list: [] as any[], loading: false },
  reducers: {
    incViews: (s, a: PayloadAction<number>) => {
      const n = s.list.find((x: any) => x.id === a.payload);
      if (n) n.views = (n.views || 0) + 1;
    },
  },
  extraReducers: b => {
    b.addCase(fetchNewsThunk.pending,    s => { s.loading = true; });
    b.addCase(fetchNewsThunk.fulfilled,  (s, a) => { s.loading = false; s.list = a.payload; });
    b.addCase(fetchNewsThunk.rejected,   s => { s.loading = false; });
    b.addCase(createNewsThunk.fulfilled, (s, a) => { if (a.payload) s.list.unshift(a.payload); });
    b.addCase(deleteNewsThunk.fulfilled, (s, a) => { s.list = s.list.filter((n: any) => n.id !== a.payload); });
  },
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const fetchEventsThunk   = createAsyncThunk('events/all',      async () => { const r = await EventsAPI.getAll();     return r.data || []; });
export const fetchHolidaysThunk = createAsyncThunk('events/holidays', async () => { const r = await EventsAPI.getHolidays(); return r.data || []; });
export const createEventThunk   = createAsyncThunk('events/create',   async (data: any, { rejectWithValue }) => {
  const r = await EventsAPI.create(data);
  if (!r.success) return rejectWithValue(r.message);
  return r.data;
});
export const deleteEventThunk = createAsyncThunk('events/delete', async (id: number) => { await EventsAPI.delete(id); return id; });
const eventsSlice = createSlice({
  name: 'events',
  initialState: { list: [] as any[], holidays: [] as any[], loading: false },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchEventsThunk.fulfilled,   (s, a) => { s.list = a.payload; });
    b.addCase(fetchHolidaysThunk.fulfilled, (s, a) => { s.holidays = a.payload; });
    b.addCase(createEventThunk.fulfilled,   (s, a) => { if (a.payload) s.list.push(a.payload); });
    b.addCase(deleteEventThunk.fulfilled,   (s, a) => { s.list = s.list.filter((e: any) => e.id !== a.payload); });
  },
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const fetchNotificationsThunk = createAsyncThunk<{ list: any[]; unread: number }, void>(
  'notif/all',
  async () => {
    const [lr, cr] = await Promise.all([
      NotificationsAPI.getMine(),
      NotificationsAPI.getUnreadCount(),
    ]);
    return { list: lr.data || [], unread: (cr.data as any) ?? 0 };
  }
);
export const markReadThunk    = createAsyncThunk('notif/read',    async (id: number) => { await NotificationsAPI.markRead(id);  return id; });
export const markAllReadThunk = createAsyncThunk('notif/readAll', async ()            => { await NotificationsAPI.markAllRead(); });
const notifSlice = createSlice({
  name: 'notif',
  initialState: { list: [] as any[], unread: 0 },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchNotificationsThunk.fulfilled, (s, a) => { s.list = a.payload.list; s.unread = a.payload.unread; });
    b.addCase(markReadThunk.fulfilled,   (s, a) => {
      const n = s.list.find((x: any) => x.id === a.payload);
      if (n && !n.isRead) { n.isRead = true; s.unread = Math.max(0, s.unread - 1); }
    });
    b.addCase(markAllReadThunk.fulfilled, s => { s.list.forEach((n: any) => n.isRead = true); s.unread = 0; });
  },
});

// ─── STORE ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth:       authSlice.reducer,
    employees:  employeesSlice.reducer,
    today:      todaySlice.reducer,
    attendance: attendanceSlice.reducer,
    leave:      leaveSlice.reducer,
    news:       newsSlice.reducer,
    events:     eventsSlice.reducer,
    notif:      notifSlice.reducer,
  },
});

export const { clearError }      = authSlice.actions;
export const { resetToday }      = todaySlice.actions;
export const { incViews }        = newsSlice.actions;
export const { clearLeaveError } = leaveSlice.actions;

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// // // /**
// // //  * MonkHRMS – Redux Store (fully API-driven)
// // //  * All data comes from the .NET 8 backend. No hardcoded employees/news/events.
// // //  */
// // // import { createSlice, PayloadAction, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
// // // import {
// // //   AuthAPI, EmployeesAPI, AttendanceAPI, LeaveAPI,
// // //   NewsAPI, EventsAPI, NotificationsAPI,
// // //   saveToken, clearToken, getToken,
// // // } from '../services/api';

// // // // ─── AUTH ─────────────────────────────────────────────────────────────────────
// // // export const loginThunk = createAsyncThunk(
// // //   'auth/login',
// // //   async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
// // //     const res = await AuthAPI.login(email, password);
// // //     if (!res.success || !res.data) return rejectWithValue(res.message || 'Login failed');
// // //     await saveToken(res.data.token);
// // //     return res.data;
// // //   },
// // // );

// // // export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
// // //   const tok = await getToken();
// // //   if (!tok) return null;
// // //   const res = await AuthAPI.me();
// // //   if (!res.success || !res.data) { await clearToken(); return null; }
// // //   return res.data;
// // // });
// // // export const logoutThunk = createAsyncThunk('auth/logout', async () => {
// // //   await clearToken(); // ✅ correct place
// // // });

// // // const authSlice = createSlice({
// // //   name: 'auth',
// // //   initialState: { user: null as any, isAuthenticated: false, loading: false, error: null as string|null, restored: false },
// // //   reducers: {
   
// // //     clearError: (s) => { s.error=null; },
// // //   },
// // //   extraReducers: b => {
// // //     b.addCase(loginThunk.pending,   s => { s.loading=true; s.error=null; });
// // //     b.addCase(loginThunk.fulfilled, (s,a) => { s.loading=false; s.user=a.payload.employee; s.isAuthenticated=true; });
// // //     b.addCase(loginThunk.rejected,  (s,a) => { s.loading=false; s.error=a.payload as string; });
// // //     b.addCase(logoutThunk.fulfilled, (s) =>  { s.user = null; s.isAuthenticated = false;  s.error = null;});
// // //     b.addCase(restoreSessionThunk.fulfilled, (s,a) => { s.restored=true; if(a.payload){s.user=a.payload;s.isAuthenticated=true;} });
// // //     b.addCase(restoreSessionThunk.rejected,  s => { s.restored=true; });
// // //   },
// // // });

// // // // ─── EMPLOYEES ────────────────────────────────────────────────────────────────
// // // export const fetchEmployeesThunk = createAsyncThunk('employees/fetchAll', async (params?: any) => {
// // //   const res = await EmployeesAPI.getAll(params); return res.data || [];
// // // });
// // // export const createEmployeeThunk = createAsyncThunk('employees/create', async (data: any, { rejectWithValue }) => {
// // //   const res = await EmployeesAPI.create(data);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return res.data;
// // // });
// // // export const updateEmployeeThunk = createAsyncThunk('employees/update', async ({ id, data }: { id:number; data:any }, { rejectWithValue }) => {
// // //   const res = await EmployeesAPI.update(id, data);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return res.data;
// // // });
// // // export const toggleEmployeeStatusThunk = createAsyncThunk('employees/toggle', async (id: number, { rejectWithValue }) => {
// // //   const res = await EmployeesAPI.toggleStatus(id);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return id;
// // // });
// // // export const deleteEmployeeThunk = createAsyncThunk('employees/delete', async (id: number, { rejectWithValue }) => {
// // //   const res = await EmployeesAPI.delete(id);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return id;
// // // });

// // // const employeesSlice = createSlice({
// // //   name: 'employees',
// // //   initialState: { list: [] as any[], loading: false },
// // //   reducers: {},
// // //   extraReducers: b => {
// // //     b.addCase(fetchEmployeesThunk.pending,   s => { s.loading=true; });
// // //     b.addCase(fetchEmployeesThunk.fulfilled, (s,a) => { s.loading=false; s.list=a.payload; });
// // //     b.addCase(fetchEmployeesThunk.rejected,  s => { s.loading=false; });
// // //     b.addCase(createEmployeeThunk.fulfilled, (s,a) => { if(a.payload) s.list.push(a.payload); });
// // //     b.addCase(updateEmployeeThunk.fulfilled, (s,a) => {
// // //       if(!a.payload) return;
// // //       const i=s.list.findIndex(e=>e.id===a.payload.id); if(i!==-1) s.list[i]=a.payload;
// // //     });
// // //     b.addCase(toggleEmployeeStatusThunk.fulfilled, (s,a) => {
// // //       const e=s.list.find(e=>e.id===a.payload); if(e) e.isActive=!e.isActive;
// // //     });
// // //     b.addCase(deleteEmployeeThunk.fulfilled, (s,a) => { s.list=s.list.filter(e=>e.id!==a.payload); });
// // //   },
// // // });

// // // // ─── TODAY ATTENDANCE ─────────────────────────────────────────────────────────
// // // export const fetchTodayAttendanceThunk = createAsyncThunk('today/fetch', async () => {
// // //   const res = await AttendanceAPI.getToday(); return res.data || null;
// // // });
// // // export const checkInThunk = createAsyncThunk('today/checkIn', async (_, { rejectWithValue }) => {
// // //   const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
// // //   const res = await AttendanceAPI.checkIn(time, 'manual');
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return time;
// // // });
// // // export const checkOutThunk = createAsyncThunk('today/checkOut', async (_, { rejectWithValue }) => {
// // //   const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
// // //   const res = await AttendanceAPI.checkOut(time, 'manual');
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return time;
// // // });

// // // const todaySlice = createSlice({
// // //   name: 'today',
// // //   initialState: { status:'out' as 'out'|'in'|'done', checkIn: null as string|null, checkOut: null as string|null, loading:false },
// // //   reducers: { resetToday: s => { s.status='out';s.checkIn=null;s.checkOut=null; } },
// // //   extraReducers: b => {
// // //     b.addCase(fetchTodayAttendanceThunk.fulfilled, (s,a) => {
// // //       const r=a.payload;
// // //       if(!r) return;
// // //       if(r.checkIn&&r.checkOut){s.status='done';s.checkIn=r.checkIn;s.checkOut=r.checkOut;}
// // //       else if(r.checkIn){s.status='in';s.checkIn=r.checkIn;}
// // //     });
// // //     b.addCase(checkInThunk.pending,   s => { s.loading=true; });
// // //     b.addCase(checkInThunk.fulfilled, (s,a) => { s.loading=false;s.status='in';s.checkIn=a.payload; });
// // //     b.addCase(checkInThunk.rejected,  s => { s.loading=false; });
// // //     b.addCase(checkOutThunk.pending,  s => { s.loading=true; });
// // //     b.addCase(checkOutThunk.fulfilled,(s,a) => { s.loading=false;s.status='done';s.checkOut=a.payload; });
// // //     b.addCase(checkOutThunk.rejected, s => { s.loading=false; });
// // //   },
// // // });

// // // // ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
// // // export const fetchMyAttendanceThunk = createAsyncThunk('attendance/fetchMine', async ({ month, year }:{month?:number;year?:number}={}) => {
// // //   const res = await AttendanceAPI.getMine(month, year); return res.data || [];
// // // });
// // // export const fetchAttendanceSummaryThunk = createAsyncThunk('attendance/summary', async ({ month, year }:{month?:number;year?:number}={}) => {
// // //   const res = await AttendanceAPI.getSummary(month, year); return res.data || null;
// // // });

// // // const attendanceSlice = createSlice({
// // //   name: 'attendance',
// // //   initialState: { records:[] as any[], summary:null as any, loading:false },
// // //   reducers: {},
// // //   extraReducers: b => {
// // //     b.addCase(fetchMyAttendanceThunk.pending,   s => { s.loading=true; });
// // //     b.addCase(fetchMyAttendanceThunk.fulfilled, (s,a) => { s.loading=false;s.records=a.payload; });
// // //     b.addCase(fetchMyAttendanceThunk.rejected,  s => { s.loading=false; });
// // //     b.addCase(fetchAttendanceSummaryThunk.fulfilled, (s,a) => { s.summary=a.payload; });
// // //   },
// // // });

// // // // ─── LEAVE ────────────────────────────────────────────────────────────────────
// // // export const fetchMyLeavesThunk     = createAsyncThunk('leave/mine',    async () => { const r=await LeaveAPI.getMine();   return r.data||[]; });
// // // export const fetchAllLeavesThunk    = createAsyncThunk('leave/all',     async (st?:any) => { const r=await LeaveAPI.getAll(st);  return r.data||[]; });
// // // export const fetchLeaveBalanceThunk = createAsyncThunk('leave/balance', async () => { const r=await LeaveAPI.getBalance(); return r.data||null; });
// // // export const applyLeaveThunk = createAsyncThunk('leave/apply', async (data:any, { rejectWithValue }) => {
// // //   const res = await LeaveAPI.apply(data);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return res.data;
// // // });
// // // export const updateLeaveStatusThunk = createAsyncThunk('leave/status', async ({ id, status, rejectionReason }:{id:number;status:string;rejectionReason?:string}, { rejectWithValue }) => {
// // //   const res = await LeaveAPI.updateStatus(id, status, rejectionReason);
// // //   if (!res.success) return rejectWithValue(res.message);
// // //   return res.data;
// // // });
// // // export const deleteLeaveThunk = createAsyncThunk('leave/delete', async (id:number) => {
// // //   await LeaveAPI.delete(id); return id;
// // // });

// // // const leaveSlice = createSlice({
// // //   name: 'leave',
// // //   initialState: { applications:[] as any[], allApplications:[] as any[], balance:null as any, loading:false, error:null as string|null },
// // //   reducers: {},
// // //   extraReducers: b => {
// // //     b.addCase(fetchMyLeavesThunk.fulfilled,     (s,a) => { s.applications=a.payload; });
// // //     b.addCase(fetchAllLeavesThunk.fulfilled,    (s,a) => { s.allApplications=a.payload; });
// // //     b.addCase(fetchLeaveBalanceThunk.fulfilled, (s,a) => { s.balance=a.payload; });
// // //     b.addCase(applyLeaveThunk.pending,   s => { s.loading=true;s.error=null; });
// // //     b.addCase(applyLeaveThunk.fulfilled, (s,a) => {
// // //       s.loading=false;
// // //       if(a.payload){s.applications.unshift(a.payload);s.allApplications.unshift(a.payload);}
// // //     });
// // //     b.addCase(applyLeaveThunk.rejected,  (s,a) => { s.loading=false;s.error=a.payload as string; });
// // //     b.addCase(updateLeaveStatusThunk.fulfilled, (s,a) => {
// // //       if(!a.payload) return;
// // //       const upd=(list:any[])=>{ const i=list.findIndex(l=>l.id===a.payload.id); if(i!==-1) list[i]=a.payload; };
// // //       upd(s.applications); upd(s.allApplications);
// // //     });
// // //     b.addCase(deleteLeaveThunk.fulfilled, (s,a) => {
// // //       s.applications=s.applications.filter(l=>l.id!==a.payload);
// // //       s.allApplications=s.allApplications.filter(l=>l.id!==a.payload);
// // //     });
// // //   },
// // // });

// // // // ─── NEWS ─────────────────────────────────────────────────────────────────────
// // // export const fetchNewsThunk   = createAsyncThunk('news/all',    async () => { const r=await NewsAPI.getAll();  return r.data||[]; });
// // // export const createNewsThunk  = createAsyncThunk('news/create', async (data:any, { rejectWithValue }) => {
// // //   const r=await NewsAPI.create(data); if(!r.success) return rejectWithValue(r.message); return r.data;
// // // });
// // // export const deleteNewsThunk  = createAsyncThunk('news/delete', async (id:number) => { await NewsAPI.delete(id); return id; });

// // // const newsSlice = createSlice({
// // //   name: 'news',
// // //   initialState: { list:[] as any[], loading:false },
// // //   reducers: {
// // //     // keep incViews local (view count bumped locally, server does it too via GET /news/:id)
// // //     incViews: (s, a:PayloadAction<number>) => { const n=s.list.find((x:any)=>x.id===a.payload); if(n) n.views=(n.views||0)+1; },
// // //   },
// // //   extraReducers: b => {
// // //     b.addCase(fetchNewsThunk.pending,   s => { s.loading=true; });
// // //     b.addCase(fetchNewsThunk.fulfilled, (s,a) => { s.loading=false;s.list=a.payload; });
// // //     b.addCase(fetchNewsThunk.rejected,  s => { s.loading=false; });
// // //     b.addCase(createNewsThunk.fulfilled,(s,a) => { if(a.payload) s.list.unshift(a.payload); });
// // //     b.addCase(deleteNewsThunk.fulfilled,(s,a) => { s.list=s.list.filter((n:any)=>n.id!==a.payload); });
// // //   },
// // // });

// // // // ─── EVENTS ───────────────────────────────────────────────────────────────────
// // // export const fetchEventsThunk   = createAsyncThunk('events/all',      async () => { const r=await EventsAPI.getAll();     return r.data||[]; });
// // // export const fetchHolidaysThunk = createAsyncThunk('events/holidays', async () => { const r=await EventsAPI.getHolidays(); return r.data||[]; });
// // // export const createEventThunk   = createAsyncThunk('events/create',   async (data:any, { rejectWithValue }) => {
// // //   const r=await EventsAPI.create(data); if(!r.success) return rejectWithValue(r.message); return r.data;
// // // });
// // // export const deleteEventThunk   = createAsyncThunk('events/delete',   async (id:number) => { await EventsAPI.delete(id); return id; });

// // // const eventsSlice = createSlice({
// // //   name: 'events',
// // //   initialState: { list:[] as any[], holidays:[] as any[], loading:false },
// // //   reducers: {},
// // //   extraReducers: b => {
// // //     b.addCase(fetchEventsThunk.fulfilled,   (s,a) => { s.list=a.payload; });
// // //     b.addCase(fetchHolidaysThunk.fulfilled, (s,a) => { s.holidays=a.payload; });
// // //     b.addCase(createEventThunk.fulfilled,   (s,a) => { if(a.payload) s.list.push(a.payload); });
// // //     b.addCase(deleteEventThunk.fulfilled,   (s,a) => { s.list=s.list.filter((e:any)=>e.id!==a.payload); });
// // //   },
// // // });

// // // // ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
// // // export const fetchNotificationsThunk = createAsyncThunk('notif/all', async () => {
// // //   const [lr, cr] = await Promise.all([NotificationsAPI.getMine(), NotificationsAPI.getUnreadCount()]);
// // //   return { list: lr.data||[], unread: cr.data??0 };
// // // });
// // // export const markReadThunk    = createAsyncThunk('notif/read',    async (id:number) => { await NotificationsAPI.markRead(id);  return id; });
// // // export const markAllReadThunk = createAsyncThunk('notif/readAll', async ()          => { await NotificationsAPI.markAllRead(); });

// // // const notifSlice = createSlice({
// // //   name: 'notif',
// // //   initialState: { list:[] as any[], unread:0 },
// // //   reducers: {},
// // //   extraReducers: b => {
// // //     b.addCase(fetchNotificationsThunk.fulfilled, (s,a) => { s.list=a.payload.list;s.unread=a.payload.unread; });
// // //     b.addCase(markReadThunk.fulfilled,   (s,a) => { const n=s.list.find((x:any)=>x.id===a.payload); if(n&&!n.isRead){n.isRead=true;s.unread=Math.max(0,s.unread-1);} });
// // //     b.addCase(markAllReadThunk.fulfilled, s   => { s.list.forEach((n:any)=>n.isRead=true);s.unread=0; });
// // //   },
// // // });

// // // // ─── STORE ────────────────────────────────────────────────────────────────────
// // // export const store = configureStore({
// // //   reducer: {
// // //     auth:       authSlice.reducer,
// // //     employees:  employeesSlice.reducer,
// // //     today:      todaySlice.reducer,
// // //     attendance: attendanceSlice.reducer,
// // //     leave:      leaveSlice.reducer,
// // //     news:       newsSlice.reducer,
// // //     events:     eventsSlice.reducer,
// // //     notif:      notifSlice.reducer,
// // //   },
// // // });

// // // export const { clearError } = authSlice.actions;
// // // export const { resetToday }          = todaySlice.actions;
// // // export const { incViews }            = newsSlice.actions;

// // // export type RootState   = ReturnType<typeof store.getState>;
// // // export type AppDispatch = typeof store.dispatch;
// // /**
// //  * MonkHRMS – Redux Store (fully API-driven)
// //  * Fixed: per-employee attendance, leave hierarchy, real-time notifications
// //  */
// // import { createSlice, PayloadAction, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
// // import {
// //   AuthAPI, EmployeesAPI, AttendanceAPI, LeaveAPI,
// //   NewsAPI, EventsAPI, NotificationsAPI,
// //   saveToken, clearToken, getToken,
// // } from '../services/api';

// // // ─── AUTH ───────────────────────────────────────────────────────────────────
// // export const loginThunk = createAsyncThunk(
// //   'auth/login',
// //   async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
// //     const res = await AuthAPI.login(email, password);
// //     if (!res.success || !res.data) return rejectWithValue(res.message || 'Login failed');
// //     await saveToken(res.data.token);
// //     return res.data;
// //   },
// // );

// // export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
// //   const tok = await getToken();
// //   if (!tok) return null;
// //   const res = await AuthAPI.me();
// //   if (!res.success || !res.data) { await clearToken(); return null; }
// //   return res.data;
// // });

// // export const logoutThunk = createAsyncThunk('auth/logout', async () => {
// //   await clearToken();
// // });

// // const authSlice = createSlice({
// //   name: 'auth',
// //   initialState: {
// //     user: null as any,
// //     isAuthenticated: false,
// //     loading: false,
// //     error: null as string | null,
// //     restored: false,
// //   },
// //   reducers: {
// //     clearError: (s) => { s.error = null; },
// //   },
// //   extraReducers: b => {
// //     b.addCase(loginThunk.pending,   s => { s.loading = true; s.error = null; });
// //     b.addCase(loginThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.employee; s.isAuthenticated = true; });
// //     b.addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
// //     b.addCase(logoutThunk.fulfilled, s => { s.user = null; s.isAuthenticated = false; s.error = null; });
// //     b.addCase(restoreSessionThunk.fulfilled, (s, a) => {
// //       s.restored = true;
// //       if (a.payload) { s.user = a.payload; s.isAuthenticated = true; }
// //     });
// //     b.addCase(restoreSessionThunk.rejected, s => { s.restored = true; });
// //   },
// // });

// // // ─── EMPLOYEES ──────────────────────────────────────────────────────────────
// // // export const fetchEmployeesThunk = createAsyncThunk('employees/fetchAll', async (params?: any) => {
// // //   const res = await EmployeesAPI.getAll(params);
// // //   return res.data || [];
// // // });
// // export const fetchEmployeesThunk = createAsyncThunk<any, void>(
// //   'employees/fetch',
// //   async (_, thunkAPI) => {
// //     const r = await EmployeesAPI.getAll();
// //     return r.data;
// //   }
// // );
// // export const createEmployeeThunk = createAsyncThunk('employees/create', async (data: any, { rejectWithValue }) => {
// //   const res = await EmployeesAPI.create(data);
// //   if (!res.success) return rejectWithValue(res.message);
// //   return res.data;
// // });

// // export const updateEmployeeThunk = createAsyncThunk('employees/update', async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
// //   const res = await EmployeesAPI.update(id, data);
// //   if (!res.success) return rejectWithValue(res.message);
// //   return res.data;
// // });

// // export const toggleEmployeeStatusThunk = createAsyncThunk('employees/toggle', async (id: number, { rejectWithValue }) => {
// //   const res = await EmployeesAPI.toggleStatus(id);
// //   if (!res.success) return rejectWithValue(res.message);
// //   return id;
// // });

// // export const deleteEmployeeThunk = createAsyncThunk('employees/delete', async (id: number, { rejectWithValue }) => {
// //   const res = await EmployeesAPI.delete(id);
// //   if (!res.success) return rejectWithValue(res.message);
// //   return id;
// // });

// // const employeesSlice = createSlice({
// //   name: 'employees',
// //   initialState: { list: [] as any[], loading: false },
// //   reducers: {},
// //   extraReducers: b => {
// //     b.addCase(fetchEmployeesThunk.pending,   s => { s.loading = true; });
// //     b.addCase(fetchEmployeesThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; });
// //     b.addCase(fetchEmployeesThunk.rejected,  s => { s.loading = false; });
// //     b.addCase(createEmployeeThunk.fulfilled, (s, a) => { if (a.payload) s.list.push(a.payload); });
// //     b.addCase(updateEmployeeThunk.fulfilled, (s, a) => {
// //       if (!a.payload) return;
// //       const i = s.list.findIndex(e => e.id === a.payload.id);
// //       if (i !== -1) s.list[i] = a.payload;
// //     });
// //     // Toggle updates isActive in the list immediately (optimistic)
// //     b.addCase(toggleEmployeeStatusThunk.fulfilled, (s, a) => {
// //       const e = s.list.find(e => e.id === a.payload);
// //       if (e) e.isActive = !e.isActive;
// //     });
// //     b.addCase(deleteEmployeeThunk.fulfilled, (s, a) => {
// //       s.list = s.list.filter(e => e.id !== a.payload);
// //     });
// //   },
// // });

// // // ─── TODAY ATTENDANCE (per logged-in employee) ──────────────────────────────
// // export const fetchTodayAttendanceThunk = createAsyncThunk('today/fetch', async () => {
// //   const res = await AttendanceAPI.getToday();
// //   return res.data || null;
// // });

// // export const checkInThunk = createAsyncThunk('today/checkIn', async (_, { rejectWithValue }) => {
// //   const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
// //   const res = await AttendanceAPI.checkIn(time, 'manual');
// //   if (!res.success) return rejectWithValue(res.message);
// //   return { time, data: res.data };
// // });

// // export const checkOutThunk = createAsyncThunk('today/checkOut', async (_, { rejectWithValue }) => {
// //   const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
// //   const res = await AttendanceAPI.checkOut(time, 'manual');
// //   if (!res.success) return rejectWithValue(res.message);
// //   return { time, data: res.data };
// // });

// // const todaySlice = createSlice({
// //   name: 'today',
// //   initialState: {
// //     status: 'out' as 'out' | 'in' | 'done',
// //     checkIn: null as string | null,
// //     checkOut: null as string | null,
// //     loading: false,
// //   },
// //   reducers: {
// //     resetToday: s => { s.status = 'out'; s.checkIn = null; s.checkOut = null; },
// //   },
// //   extraReducers: b => {
// //     b.addCase(fetchTodayAttendanceThunk.fulfilled, (s, a) => {
// //       const r = a.payload;
// //       if (!r) { s.status = 'out'; s.checkIn = null; s.checkOut = null; return; }
// //       if (r.checkIn && r.checkOut) { s.status = 'done'; s.checkIn = r.checkIn; s.checkOut = r.checkOut; }
// //       else if (r.checkIn) { s.status = 'in'; s.checkIn = r.checkIn; }
// //       else { s.status = 'out'; s.checkIn = null; s.checkOut = null; }
// //     });
// //     b.addCase(checkInThunk.pending,   s => { s.loading = true; });
// //     b.addCase(checkInThunk.fulfilled, (s, a) => { s.loading = false; s.status = 'in'; s.checkIn = a.payload.time; });
// //     b.addCase(checkInThunk.rejected,  s => { s.loading = false; });
// //     b.addCase(checkOutThunk.pending,  s => { s.loading = true; });
// //     b.addCase(checkOutThunk.fulfilled, (s, a) => { s.loading = false; s.status = 'done'; s.checkOut = a.payload.time; });
// //     b.addCase(checkOutThunk.rejected, s => { s.loading = false; });
// //   },
// // });

// // // ─── ATTENDANCE RECORDS (per logged-in employee from API) ────────────────────
// // export const fetchMyAttendanceThunk = createAsyncThunk(
// //   'attendance/fetchMine',
// //   async ({ month, year }: { month?: number; year?: number } = {}) => {
// //     const res = await AttendanceAPI.getMine(month, year);
// //     return res.data || [];
// //   }
// // );

// // export const fetchAttendanceSummaryThunk = createAsyncThunk(
// //   'attendance/summary',
// //   async ({ month, year }: { month?: number; year?: number } = {}) => {
// //     const res = await AttendanceAPI.getSummary(month, year);
// //     return res.data || null;
// //   }
// // );

// // const attendanceSlice = createSlice({
// //   name: 'attendance',
// //   initialState: { records: [] as any[], summary: null as any, loading: false },
// //   reducers: {},
// //   extraReducers: b => {
// //     b.addCase(fetchMyAttendanceThunk.pending,   s => { s.loading = true; });
// //     b.addCase(fetchMyAttendanceThunk.fulfilled, (s, a) => { s.loading = false; s.records = a.payload; });
// //     b.addCase(fetchMyAttendanceThunk.rejected,  s => { s.loading = false; });
// //     b.addCase(fetchAttendanceSummaryThunk.fulfilled, (s, a) => { s.summary = a.payload; });
// //   },
// // });

// // // ─── LEAVE ──────────────────────────────────────────────────────────────────
// // // fetchMyLeavesThunk: only current user's leaves from GET /api/leave/my
// // // fetchAllLeavesThunk: all leaves for HR/Manager from GET /api/leave/all
// // // The backend already filters by employee via JWT for /my endpoint
// // // export const fetchMyLeavesThunk     = createAsyncThunk('leave/mine',    async (_?: any) => { const r = await LeaveAPI.getMine();    return r.data || []; });
// // // export const fetchAllLeavesThunk    = createAsyncThunk('leave/all',     async (st?: any) => { const r = await LeaveAPI.getAll(st);  return r.data || []; });
// // // export const fetchLeaveBalanceThunk = createAsyncThunk(
// // //   'leave/balance',
// // //   async (_, thunkAPI) => {
// // //     const r = await LeaveAPI.getBalance();
// // //     return r.data || null;
// // //   }
// // // );

// // export const fetchMyLeavesThunk = createAsyncThunk<any, void>(
// //   'leave/mine',
// //   async (_, thunkAPI) => {
// //     const r = await LeaveAPI.getMine();
// //     return r.data || [];
// //   }
// // );

// // export const fetchAllLeavesThunk = createAsyncThunk<any, void>(
// //   'leave/all',
// //   async (_, thunkAPI) => {
// //     const r = await LeaveAPI.getAll();
// //     return r.data || [];
// //   }
// // );

// // export const fetchLeaveBalanceThunk = createAsyncThunk<any, void>(
// //   'leave/balance',
// //   async (_, thunkAPI) => {
// //     const r = await LeaveAPI.getBalance();
// //     return r.data || null;
// //   }
// // );

// // export const applyLeaveThunk = createAsyncThunk('leave/apply', async (data: any, { rejectWithValue }) => {
// //   const res = await LeaveAPI.apply(data);
// //   if (!res.success) return rejectWithValue(res.message || 'Failed to apply leave');
// //   return res.data;
// // });

// // // export const updateLeaveStatusThunk = createAsyncThunk(
// // //   'leave/status',
// // //   async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }, { rejectWithValue }) => {
// // //     const res = await LeaveAPI.updateStatus(id, status, rejectionReason);
// // //     if (!res.success) return rejectWithValue(res.message);
// // //     return res.data;
// // //   }
// // // );

// // type UpdateLeavePayload = {
// //   id: number;
// //   status: string;
// //   rejectionReason?: string;
// // };

// // type LeaveResponse = {
// //   id: number;
// //   status: string;
// //   rejectionReason?: string;
// //   approvedByName?: string;
// // };

// // export const updateLeaveStatusThunk = createAsyncThunk<
// //   LeaveResponse,            // ✅ return type
// //   UpdateLeavePayload,       // ✅ input type
// //   { rejectValue: string }
// // >(
// //   "leave/updateStatus",
// //   async ({ id, status, rejectionReason }, { rejectWithValue }) => {
// //     try {
// //       console.log("CALLING API");

// //       // const res = await api.patch(`/leave/${id}/status`, {
// //       //   status,
// //       //   rejectionReason,
// //       // });
// //       const res = await LeaveAPI.updateStatus(id, status, rejectionReason);

// //       console.log("RESPONSE:", res.data);

// //       return res.data; // ✅ MUST return updated leave

// //     } catch (err: any) {
// //       console.log("ERROR:", err.response?.data);
// //       return rejectWithValue(err.response?.data || err.message);
// //     }
// //   }
// // );

// // export const deleteLeaveThunk = createAsyncThunk('leave/delete', async (id: number) => {
// //   await LeaveAPI.delete(id);
// //   return id;
// // });

// // const leaveSlice = createSlice({
// //   name: 'leave',
// //   initialState: {
// //     applications: [] as any[],      // current user's leaves
// //     allApplications: [] as any[],   // all leaves (for manager/HR)
// //     balance: null as any,
// //     loading: false,
// //     error: null as string | null,
// //   },
// //   reducers: {},
// //   extraReducers: b => {
// //     b.addCase(fetchMyLeavesThunk.fulfilled,     (s, a) => { s.applications = a.payload; });
// //     b.addCase(fetchAllLeavesThunk.fulfilled,    (s, a) => { s.allApplications = a.payload; });
// //     b.addCase(fetchLeaveBalanceThunk.fulfilled, (s, a) => { s.balance = a.payload; });
// //     b.addCase(applyLeaveThunk.pending,   s => { s.loading = true; s.error = null; });
// //     b.addCase(applyLeaveThunk.fulfilled, (s, a) => {
// //       s.loading = false;
// //       if (a.payload) {
// //         s.applications.unshift(a.payload);
// //         s.allApplications.unshift(a.payload);
// //       }
// //     });
// //     b.addCase(applyLeaveThunk.rejected, (s, a) => {
// //       s.loading = false;
// //       s.error = a.payload as string;
// //     });
// //     b.addCase(updateLeaveStatusThunk.fulfilled, (s, a) => {
// //       if (!a.payload) return;
// //       const upd = (list: any[]) => {
// //         const i = list.findIndex(l => l.id === a.payload.id);
// //         if (i !== -1) list[i] = a.payload;
// //       };
// //       upd(s.applications);
// //       upd(s.allApplications);
// //     });
// //     b.addCase(deleteLeaveThunk.fulfilled, (s, a) => {
// //       s.applications = s.applications.filter(l => l.id !== a.payload);
// //       s.allApplications = s.allApplications.filter(l => l.id !== a.payload);
// //     });
// //   },
// // });

// // // ─── NEWS ───────────────────────────────────────────────────────────────────
// // export const fetchNewsThunk  = createAsyncThunk('news/all',    async () => { const r = await NewsAPI.getAll();  return r.data || []; });
// // export const createNewsThunk = createAsyncThunk('news/create', async (data: any, { rejectWithValue }) => {
// //   const r = await NewsAPI.create(data);
// //   if (!r.success) return rejectWithValue(r.message);
// //   return r.data;
// // });
// // export const deleteNewsThunk = createAsyncThunk('news/delete', async (id: number) => {
// //   await NewsAPI.delete(id);
// //   return id;
// // });

// // const newsSlice = createSlice({
// //   name: 'news',
// //   initialState: { list: [] as any[], loading: false },
// //   reducers: {
// //     incViews: (s, a: PayloadAction<number>) => {
// //       const n = s.list.find((x: any) => x.id === a.payload);
// //       if (n) n.views = (n.views || 0) + 1;
// //     },
// //   },
// //   extraReducers: b => {
// //     b.addCase(fetchNewsThunk.pending,   s => { s.loading = true; });
// //     b.addCase(fetchNewsThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; });
// //     b.addCase(fetchNewsThunk.rejected,  s => { s.loading = false; });
// //     b.addCase(createNewsThunk.fulfilled, (s, a) => { if (a.payload) s.list.unshift(a.payload); });
// //     b.addCase(deleteNewsThunk.fulfilled, (s, a) => { s.list = s.list.filter((n: any) => n.id !== a.payload); });
// //   },
// // });

// // // ─── EVENTS ─────────────────────────────────────────────────────────────────
// // export const fetchEventsThunk   = createAsyncThunk('events/all',      async () => { const r = await EventsAPI.getAll();     return r.data || []; });
// // export const fetchHolidaysThunk = createAsyncThunk('events/holidays', async () => { const r = await EventsAPI.getHolidays(); return r.data || []; });
// // export const createEventThunk   = createAsyncThunk('events/create',   async (data: any, { rejectWithValue }) => {
// //   const r = await EventsAPI.create(data);
// //   if (!r.success) return rejectWithValue(r.message);
// //   return r.data;
// // });
// // export const deleteEventThunk = createAsyncThunk('events/delete', async (id: number) => {
// //   await EventsAPI.delete(id);
// //   return id;
// // });

// // const eventsSlice = createSlice({
// //   name: 'events',
// //   initialState: { list: [] as any[], holidays: [] as any[], loading: false },
// //   reducers: {},
// //   extraReducers: b => {
// //     b.addCase(fetchEventsThunk.fulfilled,   (s, a) => { s.list = a.payload; });
// //     b.addCase(fetchHolidaysThunk.fulfilled, (s, a) => { s.holidays = a.payload; });
// //     b.addCase(createEventThunk.fulfilled,   (s, a) => { if (a.payload) s.list.push(a.payload); });
// //     b.addCase(deleteEventThunk.fulfilled,   (s, a) => { s.list = s.list.filter((e: any) => e.id !== a.payload); });
// //   },
// // });

// // // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
// // // export const fetchNotificationsThunk = createAsyncThunk('notif/all', async () => {
// // //   const [lr, cr] = await Promise.all([
// // //     NotificationsAPI.getMine(),
// // //     NotificationsAPI.getUnreadCount(),
// // //   ]);
// // //   return { list: lr.data || [], unread: (cr.data as any) ?? 0 };
// // // });
// // export const fetchNotificationsThunk = createAsyncThunk<
// //   { list: any[]; unread: number }, // return type
// //   void                             // argument type (IMPORTANT)
// // >(
// //   'notif/all',
// //   async (_, thunkAPI) => {
// //     const [lr, cr] = await Promise.all([
// //       NotificationsAPI.getMine(),
// //       NotificationsAPI.getUnreadCount(),
// //     ]);

// //     return {
// //       list: lr.data || [],
// //       unread: (cr.data as any) ?? 0,
// //     };
// //   }
// // );
// // export const markReadThunk    = createAsyncThunk('notif/read',    async (id: number) => { await NotificationsAPI.markRead(id);  return id; });
// // export const markAllReadThunk = createAsyncThunk('notif/readAll', async ()            => { await NotificationsAPI.markAllRead(); });

// // const notifSlice = createSlice({
// //   name: 'notif',
// //   initialState: { list: [] as any[], unread: 0 },
// //   reducers: {},
// //   extraReducers: b => {
// //     b.addCase(fetchNotificationsThunk.fulfilled, (s, a) => { s.list = a.payload.list; s.unread = a.payload.unread; });
// //     b.addCase(markReadThunk.fulfilled,   (s, a) => {
// //       const n = s.list.find((x: any) => x.id === a.payload);
// //       if (n && !n.isRead) { n.isRead = true; s.unread = Math.max(0, s.unread - 1); }
// //     });
// //     b.addCase(markAllReadThunk.fulfilled, s => { s.list.forEach((n: any) => n.isRead = true); s.unread = 0; });
// //   },
// // });

// // // ─── STORE ──────────────────────────────────────────────────────────────────
// // export const store = configureStore({
// //   reducer: {
// //     auth:       authSlice.reducer,
// //     employees:  employeesSlice.reducer,
// //     today:      todaySlice.reducer,
// //     attendance: attendanceSlice.reducer,
// //     leave:      leaveSlice.reducer,
// //     news:       newsSlice.reducer,
// //     events:     eventsSlice.reducer,
// //     notif:      notifSlice.reducer,
// //   },
// // });

// // export const { clearError }  = authSlice.actions;
// // export const { resetToday }  = todaySlice.actions;
// // export const { incViews }    = newsSlice.actions;

// // export type RootState   = ReturnType<typeof store.getState>;
// // export type AppDispatch = typeof store.dispatch;
// /**
//  * MonkHRMS – Redux Store (fully API-driven)
//  * Fixed: toggle status, leave approve/reject, all reducers
//  */
// import { createSlice, PayloadAction, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
// import {
//   AuthAPI, EmployeesAPI, AttendanceAPI, LeaveAPI,
//   NewsAPI, EventsAPI, NotificationsAPI,
//   saveToken, clearToken, getToken,
// } from '../services/api';

// // ─── AUTH ─────────────────────────────────────────────────────────────────────
// export const loginThunk = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
//     const res = await AuthAPI.login(email, password);
//     if (!res.success || !res.data) return rejectWithValue(res.message || 'Login failed');
//     await saveToken(res.data.token);
//     return res.data;
//   },
// );

// export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
//   const tok = await getToken();
//   if (!tok) return null;
//   const res = await AuthAPI.me();
//   if (!res.success || !res.data) { await clearToken(); return null; }
//   return res.data;
// });

// export const logoutThunk = createAsyncThunk('auth/logout', async () => {
//   await clearToken();
// });

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     user: null as any,
//     isAuthenticated: false,
//     loading: false,
//     error: null as string | null,
//     restored: false,
//   },
//   reducers: {
//     clearError: (s) => { s.error = null; },
//   },
//   extraReducers: b => {
//     b.addCase(loginThunk.pending,   s => { s.loading = true; s.error = null; });
//     b.addCase(loginThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.employee; s.isAuthenticated = true; });
//     b.addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
//     b.addCase(logoutThunk.fulfilled, s => { s.user = null; s.isAuthenticated = false; s.error = null; });
//     b.addCase(restoreSessionThunk.fulfilled, (s, a) => {
//       s.restored = true;
//       if (a.payload) { s.user = a.payload; s.isAuthenticated = true; }
//     });
//     b.addCase(restoreSessionThunk.rejected, s => { s.restored = true; });
//   },
// });

// // ─── EMPLOYEES ────────────────────────────────────────────────────────────────
// export const fetchEmployeesThunk = createAsyncThunk<any[], void>(
//   'employees/fetchAll',
//   async (_, { rejectWithValue }) => {
//     const res = await EmployeesAPI.getAll();
//     if (!res.success) return rejectWithValue(res.message);
//     return res.data || [];
//   }
// );

// export const createEmployeeThunk = createAsyncThunk('employees/create', async (data: any, { rejectWithValue }) => {
//   const res = await EmployeesAPI.create(data);
//   if (!res.success) return rejectWithValue(res.message);
//   return res.data;
// });

// export const updateEmployeeThunk = createAsyncThunk('employees/update', async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
//   const res = await EmployeesAPI.update(id, data);
//   if (!res.success) return rejectWithValue(res.message);
//   return res.data;
// });

// // FIX: toggleStatus now returns the updated employee object (with correct isActive)
// // instead of just the id — this prevents desyncing if the server fails
// export const toggleEmployeeStatusThunk = createAsyncThunk(
//   'employees/toggle',
//   async (id: number, { rejectWithValue }) => {
//     const res = await EmployeesAPI.toggleStatus(id);
//     if (!res.success) return rejectWithValue(res.message);
//     // Return the id so the reducer can flip isActive optimistically
//     // After toggle we refetch to sync with server truth
//     return id;
//   }
// );

// export const deleteEmployeeThunk = createAsyncThunk('employees/delete', async (id: number, { rejectWithValue }) => {
//   const res = await EmployeesAPI.delete(id);
//   if (!res.success) return rejectWithValue(res.message);
//   return id;
// });

// const employeesSlice = createSlice({
//   name: 'employees',
//   initialState: { list: [] as any[], loading: false, error: null as string | null },
//   reducers: {},
//   extraReducers: b => {
//     b.addCase(fetchEmployeesThunk.pending,   s => { s.loading = true; s.error = null; });
//     b.addCase(fetchEmployeesThunk.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; });
//     b.addCase(fetchEmployeesThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
//     b.addCase(createEmployeeThunk.fulfilled, (s, a) => { if (a.payload) s.list.push(a.payload); });
//     b.addCase(updateEmployeeThunk.fulfilled, (s, a) => {
//       if (!a.payload) return;
//       const i = s.list.findIndex(e => e.id === a.payload.id);
//       if (i !== -1) s.list[i] = a.payload;
//     });
//     // FIX: flip isActive locally (optimistic); caller should refetch to confirm
//     b.addCase(toggleEmployeeStatusThunk.fulfilled, (s, a) => {
//       const e = s.list.find(e => e.id === a.payload);
//       if (e) e.isActive = !e.isActive;
//     });
//     // FIX: on toggle failure, we do NOT change isActive (no optimistic on rejection)
//     b.addCase(toggleEmployeeStatusThunk.rejected, (s) => { /* nothing — optimistic was already applied, refetch will fix */ });
//     b.addCase(deleteEmployeeThunk.fulfilled, (s, a) => {
//       s.list = s.list.filter(e => e.id !== a.payload);
//     });
//   },
// });

// // ─── TODAY ATTENDANCE ─────────────────────────────────────────────────────────
// export const fetchTodayAttendanceThunk = createAsyncThunk('today/fetch', async () => {
//   const res = await AttendanceAPI.getToday();
//   return res.data || null;
// });

// export const checkInThunk = createAsyncThunk('today/checkIn', async (_, { rejectWithValue }) => {
//   const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
//   const res = await AttendanceAPI.checkIn(time, 'manual');
//   if (!res.success) return rejectWithValue(res.message);
//   return { time, data: res.data };
// });

// export const checkOutThunk = createAsyncThunk('today/checkOut', async (_, { rejectWithValue }) => {
//   const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
//   const res = await AttendanceAPI.checkOut(time, 'manual');
//   if (!res.success) return rejectWithValue(res.message);
//   return { time, data: res.data };
// });

// const todaySlice = createSlice({
//   name: 'today',
//   initialState: {
//     status: 'out' as 'out' | 'in' | 'done',
//     checkIn: null as string | null,
//     checkOut: null as string | null,
//     loading: false,
//     error: null as string | null,
//   },
//   reducers: {
//     resetToday: s => { s.status = 'out'; s.checkIn = null; s.checkOut = null; s.error = null; },
//   },
//   extraReducers: b => {
//     b.addCase(fetchTodayAttendanceThunk.fulfilled, (s, a) => {
//       const r = a.payload;
//       if (!r) { s.status = 'out'; s.checkIn = null; s.checkOut = null; return; }
//       if (r.checkIn && r.checkOut) { s.status = 'done'; s.checkIn = r.checkIn; s.checkOut = r.checkOut; }
//       else if (r.checkIn) { s.status = 'in'; s.checkIn = r.checkIn; }
//       else { s.status = 'out'; s.checkIn = null; s.checkOut = null; }
//     });
//     b.addCase(checkInThunk.pending,    s => { s.loading = true; s.error = null; });
//     b.addCase(checkInThunk.fulfilled,  (s, a) => { s.loading = false; s.status = 'in'; s.checkIn = a.payload.time; });
//     b.addCase(checkInThunk.rejected,   (s, a) => { s.loading = false; s.error = a.payload as string; });
//     b.addCase(checkOutThunk.pending,   s => { s.loading = true; s.error = null; });
//     b.addCase(checkOutThunk.fulfilled, (s, a) => { s.loading = false; s.status = 'done'; s.checkOut = a.payload.time; });
//     b.addCase(checkOutThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
//   },
// });

// // ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
// export const fetchMyAttendanceThunk = createAsyncThunk(
//   'attendance/fetchMine',
//   async ({ month, year }: { month?: number; year?: number } = {}) => {
//     const res = await AttendanceAPI.getMine(month, year);
//     return res.data || [];
//   }
// );

// export const fetchAttendanceSummaryThunk = createAsyncThunk(
//   'attendance/summary',
//   async ({ month, year }: { month?: number; year?: number } = {}) => {
//     const res = await AttendanceAPI.getSummary(month, year);
//     return res.data || null;
//   }
// );

// const attendanceSlice = createSlice({
//   name: 'attendance',
//   initialState: { records: [] as any[], summary: null as any, loading: false },
//   reducers: {},
//   extraReducers: b => {
//     b.addCase(fetchMyAttendanceThunk.pending,   s => { s.loading = true; });
//     b.addCase(fetchMyAttendanceThunk.fulfilled, (s, a) => { s.loading = false; s.records = a.payload; });
//     b.addCase(fetchMyAttendanceThunk.rejected,  s => { s.loading = false; });
//     b.addCase(fetchAttendanceSummaryThunk.fulfilled, (s, a) => { s.summary = a.payload; });
//   },
// });

// // ─── LEAVE ────────────────────────────────────────────────────────────────────
// export const fetchMyLeavesThunk = createAsyncThunk<any[], void>(
//   'leave/mine',
//   async (_, { rejectWithValue }) => {
//     const r = await LeaveAPI.getMine();
//     if (!r.success) return rejectWithValue(r.message);
//     return r.data || [];
//   }
// );

// export const fetchAllLeavesThunk = createAsyncThunk<any[], string | void>(
//   'leave/all',
//   async (status, { rejectWithValue }) => {
//     const r = await LeaveAPI.getAll(status as string | undefined);
//     if (!r.success) return rejectWithValue(r.message);
//     return r.data || [];
//   }
// );

// export const fetchLeaveBalanceThunk = createAsyncThunk<any, void>(
//   'leave/balance',
//   async (_, { rejectWithValue }) => {
//     const r = await LeaveAPI.getBalance();
//     if (!r.success) return rejectWithValue(r.message);
//     return r.data || null;
//   }
// );

// export const applyLeaveThunk = createAsyncThunk('leave/apply', async (data: any, { rejectWithValue }) => {
//   const res = await LeaveAPI.apply(data);
//   if (!res.success) return rejectWithValue(res.message || 'Failed to apply leave');
//   return res.data;
// });

// // FIX: Correctly typed — returns the full LeaveApplicationDto from server
// export const updateLeaveStatusThunk = createAsyncThunk<
//   any,
//   { id: number; status: string; rejectionReason?: string },
//   { rejectValue: string }
// >(
//   'leave/updateStatus',
//   async ({ id, status, rejectionReason }, { rejectWithValue }) => {
//     try {
//       const res = await LeaveAPI.updateStatus(id, status, rejectionReason);
//       if (!res.success) return rejectWithValue(res.message || 'Failed to update status');
//       return res.data;
//     } catch (err: any) {
//       return rejectWithValue(err?.message || 'Network error');
//     }
//   }
// );

// export const deleteLeaveThunk = createAsyncThunk('leave/delete', async (id: number, { rejectWithValue }) => {
//   const res = await LeaveAPI.delete(id);
//   if (!res.success) return rejectWithValue(res.message);
//   return id;
// });

// const leaveSlice = createSlice({
//   name: 'leave',
//   initialState: {
//     applications: [] as any[],
//     allApplications: [] as any[],
//     balance: null as any,
//     loading: false,
//     error: null as string | null,
//   },
//   reducers: {
//     clearLeaveError: s => { s.error = null; },
//   },
//   extraReducers: b => {
//     b.addCase(fetchMyLeavesThunk.pending,   s => { s.loading = true; });
//     b.addCase(fetchMyLeavesThunk.fulfilled, (s, a) => { s.loading = false; s.applications = a.payload; });
//     b.addCase(fetchMyLeavesThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

//     b.addCase(fetchAllLeavesThunk.pending,   s => { s.loading = true; });
//     b.addCase(fetchAllLeavesThunk.fulfilled, (s, a) => { s.loading = false; s.allApplications = a.payload; });
//     b.addCase(fetchAllLeavesThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

//     b.addCase(fetchLeaveBalanceThunk.fulfilled, (s, a) => { s.balance = a.payload; });

//     b.addCase(applyLeaveThunk.pending,   s => { s.loading = true; s.error = null; });
//     b.addCase(applyLeaveThunk.fulfilled, (s, a) => {
//       s.loading = false;
//       if (a.payload) {
//         s.applications.unshift(a.payload);
//         s.allApplications.unshift(a.payload);
//       }
//     });
//     b.addCase(applyLeaveThunk.rejected, (s, a) => {
//       s.loading = false;
//       s.error = a.payload as string;
//     });

//     // FIX: update both lists when status changes
//     b.addCase(updateLeaveStatusThunk.pending,   s => { s.loading = true; s.error = null; });
//     b.addCase(updateLeaveStatusThunk.fulfilled, (s, a) => {
//       s.loading = false;
//       if (!a.payload) return;
//       const upd = (list: any[]) => {
//         const i = list.findIndex(l => l.id === a.payload.id);
//         if (i !== -1) list[i] = { ...list[i], ...a.payload };
//       };
//       upd(s.applications);
//       upd(s.allApplications);
//     });
//     b.addCase(updateLeaveStatusThunk.rejected, (s, a) => {
//       s.loading = false;
//       s.error = a.payload as string;
//     });

//     b.addCase(deleteLeaveThunk.fulfilled, (s, a) => {
//       s.applications    = s.applications.filter(l => l.id !== a.payload);
//       s.allApplications = s.allApplications.filter(l => l.id !== a.payload);
//     });
//   },
// });

// // ─── NEWS ─────────────────────────────────────────────────────────────────────
// export const fetchNewsThunk  = createAsyncThunk('news/all',    async () => { const r = await NewsAPI.getAll();  return r.data || []; });
// export const createNewsThunk = createAsyncThunk('news/create', async (data: any, { rejectWithValue }) => {
//   const r = await NewsAPI.create(data);
//   if (!r.success) return rejectWithValue(r.message);
//   return r.data;
// });
// export const deleteNewsThunk = createAsyncThunk('news/delete', async (id: number) => {
//   await NewsAPI.delete(id);
//   return id;
// });

// const newsSlice = createSlice({
//   name: 'news',
//   initialState: { list: [] as any[], loading: false },
//   reducers: {
//     incViews: (s, a: PayloadAction<number>) => {
//       const n = s.list.find((x: any) => x.id === a.payload);
//       if (n) n.views = (n.views || 0) + 1;
//     },
//   },
//   extraReducers: b => {
//     b.addCase(fetchNewsThunk.pending,    s => { s.loading = true; });
//     b.addCase(fetchNewsThunk.fulfilled,  (s, a) => { s.loading = false; s.list = a.payload; });
//     b.addCase(fetchNewsThunk.rejected,   s => { s.loading = false; });
//     b.addCase(createNewsThunk.fulfilled, (s, a) => { if (a.payload) s.list.unshift(a.payload); });
//     b.addCase(deleteNewsThunk.fulfilled, (s, a) => { s.list = s.list.filter((n: any) => n.id !== a.payload); });
//   },
// });

// // ─── EVENTS ───────────────────────────────────────────────────────────────────
// export const fetchEventsThunk   = createAsyncThunk('events/all',      async () => { const r = await EventsAPI.getAll();     return r.data || []; });
// export const fetchHolidaysThunk = createAsyncThunk('events/holidays', async () => { const r = await EventsAPI.getHolidays(); return r.data || []; });
// export const createEventThunk   = createAsyncThunk('events/create',   async (data: any, { rejectWithValue }) => {
//   const r = await EventsAPI.create(data);
//   if (!r.success) return rejectWithValue(r.message);
//   return r.data;
// });
// export const deleteEventThunk = createAsyncThunk('events/delete', async (id: number) => {
//   await EventsAPI.delete(id);
//   return id;
// });

// const eventsSlice = createSlice({
//   name: 'events',
//   initialState: { list: [] as any[], holidays: [] as any[], loading: false },
//   reducers: {},
//   extraReducers: b => {
//     b.addCase(fetchEventsThunk.fulfilled,   (s, a) => { s.list = a.payload; });
//     b.addCase(fetchHolidaysThunk.fulfilled, (s, a) => { s.holidays = a.payload; });
//     b.addCase(createEventThunk.fulfilled,   (s, a) => { if (a.payload) s.list.push(a.payload); });
//     b.addCase(deleteEventThunk.fulfilled,   (s, a) => { s.list = s.list.filter((e: any) => e.id !== a.payload); });
//   },
// });

// // ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
// export const fetchNotificationsThunk = createAsyncThunk<{ list: any[]; unread: number }, void>(
//   'notif/all',
//   async (_, { rejectWithValue }) => {
//     const [lr, cr] = await Promise.all([
//       NotificationsAPI.getMine(),
//       NotificationsAPI.getUnreadCount(),
//     ]);
//     return {
//       list:   lr.data || [],
//       unread: (cr.data as any) ?? 0,
//     };
//   }
// );

// export const markReadThunk    = createAsyncThunk('notif/read',    async (id: number) => { await NotificationsAPI.markRead(id);  return id; });
// export const markAllReadThunk = createAsyncThunk('notif/readAll', async ()            => { await NotificationsAPI.markAllRead(); });

// const notifSlice = createSlice({
//   name: 'notif',
//   initialState: { list: [] as any[], unread: 0 },
//   reducers: {},
//   extraReducers: b => {
//     b.addCase(fetchNotificationsThunk.fulfilled, (s, a) => { s.list = a.payload.list; s.unread = a.payload.unread; });
//     b.addCase(markReadThunk.fulfilled,   (s, a) => {
//       const n = s.list.find((x: any) => x.id === a.payload);
//       if (n && !n.isRead) { n.isRead = true; s.unread = Math.max(0, s.unread - 1); }
//     });
//     b.addCase(markAllReadThunk.fulfilled, s => { s.list.forEach((n: any) => n.isRead = true); s.unread = 0; });
//   },
// });

// // ─── STORE ────────────────────────────────────────────────────────────────────
// export const store = configureStore({
//   reducer: {
//     auth:       authSlice.reducer,
//     employees:  employeesSlice.reducer,
//     today:      todaySlice.reducer,
//     attendance: attendanceSlice.reducer,
//     leave:      leaveSlice.reducer,
//     news:       newsSlice.reducer,
//     events:     eventsSlice.reducer,
//     notif:      notifSlice.reducer,
//   },
// });

// export const { clearError }      = authSlice.actions;
// export const { resetToday }      = todaySlice.actions;
// export const { incViews }        = newsSlice.actions;
// export const { clearLeaveError } = leaveSlice.actions;

// export type RootState   = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;