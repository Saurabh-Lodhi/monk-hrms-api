import React, { useEffect } from 'react';
import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchMyAttendanceThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  present: { color:'#4CAF50', label:'Present', icon:'checkmark-circle' },
  late: { color:'#FF9800', label:'Late', icon:'time' },
  absent: { color:'#F44336', label:'Absent', icon:'close-circle' },
  'half-day': { color:'#9C27B0', label:'Half Day', icon:'remove-circle' },
  holiday: { color:'#2196F3', label:'Holiday', icon:'flag' },
  weekend: { color:'#3A3A55', label:'Weekend', icon:'pause-circle' },
};

export default function AttendanceDetailScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const myRecords = [...useSelector((s: RootState) => s.attendance.records)].reverse();

  useEffect(() => {
    dispatch(fetchMyAttendanceThunk({}));
  }, []);

  const present = myRecords.filter(r => r.status === 'present').length;
  const late = myRecords.filter(r => r.status === 'late').length;
  const absent = myRecords.filter(r => r.status === 'absent').length;
  const workHoursTotal = myRecords.reduce((sum, r) => sum + parseFloat(r.workHours || '0'), 0);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFF','#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} /></TouchableOpacity>
        <View style={{ marginLeft:12 }}>
          <Text style={[styles.headerTitle, { color: txt }]}>Attendance Log</Text>
          <Text style={[styles.headerSub, { color: sub }]}>{currentUser?.name}</Text>
        </View>
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={{ flexDirection:'row', flexWrap:'wrap', padding:16, gap:10 }}>
          {[
            { label:'Present', value:present, color:'#4CAF50', icon:'checkmark-circle' },
            { label:'Late', value:late, color:'#FF9800', icon:'time' },
            { label:'Absent', value:absent, color:'#F44336', icon:'close-circle' },
            { label:'Work Hours', value:Math.round(workHoursTotal)+'h', color:'#2196F3', icon:'timer' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
              <Text style={{ color: s.color, fontSize:20, fontWeight:'900', marginTop:6 }}>{s.value}</Text>
              <Text style={{ color: sub, fontSize:10, fontWeight:'600', marginTop:2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal:16, gap:8 }}>
          {myRecords.filter(r => r.status !== 'weekend').map(rec => {
            const cfg = STATUS_CONFIG[rec.status];
            return (
              <View key={rec.id||rec.date} style={[styles.logRow, { backgroundColor: cardBg, borderColor: border, borderLeftColor: cfg.color }]}>
                <Ionicons name={cfg.icon as any} size={18} color={cfg.color} style={{ marginRight:10 }} />
                <View style={{ flex:1 }}>
                  <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>
                    {new Date(rec.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}
                  </Text>
                  <Text style={{ color: cfg.color, fontSize:11, fontWeight:'700', marginTop:2 }}>{cfg.label}</Text>
                </View>
                {rec.checkIn ? <View style={{ alignItems:'flex-end' }}>
                  <Text style={{ color: txt, fontSize:12, fontWeight:'600' }}>{rec.checkIn} — {rec.checkOut}</Text>
                  <Text style={{ color:'#F5A623', fontSize:11, fontWeight:'700', marginTop:2 }}>{rec.workHours}h</Text>
                </View> : null}
              </View>
            );
          })}
        </View>
        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:20, fontWeight:'800' },
  headerSub: { fontSize:12, marginTop:2 },
  statCard: { width:'47%', alignItems:'center', padding:16, borderRadius:16, borderWidth:1 },
  logRow: { flexDirection:'row', alignItems:'center', borderRadius:12, padding:14, borderWidth:1, borderLeftWidth:4 },
});
