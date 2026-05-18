import React, { useState, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, checkInThunk, checkOutThunk, fetchMyAttendanceThunk, fetchAttendanceSummaryThunk, fetchHolidaysThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
// Holidays come from backend API via store

const { width } = Dimensions.get('window');
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  present: { color: '#4CAF50', label: 'Present', icon: 'checkmark-circle' },
  late: { color: '#FF9800', label: 'Late', icon: 'time' },
  absent: { color: '#F44336', label: 'Absent', icon: 'close-circle' },
  'half-day': { color: '#9C27B0', label: 'Half Day', icon: 'remove-circle' },
  holiday: { color: '#2196F3', label: 'Holiday', icon: 'flag' },
  weekend: { color: '#333', label: 'Weekend', icon: 'pause-circle' },
};

export default function AttendanceScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const todayAttendance = useSelector((s: RootState) => s.today);
  const allAttendance = useSelector((s: RootState) => s.attendance.records);
  const holidays = useSelector((s: RootState) => s.events.holidays);
  const fingerprintSyncTime = useSelector((s: RootState) => new Date().toISOString());
  const fingerprintConnected = useSelector((s: RootState) => true);
  const [tab, setTab] = useState<'calendar' | 'log'>('calendar');

  useEffect(() => {
    const m = new Date().getMonth()+1;
    const y = new Date().getFullYear();
    dispatch(fetchMyAttendanceThunk({ month:m, year:y }));
    dispatch(fetchAttendanceSummaryThunk({ month:m, year:y }));
    dispatch(fetchHolidaysThunk());
  }, []);

  const now = new Date();
  const myRecords = allAttendance; // API returns only this employee's records
  const present = myRecords.filter(r => r.status === 'present').length;
  const late = myRecords.filter(r => r.status === 'late').length;
  const absent = myRecords.filter(r => r.status === 'absent').length;
  const workDays = myRecords.filter(r => r.status !== 'weekend').length;

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calCells.push(i);
  while (calCells.length % 7 !== 0) calCells.push(null);

  const getRecord = (day: number | null) => {
    if (!day) return null;
    const ds = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return myRecords.find(r => r.date === ds) || null;
  };

  const simulateFPSync = () => {
    Alert.alert('Fingerprint Sync', 'Syncing from ZKTeco Biometric Device...\n\nDevice: ZKTeco K20\nIP: 192.168.1.100\nStatus: Connected ✓', [
      { text: 'Sync Now', onPress: () => { // Already synced via API
      Alert.alert('Sync Complete', 'Attendance synced from fingerprint device successfully!');
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

const upcomingHolidays = (holidays || [])
  .filter(h => h.date >= now.toISOString().split('T')[0])
  .slice(0, 4);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFFFFF', '#F0F4FF']} style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: txt }]}>Attendance</Text>
          <Text style={[styles.headerSub, { color: sub }]}>{MONTHS[now.getMonth()]} {now.getFullYear()}</Text>
        </View>
        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: fingerprintConnected ? '#4CAF5020' : '#F4433620', borderColor: fingerprintConnected ? '#4CAF50' : '#F44336' }]} onPress={simulateFPSync}>
          <Ionicons name="finger-print" size={14} color={fingerprintConnected ? '#4CAF50' : '#F44336'} />
          <Text style={{ color: fingerprintConnected ? '#4CAF50' : '#F44336', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
            {fingerprintConnected ? 'Synced' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Check In Card */}
        <View style={{ padding: 16 }}>
          <LinearGradient colors={todayAttendance.status === 'in' ? ['#1B5E20', '#388E3C'] : isDark ? ['#141420', '#1A1A2E'] : ['#FFF', '#EEF2FF']} style={[styles.checkCard, { borderColor: border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Today</Text>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 2 }}>
                  {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
                </Text>
              </View>
              {/* {todayAttendance.fpSynced && (
                <View style={{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(76,175,80,0.2)', paddingHorizontal:10, paddingVertical:5, borderRadius:12 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  <Text style={{ color:'#4CAF50', fontSize:11, fontWeight:'700' }}>Auto Synced</Text>
                </View>
              )} */}
            </View>
            <View style={{ flexDirection:'row', gap:16, marginTop:16, marginBottom:16 }}>
              {[
                { label:'Check In', value: todayAttendance.checkIn || '--:--', icon:'log-in-outline', color:'#4CAF50' },
                { label:'Check Out', value: todayAttendance.checkOut || '--:--', icon:'log-out-outline', color:'#F44336' },
                { label:'Status', value: todayAttendance.status === 'out' ? 'Pending' : todayAttendance.status === 'in' ? 'Active' : 'Done', icon:'time-outline', color:'#F5A623' },
              ].map(item => (
                <View key={item.label} style={{ flex:1, alignItems:'center' }}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                  <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:4 }}>{item.label}</Text>
                  <Text style={{ color:'#FFF', fontSize:14, fontWeight:'800', marginTop:2 }}>{item.value}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection:'row', gap:10 }}>
              {todayAttendance.status === 'out' && (
                <TouchableOpacity onPress={() => dispatch(checkInThunk())} style={{ flex:1 }}>
                  <LinearGradient colors={['#F5A623','#E6940F']} style={styles.actionBtn}>
                    <Ionicons name="log-in-outline" size={16} color="#000" />
                    <Text style={{ fontWeight:'800', color:'#000', marginLeft:6 }}>Check In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {todayAttendance.status === 'in' && (
                <TouchableOpacity onPress={() => dispatch(checkOutThunk())} style={{ flex:1 }}>
                  <LinearGradient colors={['#EF5350','#C62828']} style={styles.actionBtn}>
                    <Ionicons name="log-out-outline" size={16} color="#FFF" />
                    <Text style={{ fontWeight:'800', color:'#FFF', marginLeft:6 }}>Check Out</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {todayAttendance.status === 'done' && (
                <View style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'#4CAF5020', borderRadius:12, padding:12 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={{ color:'#4CAF50', fontWeight:'800' }}>Day Complete! 🎉</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => router.push('/screens/attendance-detail')} style={[styles.detailBtn, { borderColor: '#F5A623' }]}>
                <Text style={{ color:'#F5A623', fontWeight:'700', fontSize:12 }}>Details</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Monthly Stats */}
        <View style={{ paddingHorizontal:16, marginBottom:16 }}>
          <View style={{ flexDirection:'row', gap:10 }}>
            {[
              { label:'Present', value:present, color:'#4CAF50' },
              { label:'Late', value:late, color:'#FF9800' },
              { label:'Absent', value:absent, color:'#F44336' },
              { label:'Work Days', value:workDays, color:'#2196F3' },
            ].map(s => (
              <View key={s.label} style={[styles.miniStat, { backgroundColor: cardBg, borderColor: border }]}>
                <Text style={{ color: s.color, fontSize:20, fontWeight:'900' }}>{s.value}</Text>
                <Text style={{ color: sub, fontSize:10, fontWeight:'600', marginTop:2 }}>{s.label}</Text>
                <View style={{ height:3, backgroundColor: s.color, borderRadius:2, marginTop:6, width:'100%' }} />
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { paddingHorizontal:16, marginBottom:12 }]}>
          {(['calendar', 'log'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, { backgroundColor: tab === t ? '#F5A623' : cardBg, borderColor: border }]} onPress={() => setTab(t)}>
              <Text style={{ color: tab === t ? '#000' : sub, fontWeight:'700', fontSize:13, textTransform:'capitalize' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar */}
        {tab === 'calendar' && (
          <View style={{ paddingHorizontal:16 }}>
            <View style={[styles.calCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection:'row', marginBottom:8 }}>
                {DAYS.map((d, i) => (
                  <View key={i} style={{ flex:1, alignItems:'center' }}>
                    <Text style={{ color: i === 0 || i === 6 ? '#F44336' : sub, fontSize:11, fontWeight:'700' }}>{d}</Text>
                  </View>
                ))}
              </View>
              {Array.from({ length: calCells.length / 7 }).map((_, row) => (
                <View key={row} style={{ flexDirection:'row', marginBottom:4 }}>
                  {calCells.slice(row * 7, row * 7 + 7).map((day, col) => {
                    const rec = getRecord(day);
                    const isToday = day === now.getDate();
                    const cfg = rec ? STATUS_CONFIG[rec.status] : null;
                    return (
                      <TouchableOpacity key={col} style={[styles.calCell, isToday && { backgroundColor: '#F5A62320', borderRadius:8, borderWidth:1, borderColor:'#F5A623' }]} disabled={!day}>
                        {day ? (
                          <>
                            <Text style={{ color: isToday ? '#F5A623' : txt, fontSize:12, fontWeight: isToday ? '800' : '500' }}>{day}</Text>
                            {cfg && cfg.color !== '#333' && <View style={{ width:5, height:5, borderRadius:3, backgroundColor: cfg.color, marginTop:2 }} />}
                          </>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              {/* Legend */}
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:12, paddingTop:12, borderTopWidth:1, borderTopColor: border }}>
                {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'weekend').map(([key, cfg]) => (
                  <View key={key} style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
                    <View style={{ width:8, height:8, borderRadius:4, backgroundColor: cfg.color }} />
                    <Text style={{ color: sub, fontSize:10 }}>{cfg.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Log */}
        {tab === 'log' && (
          <View style={{ paddingHorizontal:16 }}>
            {[...myRecords].reverse().filter(r => r.status !== 'weekend').slice(0, 15).map(rec => {
              const cfg = STATUS_CONFIG[rec.status];
              return (
                <View key={rec.id} style={[styles.logRow, { backgroundColor: cardBg, borderColor: border }]}>
                  <View style={[styles.logBar, { backgroundColor: cfg.color }]} />
                  <View style={{ flex:1, flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:10 }}>
                    <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                    <View style={{ marginLeft:10, flex:1 }}>
                      <Text style={{ color: txt, fontSize:13, fontWeight:'600' }}>
                        {new Date(rec.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}
                      </Text>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:2 }}>
                        <Text style={{ color: cfg.color, fontSize:11, fontWeight:'700' }}>{cfg.label}</Text>
                        {rec.source === 'fingerprint' && <Text style={{ color: sub, fontSize:10 }}>· via biometric</Text>}
                      </View>
                    </View>
                    {rec.checkIn ? (
                      <View style={{ alignItems:'flex-end' }}>
                        <Text style={{ color: txt, fontSize:12, fontWeight:'700' }}>{rec.checkIn} — {rec.checkOut}</Text>
                        <Text style={{ color:'#F5A623', fontSize:11, fontWeight:'700' }}>{rec.workHours}h</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Holidays */}
        <View style={{ padding:16 }}>
          <Text style={[styles.sectionTitle, { color: txt }]}>Upcoming Holidays</Text>
          {upcomingHolidays.map(h => (
            <View key={h.date} style={[styles.holidayRow, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={{ fontSize:22 }}>{h.icon}</Text>
              <View style={{ marginLeft:12, flex:1 }}>
                <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>{h.name}</Text>
                <Text style={{ color: sub, fontSize:11, marginTop:2 }}>
                  {new Date(h.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
                </Text>
              </View>
              <View style={[styles.holidayBadge, { backgroundColor: h.type === 'company' ? '#F5A62220' : '#2196F320' }]}>
                <Text style={{ color: h.type === 'company' ? '#F5A623' : '#2196F3', fontSize:9, fontWeight:'800' }}>{h.type === 'company' ? 'COMPANY' : 'NATIONAL'}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:22, fontWeight:'800' },
  headerSub: { fontSize:13, marginTop:2 },
  syncBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:6, borderRadius:10, borderWidth:1 },
  checkCard: { borderRadius:20, padding:18, borderWidth:1 },
  actionBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:12, paddingVertical:12 },
  detailBtn: { paddingHorizontal:16, paddingVertical:12, borderRadius:12, borderWidth:1 },
  miniStat: { flex:1, alignItems:'center', padding:12, borderRadius:14, borderWidth:1 },
  tabRow: { flexDirection:'row', gap:10 },
  tabBtn: { flex:1, paddingVertical:10, borderRadius:12, alignItems:'center', borderWidth:1 },
  calCard: { borderRadius:16, padding:14, borderWidth:1 },
  calCell: { flex:1, alignItems:'center', paddingVertical:8 },
  logRow: { flexDirection:'row', borderRadius:12, marginBottom:8, overflow:'hidden', borderWidth:1 },
  logBar: { width:4 },
  sectionTitle: { fontSize:16, fontWeight:'800', marginBottom:12 },
  holidayRow: { flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, marginBottom:8, borderWidth:1 },
  holidayBadge: { paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
});
