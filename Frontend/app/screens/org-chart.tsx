import React, { useState, useEffect } from 'react';
import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchEmployeesThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';

const ROLE_COLORS: Record<string, string> = { admin:'#F5A623', hr:'#E91E63', manager:'#2196F3', employee:'#4CAF50' };

export default function OrgChartScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => { dispatch(fetchEmployeesThunk()); }, []);
  const allEmployees = useSelector((s: RootState) => s.employees.list);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const toggle = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const getReports = (id: any) => allEmployees.filter((e:any) => e.reportingToId === id || e.reportingToId === Number(id));

  const NodeCard = ({ empId, depth = 0 }: { empId: string; depth?: number }) => {
    const emp = allEmployees.find((e:any) => e.id === empId || String(e.id) === String(empId));
    if (!emp) return null;
    const reports = getReports(emp.id);
    const isExpanded = expanded[emp.id] !== false && depth < 2; // auto expand first 2 levels
    const roleColor = ROLE_COLORS[emp.role] || '#888';
    return (
      <View style={{ marginLeft: depth > 0 ? 24 : 0 }}>
        {depth > 0 && <View style={[styles.connector, { backgroundColor: border }]} />}
        <TouchableOpacity style={[styles.nodeCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: roleColor, borderLeftWidth: 3 }]} onPress={() => router.push(('/screens/employee-detail?id='+emp.id) as any)} activeOpacity={0.8}>
          <Image source={{ uri: emp.avatar }} style={[styles.nodeAvatar, { opacity: emp.isActive ? 1 : 0.5 }]} />
          <View style={{ flex:1, marginLeft:10 }}>
            <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>{emp.name}</Text>
            <Text style={{ color: sub, fontSize:11, marginTop:1 }}>{emp.designation}</Text>
          </View>
          <View style={{ alignItems:'flex-end', gap:4 }}>
            <View style={[styles.roleBadge, { backgroundColor: roleColor+'20' }]}>
              <Text style={{ color: roleColor, fontSize:9, fontWeight:'800' }}>{emp.role.toUpperCase()}</Text>
            </View>
            {reports.length > 0 && (
              <TouchableOpacity onPress={() => toggle(emp.id)} style={[styles.expandBtn, { backgroundColor: border }]}>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={12} color={sub} />
                <Text style={{ color: sub, fontSize:10, marginLeft:2 }}>{reports.length}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        {isExpanded && reports.map(r => <NodeCard key={r.id} empId={r.id} depth={depth+1} />)}
      </View>
    );
  };

  const roots = allEmployees.filter((e:any) => !e.reportingToId);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFF','#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} /></TouchableOpacity>
        <View style={{ marginLeft:12 }}>
          <Text style={[styles.headerTitle, { color: txt }]}>Organization Chart</Text>
          <Text style={[styles.headerSub, { color: sub }]}>{allEmployees.length} members</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding:16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <View key={role} style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
              <View style={{ width:10, height:10, borderRadius:2, backgroundColor: color }} />
              <Text style={{ color: sub, fontSize:11, textTransform:'capitalize' }}>{role}</Text>
            </View>
          ))}
        </View>
        {roots.map(e => <NodeCard key={e.id} empId={e.id} />)}
        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:20, fontWeight:'800' },
  headerSub: { fontSize:12, marginTop:2 },
  nodeCard: { flexDirection:'row', alignItems:'center', borderRadius:12, padding:12, marginBottom:6, borderWidth:1 },
  nodeAvatar: { width:40, height:40, borderRadius:20 },
  roleBadge: { paddingHorizontal:6, paddingVertical:3, borderRadius:6 },
  expandBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:6, paddingVertical:3, borderRadius:6 },
  connector: { width:2, height:12, marginLeft:20, marginBottom:0 },
});
