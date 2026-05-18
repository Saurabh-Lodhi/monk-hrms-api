import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  RootState, AppDispatch,
  fetchMyLeavesThunk, fetchAllLeavesThunk, fetchLeaveBalanceThunk,
  updateLeaveStatusThunk, fetchEmployeesThunk, fetchNotificationsThunk,
} from '../../store';
import { LEAVE_TYPES } from '../../data/company';
import { useTheme } from '../../hooks/useTheme';

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: any }> = {
  approved: { color: '#4CAF50', bg: '#4CAF5020', icon: 'checkmark-circle' },
  pending:  { color: '#FF9800', bg: '#FF980020', icon: 'time'             },
  rejected: { color: '#F44336', bg: '#F4433620', icon: 'close-circle'     },
};

export default function LeaveScreen() {
  const { isDark, theme } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const currentUser    = useSelector((s: RootState) => s.auth.user);
  const allEmployees   = useSelector((s: RootState) => s.employees.list);
  const myApplications = useSelector((s: RootState) => s.leave.applications);
  const serverAllApps  = useSelector((s: RootState) => s.leave.allApplications);
  const balance        = useSelector((s: RootState) => s.leave.balance);
  const leaveLoading   = useSelector((s: RootState) => s.leave.loading);
  const unreadCount    = useSelector((s: RootState) => s.notif.unread);

  const [tab,           setTab]           = useState<'balance' | 'history' | 'pending'>('balance');
  const [refreshing,    setRefreshing]    = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const canApprove = ['hr', 'manager', 'admin'].includes(currentUser?.role || '');

  const loadAll = useCallback(() => {
    dispatch(fetchLeaveBalanceThunk());
    dispatch(fetchMyLeavesThunk());
    dispatch(fetchEmployeesThunk());
    dispatch(fetchNotificationsThunk());
    if (canApprove) dispatch(fetchAllLeavesThunk());
  }, [dispatch, canApprove]);

  useEffect(() => { loadAll(); }, []);

  // Re-fetch every time the pending tab is opened so it's always fresh
  useEffect(() => {
    if (tab === 'pending' && canApprove) {
      dispatch(fetchAllLeavesThunk());
      dispatch(fetchEmployeesThunk());
    }
  }, [tab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadAll();
    setTimeout(() => setRefreshing(false), 1200);
  }, [loadAll]);

  const pendingApprovals = canApprove
    ? serverAllApps.filter((a: any) => a.status === 'pending')
    : [];

  const executeAction = async (
    id: number,
    empName: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    setActionLoading(id);
    try {
      await dispatch(updateLeaveStatusThunk({ id, status, rejectionReason })).unwrap();
      dispatch(fetchAllLeavesThunk());
      dispatch(fetchMyLeavesThunk());
      dispatch(fetchNotificationsThunk());
      dispatch(fetchLeaveBalanceThunk());
      if (Platform.OS === 'web') {
        window.alert(`${empName}'s leave has been ${status}.`);
      } else {
        Alert.alert(
          status === 'approved' ? '✅ Approved' : '❌ Rejected',
          `${empName}'s leave has been ${status}.`,
        );
      }
    } catch (err: any) {
      const msg = err?.message || err || 'Failed to update leave status.';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = useCallback((id: number, empName: string, action: 'approved' | 'rejected') => {
    if (Platform.OS === 'web') {
      if (action === 'rejected') {
        const reason = window.prompt(`Reason for rejecting ${empName}'s leave:`, 'Rejected by manager');
        if (reason === null) return;
        executeAction(id, empName, 'rejected', reason || 'Rejected by manager');
      } else {
        if (window.confirm(`Approve ${empName}'s leave request?`)) {
          executeAction(id, empName, 'approved', undefined);
        }
      }
      return;
    }
    if (action === 'rejected') {
      if (Alert.prompt) {
        Alert.prompt('Reject Leave', `Reason for rejecting ${empName}'s leave:`, [
          { text: 'Reject', style: 'destructive', onPress: (reason) => executeAction(id, empName, 'rejected', reason || 'Rejected by manager') },
          { text: 'Cancel', style: 'cancel' },
        ], 'plain-text', 'Rejected by manager');
      } else {
        Alert.alert('Reject Leave', `Reject ${empName}'s leave request?`, [
          { text: 'Reject', style: 'destructive', onPress: () => executeAction(id, empName, 'rejected', 'Rejected by manager') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } else {
      Alert.alert('Approve Leave', `Approve ${empName}'s leave request?`, [
        { text: 'Approve', onPress: () => executeAction(id, empName, 'approved', undefined) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, []);

  // Case-insensitive — backend stores 'CL', LEAVE_TYPES has id: 'CL'
  const getLeaveType = (id: string) =>
    LEAVE_TYPES.find(l => l.id.toUpperCase() === id?.toUpperCase());

  // Safe balance lookup — backend keys are uppercase (CL, SL, EL...)
  const getBalanceVal = (leaveId: string): number => {
    if (!balance) return 0;
    const val = (balance as any)[leaveId.toUpperCase()];
    return typeof val === 'number' ? val : 0;
  };

  const bg     = theme.bg;
  const cardBg = theme.bgCard;
  const txt    = theme.text;
  const sub    = theme.textSub;
  const border = theme.border;

  const tabs: { key: 'balance' | 'history' | 'pending'; label: string }[] = [
    { key: 'balance', label: 'Balance' },
    { key: 'history', label: 'My Leaves' },
    ...(canApprove
      ? [{ key: 'pending' as const, label: `Approvals${pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ''}` }]
      : []),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFFFFF', '#F0F4FF']} style={s.header}>
        <View>
          <Text style={[s.headerTitle, { color: txt }]}>Leave</Text>
          <Text style={[s.headerSub, { color: sub }]}>Manage your leaves</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[s.notifBadge, { backgroundColor: '#F44336' }]}
              onPress={() => router.push('/screens/notifications' as any)}
            >
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>{unreadCount}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)}>
            <LinearGradient colors={['#F5A623', '#E6940F']} style={s.applyBtn}>
              <Ionicons name="add" size={16} color="#000" />
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[s.tabBar, { backgroundColor: cardBg, borderBottomColor: border }]}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tabItem, tab === t.key && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={{ color: tab === t.key ? '#F5A623' : sub, fontWeight: '700', fontSize: 13 }}>
              {t.label}
            </Text>
            {t.key === 'pending' && pendingApprovals.length > 0 && <View style={s.tabDot} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" colors={['#F5A623']} />}
      >

        {/* ─── BALANCE TAB ──────────────────────────────────── */}
        {tab === 'balance' && (
          <View style={{ padding: 16 }}>
            <LinearGradient colors={['#F5A623', '#E6940F']} style={s.summaryCard}>
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: '600' }}>Total Available Balance</Text>
              <Text style={{ color: '#000', fontSize: 36, fontWeight: '900', marginVertical: 4 }}>
                {balance
                  ? (getBalanceVal('CL') + getBalanceVal('SL') + getBalanceVal('EL'))
                  : '—'} days
              </Text>
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>Casual + Sick + Earned remaining</Text>
            </LinearGradient>

            {!balance && leaveLoading && <ActivityIndicator color="#F5A623" style={{ marginTop: 20 }} />}

            {LEAVE_TYPES.map(lt => {
              const remaining = getBalanceVal(lt.id);
              const total     = (lt as any).annualLimit ?? 0;
              const used      = total > 0 ? Math.max(0, total - remaining) : 0;
              const pct       = total > 0 ? Math.min(100, (remaining / total) * 100) : 0;

              return (
                <View key={lt.id} style={[s.leaveCard, { backgroundColor: cardBg, borderColor: border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={[s.leaveIcon, { backgroundColor: lt.color + '20' }]}>
                      <Ionicons name={lt.icon as any} size={20} color={lt.color} />
                    </View>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ color: txt, fontSize: 14, fontWeight: '700' }}>{lt.name}</Text>
                      <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>
                        {(lt as any).description || (lt as any).desc || ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: lt.color, fontSize: 22, fontWeight: '900' }}>
                        {lt.id === 'LOP' ? getBalanceVal('LOP') : remaining}
                      </Text>
                      <Text style={{ color: sub, fontSize: 10 }}>
                        {total > 0 ? `of ${total}` : 'on demand'}
                      </Text>
                    </View>
                  </View>
                  {total > 0 && (
                    <>
                      <View style={[s.progressBg, { backgroundColor: isDark ? '#2A2A40' : '#E0E6FF' }]}>
                        <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: lt.color }]} />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                        <Text style={{ color: sub, fontSize: 11 }}>Used: {used} days</Text>
                        <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700' }}>{Math.round(pct)}% remaining</Text>
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ─── HISTORY TAB ──────────────────────────────────── */}
        {tab === 'history' && (
          <View style={{ padding: 16 }}>
            {leaveLoading && myApplications.length === 0 && (
              <ActivityIndicator color="#F5A623" style={{ marginTop: 32 }} />
            )}
            {!leaveLoading && myApplications.length === 0 ? (
              <View style={[s.emptyState, { backgroundColor: cardBg }]}>
                <Ionicons name="calendar-outline" size={48} color={sub} />
                <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No leave applications yet</Text>
                <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)} style={{ marginTop: 16 }}>
                  <LinearGradient colors={['#F5A623', '#E6940F']} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
                    <Text style={{ color: '#000', fontWeight: '800' }}>Apply Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              myApplications.map((app: any) => {
                const lt = getLeaveType(app.leaveType);
                const ss = STATUS_STYLE[app.status?.toLowerCase()] || STATUS_STYLE.pending;
                return (
                  <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: lt?.color || '#F5A623' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '20' }]}>
                          <Text style={{ color: lt?.color || '#888', fontSize: 11, fontWeight: '700' }}>
                            {(lt as any)?.code || app.leaveType?.toUpperCase()} — {lt?.name || app.leaveType}
                          </Text>
                        </View>
                        <Text style={{ color: txt, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
                          {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
                        </Text>
                        <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>
                          {app.days} day{app.days !== 1 ? 's' : ''} · Applied: {app.appliedOn}
                        </Text>
                        <Text style={{ color: sub, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>"{app.reason}"</Text>
                        {app.status === 'approved' && (
                          <Text style={{ color: '#4CAF50', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                            ✅ Approved{app.approvedByName ? ` by ${app.approvedByName}` : ''}
                          </Text>
                        )}
                        {app.rejectionReason && (
                          <Text style={{ color: '#F44336', fontSize: 11, marginTop: 4 }}>
                            ❌ {app.rejectionReason}
                          </Text>
                        )}
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
                        <Ionicons name={ss.icon} size={12} color={ss.color} />
                        <Text style={{ color: ss.color, fontSize: 11, fontWeight: '700', marginLeft: 4, textTransform: 'capitalize' }}>
                          {app.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── PENDING APPROVALS TAB ────────────────────────── */}
        {tab === 'pending' && (
          <View style={{ padding: 16 }}>
            {leaveLoading && pendingApprovals.length === 0 && (
              <ActivityIndicator color="#F5A623" style={{ marginTop: 32 }} />
            )}
            {pendingApprovals.length > 0 && (
              <View style={[s.pendingBanner, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
                <Ionicons name="time-outline" size={18} color="#FF9800" />
                <Text style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
                  {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
                </Text>
              </View>
            )}
            {!leaveLoading && pendingApprovals.length === 0 ? (
              <View style={[s.emptyState, { backgroundColor: cardBg }]}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#4CAF50" />
                <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>All caught up!</Text>
                <Text style={{ color: sub, fontSize: 13, marginTop: 4 }}>No pending leave approvals.</Text>
              </View>
            ) : (
              pendingApprovals.map((app: any) => {
                const lt       = getLeaveType(app.leaveType);
                const emp      = allEmployees.find((e: any) => e.id === app.employeeId);
                const isActing = actionLoading === app.id;
                const empName  = app.employeeName || emp?.name || 'Employee';
                return (
                  <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: '#FF9800' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      {emp?.avatar
                        ? <Image source={{ uri: emp.avatar }} style={s.empAvatar} />
                        : <View style={[s.empAvatar, { backgroundColor: '#F5A62330', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#F5A623', fontWeight: '900', fontSize: 18 }}>{empName[0]}</Text>
                          </View>
                      }
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ color: txt, fontSize: 15, fontWeight: '800' }}>{empName}</Text>
                        <Text style={{ color: sub, fontSize: 11 }}>{app.employeeDesignation || emp?.designation}</Text>
                      </View>
                      <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '25' }]}>
                        <Text style={{ color: lt?.color || '#888', fontSize: 12, fontWeight: '800' }}>
                          {(lt as any)?.code || app.leaveType?.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={{ backgroundColor: isDark ? '#1A1A2E' : '#F8FAFF', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Ionicons name="calendar-outline" size={14} color={sub} />
                        <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>
                          {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
                        </Text>
                        <View style={[s.daysPill, { backgroundColor: '#FF980020' }]}>
                          <Text style={{ color: '#FF9800', fontSize: 11, fontWeight: '700' }}>
                            {app.days} day{app.days !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="briefcase-outline" size={14} color={sub} />
                        <Text style={{ color: sub, fontSize: 12 }}>{lt?.name || app.leaveType} Leave</Text>
                      </View>
                    </View>

                    <Text style={{ color: sub, fontSize: 12, fontStyle: 'italic', marginBottom: 14, lineHeight: 18 }}>
                      "{app.reason}"
                    </Text>

                    {isActing ? (
                      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                        <ActivityIndicator color="#F5A623" />
                        <Text style={{ color: sub, fontSize: 12, marginTop: 6 }}>Processing...</Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                          style={[s.rejectBtn, { borderColor: '#F44336' }]}
                          onPress={() => handleAction(app.id, empName, 'rejected')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                          <Text style={{ color: '#F44336', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ flex: 2 }}
                          onPress={() => handleAction(app.id, empName, 'approved')}
                          activeOpacity={0.7}
                        >
                          <LinearGradient colors={['#4CAF50', '#2E7D32']} style={s.approveBtn}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13, marginLeft: 6 }}>Approve</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  headerTitle:   { fontSize: 22, fontWeight: '800' },
  headerSub:     { fontSize: 13, marginTop: 2 },
  notifBadge:    { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  applyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  tabBar:        { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem:       { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabDot:        { position: 'absolute', top: 8, right: '20%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },
  summaryCard:   { borderRadius: 20, padding: 24, marginBottom: 16 },
  leaveCard:     { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  leaveIcon:     { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  progressBg:    { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 4 },
  emptyState:    { borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  appCard:       { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
  ltBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusBadge:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  empAvatar:     { width: 44, height: 44, borderRadius: 22 },
  daysPill:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rejectBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  approveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
});

// import React, { useState, useEffect, useCallback } from 'react';
// import { Pressable } from 'react-native';
// import {
//   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
//   SafeAreaView, StatusBar, Alert, Image, RefreshControl, ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   RootState, AppDispatch,
//   fetchMyLeavesThunk, fetchAllLeavesThunk, fetchLeaveBalanceThunk,
//   updateLeaveStatusThunk, fetchEmployeesThunk, fetchNotificationsThunk,
// } from '../../store';
// import { LEAVE_TYPES } from '../../data/company';
// import { useTheme } from '../../hooks/useTheme';

// const STATUS_STYLE: Record<string, { color: string; bg: string; icon: any }> = {
//   approved: { color: '#4CAF50', bg: '#4CAF5020', icon: 'checkmark-circle' },
//   pending:  { color: '#FF9800', bg: '#FF980020', icon: 'time'             },
//   rejected: { color: '#F44336', bg: '#F4433620', icon: 'close-circle'     },
// };

// export default function LeaveScreen() {
//   const { isDark, theme } = useTheme();
//   const router   = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const currentUser    = useSelector((s: RootState) => s.auth.user);
//   const allEmployees   = useSelector((s: RootState) => s.employees.list);
//   const myApplications = useSelector((s: RootState) => s.leave.applications);
//   const serverAllApps  = useSelector((s: RootState) => s.leave.allApplications);
//   const balance        = useSelector((s: RootState) => s.leave.balance);
//   const leaveLoading   = useSelector((s: RootState) => s.leave.loading);
//   const unreadCount    = useSelector((s: RootState) => s.notif.unread);

//   const [tab,           setTab]           = useState<'balance' | 'history' | 'pending'>('balance');
//   const [refreshing,    setRefreshing]    = useState(false);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);

//   const canApprove = ['hr', 'manager', 'admin'].includes(currentUser?.role || '');

//   const loadAll = useCallback(() => {
//     dispatch(fetchLeaveBalanceThunk());
//     dispatch(fetchMyLeavesThunk());
//     dispatch(fetchEmployeesThunk());
//     dispatch(fetchNotificationsThunk());
//     if (canApprove) dispatch(fetchAllLeavesThunk());
//   }, [dispatch, canApprove]);

//   useEffect(() => { loadAll(); }, []);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     loadAll();
//     setTimeout(() => setRefreshing(false), 1200);
//   }, [loadAll]);

//   const pendingApprovals = canApprove
//     ? serverAllApps.filter((a: any) => a.status === 'pending')
//     : [];

//   const executeAction = async (
//     id: number,
//     empName: string,
//     status: 'approved' | 'rejected',
//     rejectionReason?: string
//   ) => {
//     setActionLoading(id);
//     try {
//       await dispatch(updateLeaveStatusThunk({ id, status, rejectionReason })).unwrap();
//       dispatch(fetchAllLeavesThunk());
//       dispatch(fetchMyLeavesThunk());
//       dispatch(fetchNotificationsThunk());
//       dispatch(fetchLeaveBalanceThunk());

//       if (Platform.OS === 'web') {
//         window.alert(`${empName}'s leave has been ${status}.`);
//       } else {
//         Alert.alert(
//           status === 'approved' ? '✅ Approved' : '❌ Rejected',
//           `${empName}'s leave has been ${status}.`,
//         );
//       }
//     } catch (err: any) {
//       const msg = err?.message || err || 'Failed to update leave status.';
//       if (Platform.OS === 'web') {
//         window.alert('Error: ' + msg);
//       } else {
//         Alert.alert('Error', msg);
//       }
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleAction = useCallback((id: number, empName: string, action: 'approved' | 'rejected') => {
//     // Web: Alert.alert is a no-op — use browser dialogs instead
//     if (Platform.OS === 'web') {
//       if (action === 'rejected') {
//         const reason = window.prompt(
//           `Reason for rejecting ${empName}'s leave:`,
//           'Rejected by manager'
//         );
//         if (reason === null) return; // user pressed Cancel
//         executeAction(id, empName, 'rejected', reason || 'Rejected by manager');
//       } else {
//         if (window.confirm(`Approve ${empName}'s leave request?`)) {
//           executeAction(id, empName, 'approved', undefined);
//         }
//       }
//       return;
//     }

//     // Native (iOS / Android)
//     if (action === 'rejected') {
//       if (Alert.prompt) {
//         Alert.prompt(
//           'Reject Leave',
//           `Reason for rejecting ${empName}'s leave:`,
//           [
//             {
//               text: 'Reject',
//               style: 'destructive',
//               onPress: (reason) => executeAction(id, empName, 'rejected', reason || 'Rejected by manager'),
//             },
//             { text: 'Cancel', style: 'cancel' },
//           ],
//           'plain-text',
//           'Rejected by manager'
//         );
//       } else {
//         Alert.alert(
//           'Reject Leave',
//           `Reject ${empName}'s leave request?`,
//           [
//             {
//               text: 'Reject',
//               style: 'destructive',
//               onPress: () => executeAction(id, empName, 'rejected', 'Rejected by manager'),
//             },
//             { text: 'Cancel', style: 'cancel' },
//           ]
//         );
//       }
//     } else {
//       Alert.alert(
//         'Approve Leave',
//         `Approve ${empName}'s leave request?`,
//         [
//           { text: 'Approve', onPress: () => executeAction(id, empName, 'approved', undefined) },
//           { text: 'Cancel', style: 'cancel' },
//         ]
//       );
//     }
//   }, []);

//   // const getLeaveType = (id: string) => LEAVE_TYPES.find(l => l.id === id?.toLowerCase());

//   const getLeaveType = (id: string) => LEAVE_TYPES.find(l => l.id.toUpperCase() === id?.toUpperCase());
//   const bg     = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt    = theme.text;
//   const sub    = theme.textSub;
//   const border = theme.border;

//   const tabs: { key: 'balance' | 'history' | 'pending'; label: string }[] = [
//     { key: 'balance', label: 'Balance' },
//     { key: 'history', label: 'My Leaves' },
//     ...(canApprove
//       ? [{ key: 'pending' as const, label: `Approvals${pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ''}` }]
//       : []),
//   ];

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

//       {/* Header */}
//       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFFFFF', '#F0F4FF']} style={s.header}>
//         <View>
//           <Text style={[s.headerTitle, { color: txt }]}>Leave</Text>
//           <Text style={[s.headerSub,   { color: sub }]}>Manage your leaves</Text>
//         </View>
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//           {unreadCount > 0 && (
//             <TouchableOpacity
//               style={[s.notifBadge, { backgroundColor: '#F44336' }]}
//               onPress={() => router.push('/screens/notifications' as any)}
//             >
//               <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>{unreadCount}</Text>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)}>
//             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.applyBtn}>
//               <Ionicons name="add" size={16} color="#000" />
//               <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Apply</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* Tabs */}
//       <View style={[s.tabBar, { backgroundColor: cardBg, borderBottomColor: border }]}>
//         {tabs.map(t => (
//           <TouchableOpacity
//             key={t.key}
//             style={[s.tabItem, tab === t.key && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
//             onPress={() => setTab(t.key)}
//           >
//             <Text style={{ color: tab === t.key ? '#F5A623' : sub, fontWeight: '700', fontSize: 13 }}>
//               {t.label}
//             </Text>
//             {t.key === 'pending' && pendingApprovals.length > 0 && (
//               <View style={s.tabDot} />
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" colors={['#F5A623']} />}
//       >
//         {/* ─── BALANCE TAB ─────────────────────────────── */}
//         {tab === 'balance' && (
//           <View style={{ padding: 16 }}>
//             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.summaryCard}>
//               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: '600' }}>Total Available Balance</Text>
//               <Text style={{ color: '#000', fontSize: 36, fontWeight: '900', marginVertical: 4 }}>
//                 {balance ? ((balance.CL || 0) + (balance.SL || 0) + (balance.EL || 0)) : '—'} days
//               </Text>
//               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>Casual + Sick + Earned remaining</Text>
//             </LinearGradient>

//             {!balance && leaveLoading && (
//               <ActivityIndicator color="#F5A623" style={{ marginTop: 20 }} />
//             )}

//             {LEAVE_TYPES.map(lt => {
//               // const balanceKey = lt.id.toUpperCase() as keyof typeof balance;
//               // const remaining  = balance ? (balance[balanceKey] ?? lt.total) : lt.total;
//               // const used       = lt.total > 0 ? Math.max(0, lt.total - remaining) : 0;
//               // const pct        = lt.total > 0 ? (remaining / lt.total) * 100 : 100;

//               const balanceKey = lt.id.toUpperCase() as keyof typeof balance;
//               const remaining  = balance ? (balance[balanceKey] ?? lt.annualLimit) : lt.annualLimit;
//               const used       = lt.annualLimit > 0 ? Math.max(0, lt.annualLimit - remaining) : 0;
//               const pct        = lt.annualLimit > 0 ? (remaining / lt.annualLimit) * 100 : 100;
//               return (
//                 <View key={lt.id} style={[s.leaveCard, { backgroundColor: cardBg, borderColor: border }]}>
//                   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
//                     <View style={[s.leaveIcon, { backgroundColor: lt.color + '20' }]}>
//                       <Ionicons name={lt.icon as any} size={20} color={lt.color} />
//                     </View>
//                     <View style={{ marginLeft: 10, flex: 1 }}>
//                       <Text style={{ color: txt, fontSize: 14, fontWeight: '700' }}>{lt.name}</Text>
//                       <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>{lt.description}</Text>
//                     </View>
//                     <View style={{ alignItems: 'flex-end' }}>
//                       <Text style={{ color: lt.color, fontSize: 22, fontWeight: '900' }}>
//                         {lt.id === 'lop' ? '∞' : remaining}
//                       </Text>
//                       <Text style={{ color: sub, fontSize: 10 }}>{lt.annualLimit > 0 ? `of ${lt.annualLimit}` : 'on demand'}</Text>
//                     </View>
//                   </View>
//                   {lt.annualLimit > 0 && (
//                     <>
//                       <View style={[s.progressBg, { backgroundColor: isDark ? '#2A2A40' : '#E0E6FF' }]}>
//                         <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: lt.color }]} />
//                       </View>
//                       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
//                         <Text style={{ color: sub, fontSize: 11 }}>Used: {used} days</Text>
//                         <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700' }}>{Math.round(pct)}% remaining</Text>
//                       </View>
//                     </>
//                   )}
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {/* ─── HISTORY TAB ─────────────────────────────── */}
//         {tab === 'history' && (
//           <View style={{ padding: 16 }}>
//             {leaveLoading && myApplications.length === 0 && (
//               <ActivityIndicator color="#F5A623" style={{ marginTop: 32 }} />
//             )}
//             {!leaveLoading && myApplications.length === 0 ? (
//               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
//                 <Ionicons name="calendar-outline" size={48} color={sub} />
//                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No leave applications yet</Text>
//                 <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)} style={{ marginTop: 16 }}>
//                   <LinearGradient colors={['#F5A623', '#E6940F']} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
//                     <Text style={{ color: '#000', fontWeight: '800' }}>Apply Now</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               myApplications.map((app: any) => {
//                 const lt = getLeaveType(app.leaveType);
//                 const ss = STATUS_STYLE[app.status?.toLowerCase()] || STATUS_STYLE.pending;
//                 return (
//                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: lt?.color || '#F5A623' }]}>
//                     <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//                       <View style={{ flex: 1 }}>
//                         <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '20' }]}>
//                           <Text style={{ color: lt?.color || '#888', fontSize: 11, fontWeight: '700' }}>
//                             {lt?.code || app.leaveType?.toUpperCase()} — {lt?.name || app.leaveType}
//                           </Text>
//                         </View>
//                         <Text style={{ color: txt, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
//                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
//                         </Text>
//                         <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>
//                           {app.days} day{app.days !== 1 ? 's' : ''} · Applied: {app.appliedOn}
//                         </Text>
//                         <Text style={{ color: sub, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>"{app.reason}"</Text>
//                         {app.status === 'approved' && (
//                           <Text style={{ color: '#4CAF50', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
//                             ✅ Approved{app.approvedByName ? ` by ${app.approvedByName}` : ''}
//                           </Text>
//                         )}
//                         {app.rejectionReason && (
//                           <Text style={{ color: '#F44336', fontSize: 11, marginTop: 4 }}>
//                             ❌ {app.rejectionReason}
//                           </Text>
//                         )}
//                       </View>
//                       <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
//                         <Ionicons name={ss.icon} size={12} color={ss.color} />
//                         <Text style={{ color: ss.color, fontSize: 11, fontWeight: '700', marginLeft: 4, textTransform: 'capitalize' }}>
//                           {app.status}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 );
//               })
//             )}
//           </View>
//         )}

//         {/* ─── PENDING APPROVALS TAB ───────────────────── */}
//         {tab === 'pending' && (
//           <View style={{ padding: 16 }}>
//             {pendingApprovals.length > 0 && (
//               <View style={[s.pendingBanner, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
//                 <Ionicons name="time-outline" size={18} color="#FF9800" />
//                 <Text style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
//                   {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
//                 </Text>
//               </View>
//             )}
//             {pendingApprovals.length === 0 ? (
//               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
//                 <Ionicons name="checkmark-done-circle-outline" size={48} color="#4CAF50" />
//                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>All caught up!</Text>
//                 <Text style={{ color: sub, fontSize: 13, marginTop: 4 }}>No pending leave approvals.</Text>
//               </View>
//             ) : (
//               pendingApprovals.map((app: any) => {
//                 const lt       = getLeaveType(app.leaveType);
//                 const emp      = allEmployees.find((e: any) => e.id === app.employeeId);
//                 const isActing = actionLoading === app.id;
//                 const empName  = app.employeeName || emp?.name || 'Employee';
//                 return (
//                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: '#FF9800' }]}>
//                     {/* Employee row */}
//                     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
//                       {emp?.avatar
//                         ? <Image source={{ uri: emp.avatar }} style={s.empAvatar} />
//                         : <View style={[s.empAvatar, { backgroundColor: '#F5A62330', justifyContent: 'center', alignItems: 'center' }]}>
//                             <Text style={{ color: '#F5A623', fontWeight: '900', fontSize: 18 }}>{empName[0]}</Text>
//                           </View>
//                       }
//                       <View style={{ flex: 1, marginLeft: 10 }}>
//                         <Text style={{ color: txt, fontSize: 15, fontWeight: '800' }}>{empName}</Text>
//                         <Text style={{ color: sub, fontSize: 11 }}>{app.employeeDesignation || emp?.designation}</Text>
//                       </View>
//                       <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '25' }]}>
//                         <Text style={{ color: lt?.color || '#888', fontSize: 12, fontWeight: '800' }}>
//                           {lt?.code || app.leaveType?.toUpperCase()}
//                         </Text>
//                       </View>
//                     </View>

//                     {/* Leave details */}
//                     <View style={{ backgroundColor: isDark ? '#1A1A2E' : '#F8FAFF', borderRadius: 10, padding: 12, marginBottom: 12 }}>
//                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
//                         <Ionicons name="calendar-outline" size={14} color={sub} />
//                         <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>
//                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
//                         </Text>
//                         <View style={[s.daysPill, { backgroundColor: '#FF980020' }]}>
//                           <Text style={{ color: '#FF9800', fontSize: 11, fontWeight: '700' }}>
//                             {app.days} day{app.days !== 1 ? 's' : ''}
//                           </Text>
//                         </View>
//                       </View>
//                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                         <Ionicons name="briefcase-outline" size={14} color={sub} />
//                         <Text style={{ color: sub, fontSize: 12 }}>{lt?.name || app.leaveType} Leave</Text>
//                       </View>
//                     </View>

//                     <Text style={{ color: sub, fontSize: 12, fontStyle: 'italic', marginBottom: 14, lineHeight: 18 }}>
//                       "{app.reason}"
//                     </Text>

//                     {/* Approve / Reject buttons */}
//                     {isActing ? (
//                       <View style={{ alignItems: 'center', paddingVertical: 12 }}>
//                         <ActivityIndicator color="#F5A623" />
//                         <Text style={{ color: sub, fontSize: 12, marginTop: 6 }}>Processing...</Text>
//                       </View>
//                     ) : (
//                       <View style={{ flexDirection: 'row', gap: 10 }}>
//                         {/* REJECT */}
//                         <TouchableOpacity
//                           style={[s.rejectBtn, { borderColor: '#F44336' }]}
//                           onPress={() => handleAction(app.id, empName, 'rejected')}
//                           activeOpacity={0.7}
//                         >
//                           <Ionicons name="close-circle-outline" size={16} color="#F44336" />
//                           <Text style={{ color: '#F44336', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Reject</Text>
//                         </TouchableOpacity>
//                         {/* APPROVE */}
//                         <TouchableOpacity
//                           style={{ flex: 2 }}
//                           onPress={() => handleAction(app.id, empName, 'approved')}
//                           activeOpacity={0.7}
//                         >
//                           <LinearGradient colors={['#4CAF50', '#2E7D32']} style={s.approveBtn}>
//                             <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
//                             <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13, marginLeft: 6 }}>Approve</Text>
//                           </LinearGradient>
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </View>
//                 );
//               })
//             )}
//           </View>
//         )}

//         <View style={{ height: 80 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
//   headerTitle:   { fontSize: 22, fontWeight: '800' },
//   headerSub:     { fontSize: 13, marginTop: 2 },
//   notifBadge:    { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
//   applyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
//   tabBar:        { flexDirection: 'row', borderBottomWidth: 1 },
//   tabItem:       { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
//   tabDot:        { position: 'absolute', top: 8, right: '20%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },
//   summaryCard:   { borderRadius: 20, padding: 24, marginBottom: 16 },
//   leaveCard:     { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
//   leaveIcon:     { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
//   progressBg:    { height: 8, borderRadius: 4, overflow: 'hidden' },
//   progressFill:  { height: '100%', borderRadius: 4 },
//   emptyState:    { borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
//   pendingBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
//   appCard:       { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
//   ltBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
//   statusBadge:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
//   empAvatar:     { width: 44, height: 44, borderRadius: 22 },
//   daysPill:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
//   rejectBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
//   approveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
// });

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { Pressable } from 'react-native';
// // import {
// //   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
// //   SafeAreaView, StatusBar, Alert, Image, RefreshControl, ActivityIndicator,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useSelector, useDispatch } from 'react-redux';
// // import {
// //   RootState, AppDispatch,
// //   fetchMyLeavesThunk, fetchAllLeavesThunk, fetchLeaveBalanceThunk,
// //   updateLeaveStatusThunk, fetchEmployeesThunk, fetchNotificationsThunk,
// // } from '../../store';
// // import { LEAVE_TYPES } from '../../data/company';
// // import { useTheme } from '../../hooks/useTheme';

// // const STATUS_STYLE: Record<string, { color: string; bg: string; icon: any }> = {
// //   approved: { color: '#4CAF50', bg: '#4CAF5020', icon: 'checkmark-circle' },
// //   pending:  { color: '#FF9800', bg: '#FF980020', icon: 'time'             },
// //   rejected: { color: '#F44336', bg: '#F4433620', icon: 'close-circle'     },
// // };

// // export default function LeaveScreen() {
// //   const { isDark, theme } = useTheme();
// //   const router   = useRouter();
// //   const dispatch = useDispatch<AppDispatch>();

// //   const currentUser    = useSelector((s: RootState) => s.auth.user);
// //   const allEmployees   = useSelector((s: RootState) => s.employees.list);
// //   const myApplications = useSelector((s: RootState) => s.leave.applications);
// //   const serverAllApps  = useSelector((s: RootState) => s.leave.allApplications);
// //   const balance        = useSelector((s: RootState) => s.leave.balance);
// //   const leaveLoading   = useSelector((s: RootState) => s.leave.loading);
// //   const unreadCount    = useSelector((s: RootState) => s.notif.unread);

// //   const [tab,           setTab]           = useState<'balance' | 'history' | 'pending'>('balance');
// //   const [refreshing,    setRefreshing]    = useState(false);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);

// //   // FIX: admin also needs to see all leaves, not just hr/manager
// //   const canApprove = ['hr', 'manager', 'admin'].includes(currentUser?.role || '');

// //   const loadAll = useCallback(() => {
// //     dispatch(fetchLeaveBalanceThunk());
// //     dispatch(fetchMyLeavesThunk());
// //     dispatch(fetchEmployeesThunk());
// //     dispatch(fetchNotificationsThunk());
// //     if (canApprove) {
// //       dispatch(fetchAllLeavesThunk());
// //     }
// //   }, [dispatch, canApprove]);

// //   useEffect(() => { loadAll(); }, []);

// //   const onRefresh = useCallback(async () => {
// //     setRefreshing(true);
// //     loadAll();
// //     setTimeout(() => setRefreshing(false), 1200);
// //   }, [loadAll]);

// //   const pendingApprovals = canApprove
// //     ? serverAllApps.filter((a: any) => a.status === 'pending')
// //     : [];

// //   // FIX: balance keys from backend are uppercase (CL, SL, EL...)
// //   // Default to 0 if not loaded yet — never use hardcoded fallbacks
// //   const balances = balance || {};

// //   // FIX: handleAction sends LOWERCASE status matching backend expectation
// //   const handleAction = useCallback((id: number, empName: string, action: 'approved' | 'rejected') => {
// //     const isApprove = action === 'approved';

// //     if (!isApprove) {
// //       // For rejection, ask for a reason
// //       Alert.prompt
// //         ? Alert.prompt(
// //             'Reject Leave',
// //             `Reason for rejecting ${empName}'s leave:`,
// //             [
// //               {
// //                 text: 'Reject',
// //                 style: 'destructive',
// //                 onPress: (reason) => executeAction(id, empName, 'rejected', reason || 'Rejected by manager'),
// //               },
// //               { text: 'Cancel', style: 'cancel' },
// //             ],
// //             'plain-text',
// //             'Rejected by manager'
// //           )
// //         : Alert.alert(
// //             'Reject Leave',
// //             `Reject ${empName}'s leave request?`,
// //             [
// //               {
// //                 text: 'Reject',
// //                 style: 'destructive',
// //                 onPress: () => executeAction(id, empName, 'rejected', 'Rejected by manager'),
// //               },
// //               { text: 'Cancel', style: 'cancel' },
// //             ]
// //           );
// //     } else {
// //       Alert.alert(
// //         'Approve Leave',
// //         `Approve ${empName}'s leave request?`,
// //         [
// //           {
// //             text: 'Approve',
// //             onPress: () => executeAction(id, empName, 'approved', undefined),
// //           },
// //           { text: 'Cancel', style: 'cancel' },
// //         ]
// //       );
// //     }
// //   }, []);

// //   const executeAction = async (
// //     id: number,
// //     empName: string,
// //     status: 'approved' | 'rejected',
// //     rejectionReason?: string
// //   ) => {
// //     setActionLoading(id);
// //     try {
// //       // FIX: send LOWERCASE status — backend expects 'approved'/'rejected' not 'Approved'/'Rejected'
// //       const res = await dispatch(updateLeaveStatusThunk({
// //         id,
// //         status,           // 'approved' or 'rejected' — lowercase
// //         rejectionReason,
// //       })).unwrap();

// //       // Refresh all data after action
// //       dispatch(fetchAllLeavesThunk());
// //       dispatch(fetchMyLeavesThunk());
// //       dispatch(fetchNotificationsThunk());
// //       dispatch(fetchLeaveBalanceThunk()); // balance changes when approved

// //       Alert.alert(
// //         status === 'approved' ? '✅ Approved' : '❌ Rejected',
// //         `${empName}'s leave has been ${status}.`,
// //       );
// //     } catch (err: any) {
// //       Alert.alert('Error', err?.message || err || 'Failed to update leave status.');
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const getLeaveType = (id: string) => LEAVE_TYPES.find(l => l.id === id?.toLowerCase());

// //   const bg     = theme.bg;
// //   const cardBg = theme.bgCard;
// //   const txt    = theme.text;
// //   const sub    = theme.textSub;
// //   const border = theme.border;

// //   const tabs: { key: 'balance' | 'history' | 'pending'; label: string }[] = [
// //     { key: 'balance', label: 'Balance' },
// //     { key: 'history', label: 'My Leaves' },
// //     ...(canApprove
// //       ? [{ key: 'pending' as const, label: `Approvals${pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ''}` }]
// //       : []),
// //   ];

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
// //       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

// //       {/* Header */}
// //       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFFFFF', '#F0F4FF']} style={s.header}>
// //         <View>
// //           <Text style={[s.headerTitle, { color: txt }]}>Leave</Text>
// //           <Text style={[s.headerSub,   { color: sub }]}>Manage your leaves</Text>
// //         </View>
// //         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
// //           {unreadCount > 0 && (
// //             <TouchableOpacity
// //               style={[s.notifBadge, { backgroundColor: '#F44336' }]}
// //               onPress={() => router.push('/screens/notifications' as any)}
// //             >
// //               <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>{unreadCount}</Text>
// //             </TouchableOpacity>
// //           )}
// //           <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)}>
// //             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.applyBtn}>
// //               <Ionicons name="add" size={16} color="#000" />
// //               <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Apply</Text>
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* Tabs */}
// //       <View style={[s.tabBar, { backgroundColor: cardBg, borderBottomColor: border }]}>
// //         {tabs.map(t => (
// //           <TouchableOpacity
// //             key={t.key}
// //             style={[s.tabItem, tab === t.key && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
// //             onPress={() => setTab(t.key)}
// //           >
// //             <Text style={{ color: tab === t.key ? '#F5A623' : sub, fontWeight: '700', fontSize: 13 }}>
// //               {t.label}
// //             </Text>
// //             {t.key === 'pending' && pendingApprovals.length > 0 && (
// //               <View style={s.tabDot} />
// //             )}
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView
// //         showsVerticalScrollIndicator={false}
// //         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" colors={['#F5A623']} />}
// //       >

// //         {/* ─── BALANCE TAB ─────────────────────────────── */}
// //         {tab === 'balance' && (
// //           <View style={{ padding: 16 }}>
// //             {/* Summary card */}
// //             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.summaryCard}>
// //               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: '600' }}>Total Available Balance</Text>
// //               <Text style={{ color: '#000', fontSize: 36, fontWeight: '900', marginVertical: 4 }}>
// //                 {balance ? ((balance.CL || 0) + (balance.SL || 0) + (balance.EL || 0)) : '—'} days
// //               </Text>
// //               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>Casual + Sick + Earned remaining</Text>
// //             </LinearGradient>

// //             {!balance && leaveLoading && (
// //               <ActivityIndicator color="#F5A623" style={{ marginTop: 20 }} />
// //             )}

// //             {LEAVE_TYPES.map(lt => {
// //               // FIX: balance keys are UPPERCASE from backend (CL, SL, EL, ML, PL, LOP)
// //               const balanceKey = lt.id.toUpperCase() as keyof typeof balance;
// //               const remaining = balance ? (balance[balanceKey] ?? lt.total) : lt.total;
// //               const used = lt.total > 0 ? Math.max(0, lt.total - remaining) : 0;
// //               const pct  = lt.total > 0 ? (remaining / lt.total) * 100 : 100;

// //               return (
// //                 <View key={lt.id} style={[s.leaveCard, { backgroundColor: cardBg, borderColor: border }]}>
// //                   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
// //                     <View style={[s.leaveIcon, { backgroundColor: lt.color + '20' }]}>
// //                       <Ionicons name={lt.icon as any} size={20} color={lt.color} />
// //                     </View>
// //                     <View style={{ marginLeft: 10, flex: 1 }}>
// //                       <Text style={{ color: txt, fontSize: 14, fontWeight: '700' }}>{lt.name}</Text>
// //                       <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>{lt.desc}</Text>
// //                     </View>
// //                     <View style={{ alignItems: 'flex-end' }}>
// //                       <Text style={{ color: lt.color, fontSize: 22, fontWeight: '900' }}>
// //                         {lt.id === 'lop' ? '∞' : remaining}
// //                       </Text>
// //                       <Text style={{ color: sub, fontSize: 10 }}>{lt.total > 0 ? `of ${lt.total}` : 'on demand'}</Text>
// //                     </View>
// //                   </View>
// //                   {lt.total > 0 && (
// //                     <>
// //                       <View style={[s.progressBg, { backgroundColor: isDark ? '#2A2A40' : '#E0E6FF' }]}>
// //                         <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: lt.color }]} />
// //                       </View>
// //                       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
// //                         <Text style={{ color: sub, fontSize: 11 }}>Used: {used} days</Text>
// //                         <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700' }}>{Math.round(pct)}% remaining</Text>
// //                       </View>
// //                     </>
// //                   )}
// //                 </View>
// //               );
// //             })}
// //           </View>
// //         )}

// //         {/* ─── HISTORY TAB ─────────────────────────────── */}
// //         {tab === 'history' && (
// //           <View style={{ padding: 16 }}>
// //             {leaveLoading && myApplications.length === 0 && (
// //               <ActivityIndicator color="#F5A623" style={{ marginTop: 32 }} />
// //             )}
// //             {!leaveLoading && myApplications.length === 0 ? (
// //               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
// //                 <Ionicons name="calendar-outline" size={48} color={sub} />
// //                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No leave applications yet</Text>
// //                 <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)} style={{ marginTop: 16 }}>
// //                   <LinearGradient colors={['#F5A623', '#E6940F']} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
// //                     <Text style={{ color: '#000', fontWeight: '800' }}>Apply Now</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>
// //               </View>
// //             ) : (
// //               myApplications.map((app: any) => {
// //                 const lt = getLeaveType(app.leaveType);
// //                 const ss = STATUS_STYLE[app.status?.toLowerCase()] || STATUS_STYLE.pending;
// //                 return (
// //                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: lt?.color || '#F5A623' }]}>
// //                     <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
// //                       <View style={{ flex: 1 }}>
// //                         <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '20' }]}>
// //                           <Text style={{ color: lt?.color || '#888', fontSize: 11, fontWeight: '700' }}>
// //                             {lt?.short || app.leaveType?.toUpperCase()} — {lt?.name || app.leaveType}
// //                           </Text>
// //                         </View>
// //                         <Text style={{ color: txt, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
// //                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
// //                         </Text>
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>
// //                           {app.days} day{app.days !== 1 ? 's' : ''} · Applied: {app.appliedOn}
// //                         </Text>
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>"{app.reason}"</Text>
// //                         {app.status === 'approved' && (
// //                           <Text style={{ color: '#4CAF50', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
// //                             ✅ Approved{app.approvedByName ? ` by ${app.approvedByName}` : ''}
// //                           </Text>
// //                         )}
// //                         {app.rejectionReason && (
// //                           <Text style={{ color: '#F44336', fontSize: 11, marginTop: 4 }}>
// //                             ❌ {app.rejectionReason}
// //                           </Text>
// //                         )}
// //                       </View>
// //                       <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
// //                         <Ionicons name={ss.icon} size={12} color={ss.color} />
// //                         <Text style={{ color: ss.color, fontSize: 11, fontWeight: '700', marginLeft: 4, textTransform: 'capitalize' }}>
// //                           {app.status}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                 );
// //               })
// //             )}
// //           </View>
// //         )}

// //         {/* ─── PENDING APPROVALS TAB ───────────────────── */}
// //         {tab === 'pending' && (
// //           <View style={{ padding: 16 }}>
// //             {pendingApprovals.length > 0 && (
// //               <View style={[s.pendingBanner, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
// //                 <Ionicons name="time-outline" size={18} color="#FF9800" />
// //                 <Text style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
// //                   {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
// //                 </Text>
// //               </View>
// //             )}
// //             {pendingApprovals.length === 0 ? (
// //               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
// //                 <Ionicons name="checkmark-done-circle-outline" size={48} color="#4CAF50" />
// //                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>All caught up!</Text>
// //                 <Text style={{ color: sub, fontSize: 13, marginTop: 4 }}>No pending leave approvals.</Text>
// //               </View>
// //             ) : (
// //               pendingApprovals.map((app: any) => {
// //                 const lt      = getLeaveType(app.leaveType);
// //                 const emp     = allEmployees.find((e: any) => e.id === app.employeeId);
// //                 const isActing = actionLoading === app.id;
// //                 const empName  = app.employeeName || emp?.name || 'Employee';
// //                 return (
// //                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: '#FF9800' }]}>
// //                     {/* Employee row */}
// //                     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
// //                       {emp?.avatar
// //                         ? <Image source={{ uri: emp.avatar }} style={s.empAvatar} />
// //                         : <View style={[s.empAvatar, { backgroundColor: '#F5A62330', justifyContent: 'center', alignItems: 'center' }]}>
// //                             <Text style={{ color: '#F5A623', fontWeight: '900', fontSize: 18 }}>{empName[0]}</Text>
// //                           </View>
// //                       }
// //                       <View style={{ flex: 1, marginLeft: 10 }}>
// //                         <Text style={{ color: txt, fontSize: 15, fontWeight: '800' }}>{empName}</Text>
// //                         <Text style={{ color: sub, fontSize: 11 }}>{app.employeeDesignation || emp?.designation}</Text>
// //                       </View>
// //                       <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '25' }]}>
// //                         <Text style={{ color: lt?.color || '#888', fontSize: 12, fontWeight: '800' }}>
// //                           {lt?.short || app.leaveType?.toUpperCase()}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     {/* Leave details */}
// //                     <View style={{ backgroundColor: isDark ? '#1A1A2E' : '#F8FAFF', borderRadius: 10, padding: 12, marginBottom: 12 }}>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
// //                         <Ionicons name="calendar-outline" size={14} color={sub} />
// //                         <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>
// //                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
// //                         </Text>
// //                         <View style={[s.daysPill, { backgroundColor: '#FF980020' }]}>
// //                           <Text style={{ color: '#FF9800', fontSize: 11, fontWeight: '700' }}>
// //                             {app.days} day{app.days !== 1 ? 's' : ''}
// //                           </Text>
// //                         </View>
// //                       </View>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
// //                         <Ionicons name="briefcase-outline" size={14} color={sub} />
// //                         <Text style={{ color: sub, fontSize: 12 }}>{lt?.name || app.leaveType} Leave</Text>
// //                       </View>
// //                     </View>

// //                     <Text style={{ color: sub, fontSize: 12, fontStyle: 'italic', marginBottom: 14, lineHeight: 18 }}>
// //                       "{app.reason}"
// //                     </Text>

// //                     {/* Approve / Reject buttons */}
// //                     {isActing ? (
// //                       <View style={{ alignItems: 'center', paddingVertical: 12 }}>
// //                         <ActivityIndicator color="#F5A623" />
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 6 }}>Processing...</Text>
// //                       </View>
// //                     ) : (
// //                       <View style={{ flexDirection: 'row', gap: 10 }}>
// //                         {/* REJECT */}
// //                         <TouchableOpacity
// //                           style={[s.rejectBtn, { borderColor: '#F44336' }]}
// //                           onPress={() => handleAction(app.id, empName, 'rejected')}
// //                           activeOpacity={0.7}
// //                         >
// //                           <Ionicons name="close-circle-outline" size={16} color="#F44336" />
// //                           <Text style={{ color: '#F44336', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Reject</Text>
// //                         </TouchableOpacity>

// //                         {/* APPROVE */}
// //                         <TouchableOpacity
// //                           style={{ flex: 2 }}
// //                           onPress={() => handleAction(app.id, empName, 'approved')}
// //                           activeOpacity={0.7}
// //                         >
// //                           <LinearGradient
// //                             colors={['#4CAF50', '#2E7D32']}
// //                             style={[s.approveBtn]}
// //                           >
// //                             <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
// //                             <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13, marginLeft: 6 }}>Approve</Text>
// //                           </LinearGradient>
// //                         </TouchableOpacity>
// //                       </View>
// //                     )}
// //                   </View>
// //                 );
// //               })
// //             )}
// //           </View>
// //         )}
// //         <View style={{ height: 80 }} />
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const s = StyleSheet.create({
// //   header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
// //   headerTitle:   { fontSize: 22, fontWeight: '800' },
// //   headerSub:     { fontSize: 13, marginTop: 2 },
// //   notifBadge:    { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
// //   applyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
// //   tabBar:        { flexDirection: 'row', borderBottomWidth: 1 },
// //   tabItem:       { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
// //   tabDot:        { position: 'absolute', top: 8, right: '20%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },
// //   summaryCard:   { borderRadius: 20, padding: 24, marginBottom: 16 },
// //   leaveCard:     { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
// //   leaveIcon:     { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
// //   progressBg:    { height: 8, borderRadius: 4, overflow: 'hidden' },
// //   progressFill:  { height: '100%', borderRadius: 4 },
// //   emptyState:    { borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
// //   pendingBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
// //   appCard:       { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
// //   ltBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
// //   statusBadge:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
// //   empAvatar:     { width: 44, height: 44, borderRadius: 22 },
// //   daysPill:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
// //   rejectBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
// //   approveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
// // });

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { Pressable } from 'react-native';
// // import {
// //   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
// //   SafeAreaView, StatusBar, Alert, Image, RefreshControl, ActivityIndicator,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useSelector, useDispatch } from 'react-redux';
// // import {
// //   RootState, AppDispatch,
// //   fetchMyLeavesThunk, fetchAllLeavesThunk, fetchLeaveBalanceThunk,
// //   updateLeaveStatusThunk, fetchEmployeesThunk, fetchNotificationsThunk,
// // } from '../../store';
// // import { LEAVE_TYPES } from '../../data/company';
// // import { useTheme } from '../../hooks/useTheme';

// // const STATUS_STYLE: Record<string, { color: string; bg: string; icon: any }> = {
// //   approved: { color: '#4CAF50', bg: '#4CAF5020', icon: 'checkmark-circle' },
// //   pending:  { color: '#FF9800', bg: '#FF980020', icon: 'time'             },
// //   rejected: { color: '#F44336', bg: '#F4433620', icon: 'close-circle'     },
// // };

// // export default function LeaveScreen() {
// //   const { isDark, theme } = useTheme();
// //   const router   = useRouter();
// //   const dispatch = useDispatch<AppDispatch>();

// //   const currentUser    = useSelector((s: RootState) => s.auth.user);
// //   const allEmployees   = useSelector((s: RootState) => s.employees.list);
// //   const myApplications = useSelector((s: RootState) => s.leave.applications);
// //   const serverAllApps  = useSelector((s: RootState) => s.leave.allApplications);
// //   const balance        = useSelector((s: RootState) => s.leave.balance);
// //   const leaveLoading   = useSelector((s: RootState) => s.leave.loading);
// //   const unreadCount    = useSelector((s: RootState) => s.notif.unread);

// //   const [tab,          setTab]          = useState<'balance' | 'history' | 'pending'>('balance');
// //   const [refreshing,   setRefreshing]   = useState(false);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);

// //   // const isHRorAdmin = currentUser?.role === 'hr' || currentUser?.role === 'admin';
// //   // const isManager   = currentUser?.role === 'manager';
// //   // const canApprove  = isHRorAdmin || isManager;

// // const isHR = currentUser?.role === 'hr';
// // const isManager = currentUser?.role === 'manager';

// // // const canApprove = isHR || isManager;
// // const canApprove = ['hr', 'manager'].includes(currentUser?.role || '');

// //   // ── Fix: pass undefined to satisfy RTK's generic typing ──────────────────
// // //   const loadAll = useCallback(() => {
// // //     dispatch(fetchLeaveBalanceThunk(undefined as any));
// // //     dispatch(fetchMyLeavesThunk(undefined as any));
// // //    dispatch(fetchEmployeesThunk(undefined as any));
// // // dispatch(fetchNotificationsThunk(undefined as any));
// // //    if (canApprove) dispatch(fetchAllLeavesThunk(undefined as any));
// // //   }, [dispatch, canApprove]);
// // const loadAll = useCallback(() => {
// //   dispatch(fetchLeaveBalanceThunk());
// //   dispatch(fetchMyLeavesThunk());
// //   dispatch(fetchEmployeesThunk());
// //   dispatch(fetchNotificationsThunk());

// //   if (canApprove) {
// //     dispatch(fetchAllLeavesThunk());
// //   }
// // }, [dispatch, canApprove]);

// //   useEffect(() => { loadAll(); }, []);

// //   const onRefresh = useCallback(async () => {
// //     setRefreshing(true);
// //     loadAll();
// //     setTimeout(() => setRefreshing(false), 1200);
// //   }, [loadAll]);

// //   const pendingApprovals = canApprove
// //     ? serverAllApps.filter((a: any) => a.status === 'pending')
// //     : [];

// //   const balances = balance || { CL: 12, SL: 12, EL: 15, ML: 180, PL: 15, LOP: 0 };

// // const handleAction = (id: number, empName: string, action: 'approved' | 'rejected') => {
// //   Alert.alert(
// //     action === 'approved' ? 'Approve Leave' : 'Reject Leave',
// //     `${action === 'approved' ? 'Approve' : 'Reject'} ${empName}'s leave request?`,
// //     [
// //       {
// //         text: action === 'approved' ? 'Approve' : 'Reject',
// //         onPress: async () => {
// //           setActionLoading(id);

// //           try {
// //             const res = await dispatch(updateLeaveStatusThunk({
// //               id,
// //               status: action.charAt(0).toUpperCase() + action.slice(1), // ✅ FIX
// //               rejectionReason: action === 'rejected' ? 'Rejected by manager' : undefined,
// //             })).unwrap();

// //             console.log("SUCCESS:", res); // ✅ debug

// //             dispatch(fetchAllLeavesThunk());
// //             dispatch(fetchMyLeavesThunk());
// //             dispatch(fetchNotificationsThunk());
// //             dispatch(fetchLeaveBalanceThunk());

// //             Alert.alert(
// //               action === 'approved' ? '✅ Approved' : '❌ Rejected',
// //               `${empName}'s leave has been ${action}.`,
// //             );

// //           } catch (err: any) {
// //             console.log("ERROR:", err);
// //             Alert.alert('Error', err?.message || 'Failed to update.');
// //           } finally {
// //             setActionLoading(null);
// //           }
// //         },
// //       },
// //       { text: 'Cancel', style: 'cancel' },
// //     ],
// //   );
// // };

// //   const getLeaveType = (id: string) => LEAVE_TYPES.find(l => l.id === id);

// //   const bg     = theme.bg;
// //   const cardBg = theme.bgCard;
// //   const txt    = theme.text;
// //   const sub    = theme.textSub;
// //   const border = theme.border;

// //   const tabs: { key: 'balance' | 'history' | 'pending'; label: string }[] = [
// //     { key: 'balance', label: 'Balance' },
// //     { key: 'history', label: 'My Leaves' },
// //     ...(canApprove
// //       ? [{ key: 'pending' as const, label: `Approvals${pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ''}` }]
// //       : []),
// //   ];

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
// //       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

// //       {/* Header */}
// //       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFFFFF', '#F0F4FF']} style={s.header}>
// //         <View>
// //           <Text style={[s.headerTitle, { color: txt }]}>Leave</Text>
// //           <Text style={[s.headerSub,   { color: sub }]}>Manage your leaves</Text>
// //         </View>
// //         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
// //           {unreadCount > 0 && (
// //             <TouchableOpacity
// //               style={[s.notifBadge, { backgroundColor: '#F44336' }]}
// //               onPress={() => router.push('/screens/notifications' as any)}
// //             >
// //               <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>{unreadCount}</Text>
// //             </TouchableOpacity>
// //           )}
// //           <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)}>
// //             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.applyBtn}>
// //               <Ionicons name="add" size={16} color="#000" />
// //               <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Apply</Text>
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* Tabs */}
// //       <View style={[s.tabBar, { backgroundColor: cardBg, borderBottomColor: border }]}>
// //         {tabs.map(t => (
// //           <TouchableOpacity
// //             key={t.key}
// //             style={[s.tabItem, tab === t.key && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
// //             onPress={() => setTab(t.key)}
// //           >
// //             <Text style={{ color: tab === t.key ? '#F5A623' : sub, fontWeight: '700', fontSize: 13 }}>
// //               {t.label}
// //             </Text>
// //             {t.key === 'pending' && pendingApprovals.length > 0 && (
// //               <View style={s.tabDot} />
// //             )}
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView
// //         showsVerticalScrollIndicator={false}
// //         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" colors={['#F5A623']} />}
// //       >

// //         {/* ─── BALANCE TAB ─────────────────────────────── */}
// //         {tab === 'balance' && (
// //           <View style={{ padding: 16 }}>
// //             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.summaryCard}>
// //               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: '600' }}>Total Available Balance</Text>
// //               <Text style={{ color: '#000', fontSize: 36, fontWeight: '900', marginVertical: 4 }}>
// //                 {(balances.CL || 0) + (balances.SL || 0) + (balances.EL || 0)} days
// //               </Text>
// //               <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>Casual + Sick + Earned remaining</Text>
// //             </LinearGradient>

// //             {LEAVE_TYPES.map(lt => {
// //               const remaining = (balances as any)[lt.id.toUpperCase()] ?? lt.total;
// //               const used      = lt.total > 0 ? lt.total - remaining : 0;
// //               const pct       = lt.total > 0 ? (remaining / lt.total) * 100 : 100;
// //               return (
// //                 <View key={lt.id} style={[s.leaveCard, { backgroundColor: cardBg, borderColor: border }]}>
// //                   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
// //                     <View style={[s.leaveIcon, { backgroundColor: lt.color + '20' }]}>
// //                       <Ionicons name={lt.icon as any} size={20} color={lt.color} />
// //                     </View>
// //                     <View style={{ marginLeft: 10, flex: 1 }}>
// //                       <Text style={{ color: txt, fontSize: 14, fontWeight: '700' }}>{lt.name}</Text>
// //                       <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>{lt.desc}</Text>
// //                     </View>
// //                     <View style={{ alignItems: 'flex-end' }}>
// //                       <Text style={{ color: lt.color, fontSize: 22, fontWeight: '900' }}>
// //                         {lt.id === 'lop' ? '∞' : remaining}
// //                       </Text>
// //                       <Text style={{ color: sub, fontSize: 10 }}>{lt.total > 0 ? `of ${lt.total}` : 'on demand'}</Text>
// //                     </View>
// //                   </View>
// //                   {lt.total > 0 && (
// //                     <>
// //                       <View style={[s.progressBg, { backgroundColor: isDark ? '#2A2A40' : '#E0E6FF' }]}>
// //                         <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: lt.color }]} />
// //                       </View>
// //                       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
// //                         <Text style={{ color: sub, fontSize: 11 }}>Used: {used} days</Text>
// //                         <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700' }}>{Math.round(pct)}% remaining</Text>
// //                       </View>
// //                     </>
// //                   )}
// //                 </View>
// //               );
// //             })}
// //           </View>
// //         )}

// //         {/* ─── HISTORY TAB ─────────────────────────────── */}
// //         {tab === 'history' && (
// //           <View style={{ padding: 16 }}>
// //             {leaveLoading && myApplications.length === 0 && (
// //               <ActivityIndicator color="#F5A623" style={{ marginTop: 32 }} />
// //             )}
// //             {!leaveLoading && myApplications.length === 0 ? (
// //               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
// //                 <Ionicons name="calendar-outline" size={48} color={sub} />
// //                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No leave applications yet</Text>
// //                 <TouchableOpacity onPress={() => router.push('/screens/apply-leave' as any)} style={{ marginTop: 16 }}>
// //                   <LinearGradient colors={['#F5A623', '#E6940F']} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
// //                     <Text style={{ color: '#000', fontWeight: '800' }}>Apply Now</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>
// //               </View>
// //             ) : (
// //               myApplications.map((app: any) => {
// //                 const lt = getLeaveType(app.leaveType);
// //                 const ss = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
// //                 return (
// //                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: lt?.color || '#F5A623' }]}>
// //                     <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
// //                       <View style={{ flex: 1 }}>
// //                         <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '20' }]}>
// //                           <Text style={{ color: lt?.color || '#888', fontSize: 11, fontWeight: '700' }}>
// //                             {lt?.short} — {lt?.name}
// //                           </Text>
// //                         </View>
// //                         <Text style={{ color: txt, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
// //                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
// //                         </Text>
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>
// //                           {app.days} day{app.days !== 1 ? 's' : ''} · Applied: {app.appliedOn}
// //                         </Text>
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>"{app.reason}"</Text>
// //                         {app.status === 'approved' && (
// //                           <Text style={{ color: '#4CAF50', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
// //                             ✅ Approved{app.approvedByName ? ` by ${app.approvedByName}` : ''}
// //                           </Text>
// //                         )}
// //                         {app.rejectionReason && (
// //                           <Text style={{ color: '#F44336', fontSize: 11, marginTop: 4 }}>
// //                             ❌ {app.rejectionReason}
// //                           </Text>
// //                         )}
// //                       </View>
// //                       <View style={[s.statusBadge, { backgroundColor: ss.bg }]}>
// //                         <Ionicons name={ss.icon} size={12} color={ss.color} />
// //                         <Text style={{ color: ss.color, fontSize: 11, fontWeight: '700', marginLeft: 4, textTransform: 'capitalize' }}>
// //                           {app.status}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                 );
// //               })
// //             )}
// //           </View>
// //         )}

// //         {/* ─── PENDING APPROVALS TAB ───────────────────── */}
// //         {tab === 'pending' && (
// //           <View style={{ padding: 16 }}>
// //             {pendingApprovals.length > 0 && (
// //               <View style={[s.pendingBanner, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
// //                 <Ionicons name="time-outline" size={18} color="#FF9800" />
// //                 <Text style={{ color: '#FF9800', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
// //                   {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
// //                 </Text>
// //               </View>
// //             )}
// //             {pendingApprovals.length === 0 ? (
// //               <View style={[s.emptyState, { backgroundColor: cardBg }]}>
// //                 <Ionicons name="checkmark-done-circle-outline" size={48} color="#4CAF50" />
// //                 <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>All caught up!</Text>
// //                 <Text style={{ color: sub, fontSize: 13, marginTop: 4 }}>No pending leave approvals.</Text>
// //               </View>
// //             ) : (
// //               pendingApprovals.map((app: any) => {
// //                 const lt        = getLeaveType(app.leaveType);
// //                 const emp       = allEmployees.find((e: any) => e.id === app.employeeId);
// //                 const isActing  = actionLoading === app.id;
// //                 const empName   = app.employeeName || emp?.name || 'Employee';
// //                 return (
// //                   <View key={app.id} style={[s.appCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: '#FF9800' }]}>
// //                     {/* Employee row */}
// //                     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
// //                       {emp?.avatar
// //                         ? <Image source={{ uri: emp.avatar }} style={s.empAvatar} />
// //                         : <View style={[s.empAvatar, { backgroundColor: '#F5A62330', justifyContent: 'center', alignItems: 'center' }]}>
// //                             <Text style={{ color: '#F5A623', fontWeight: '900', fontSize: 18 }}>{empName[0]}</Text>
// //                           </View>
// //                       }
// //                       <View style={{ flex: 1, marginLeft: 10 }}>
// //                         <Text style={{ color: txt, fontSize: 15, fontWeight: '800' }}>{empName}</Text>
// //                         <Text style={{ color: sub, fontSize: 11 }}>{app.employeeDesignation || emp?.designation}</Text>
// //                       </View>
// //                       <View style={[s.ltBadge, { backgroundColor: (lt?.color || '#888') + '25' }]}>
// //                         <Text style={{ color: lt?.color || '#888', fontSize: 12, fontWeight: '800' }}>
// //                           {lt?.short || app.leaveType?.toUpperCase()}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     {/* Leave details box */}
// //                     <View style={{ backgroundColor: isDark ? '#1A1A2E' : '#F8FAFF', borderRadius: 10, padding: 12, marginBottom: 12 }}>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
// //                         <Ionicons name="calendar-outline" size={14} color={sub} />
// //                         <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>
// //                           {app.fromDate}{app.fromDate !== app.toDate ? ` → ${app.toDate}` : ''}
// //                         </Text>
// //                         <View style={[s.daysPill, { backgroundColor: '#FF980020' }]}>
// //                           <Text style={{ color: '#FF9800', fontSize: 11, fontWeight: '700' }}>
// //                             {app.days} day{app.days !== 1 ? 's' : ''}
// //                           </Text>
// //                         </View>
// //                       </View>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
// //                         <Ionicons name="briefcase-outline" size={14} color={sub} />
// //                         <Text style={{ color: sub, fontSize: 12 }}>{lt?.name} ({lt?.short})</Text>
// //                       </View>
// //                     </View>

// //                     <Text style={{ color: sub, fontSize: 12, fontStyle: 'italic', marginBottom: 14, lineHeight: 18 }}>
// //                       "{app.reason}"
// //                     </Text>

// //                     {/* Approve / Reject buttons */}
// //                     {isActing ? (
// //                       <View style={{ alignItems: 'center', paddingVertical: 12 }}>
// //                         <ActivityIndicator color="#F5A623" />
// //                         <Text style={{ color: sub, fontSize: 12, marginTop: 6 }}>Processing...</Text>
// //                       </View>
// //                     ) : (
// //                       <View style={{ flexDirection: 'row', gap: 10 }}>

// //   {/* ❌ REJECT BUTTON */}
// //  <Pressable
// //   style={[s.rejectBtn, { borderColor: '#F44336' }]}
// //   onPress={() => {
// //     console.log("REJECT CLICKED"); // ✅ MUST show
// //     handleAction(app.id, empName, 'rejected');
// //   }}
// // >
// //   <Ionicons name="close-circle-outline" size={16} color="#F44336" />
// //   <Text style={{ color: '#F44336', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>
// //     Reject
// //   </Text>
// // </Pressable>

// //   {/* ✅ APPROVE BUTTON (FIXED) */}
// // <LinearGradient
// //   colors={['#4CAF50', '#2E7D32']}
// //   style={[s.approveBtn, { flex: 2 }]}
// // >
// //   <Pressable
// //     style={{
// //       flex: 1,
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       paddingVertical: 12
// //     }}
// //     onPress={() => {
// //       console.log("APPROVE CLICKED"); // ✅ MUST show
// //       handleAction(app.id, empName, 'approved');
// //     }}
// //   >
// //     <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
// //     <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13, marginLeft: 6 }}>
// //       Approve
// //     </Text>
// //   </Pressable>
// // </LinearGradient>
// // </View>
// //                     )}
// //                   </View>
// //                 );
// //               })
// //             )}
// //           </View>
// //         )}
// //         <View style={{ height: 80 }} />
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const s = StyleSheet.create({
// //   header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
// //   headerTitle:   { fontSize: 22, fontWeight: '800' },
// //   headerSub:     { fontSize: 13, marginTop: 2 },
// //   notifBadge:    { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
// //   applyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
// //   tabBar:        { flexDirection: 'row', borderBottomWidth: 1 },
// //   tabItem:       { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
// //   tabDot:        { position: 'absolute', top: 8, right: '20%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },
// //   summaryCard:   { borderRadius: 20, padding: 24, marginBottom: 16 },
// //   leaveCard:     { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
// //   leaveIcon:     { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
// //   progressBg:    { height: 8, borderRadius: 4, overflow: 'hidden' },
// //   progressFill:  { height: '100%', borderRadius: 4 },
// //   emptyState:    { borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
// //   pendingBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
// //   appCard:       { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
// //   ltBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
// //   statusBadge:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
// //   empAvatar:     { width: 44, height: 44, borderRadius: 22 },
// //   daysPill:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
// //   rejectBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
// //   approveBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
// // });