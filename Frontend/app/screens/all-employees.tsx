import React, { useState, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchEmployeesThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { DEPARTMENTS, COMPANIES } from '../../data/company';

const ROLES = ['all', 'admin', 'hr', 'manager', 'employee'];
const COMPANIES_FILTER = ['all', 'monk-outsourcing', 'monk-travel-tech'];

export default function AllEmployeesScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, []);
  const allEmployees = useSelector((s: RootState) => s.employees.list);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const canSeeAll = currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'manager';

  const filtered = allEmployees.filter(emp => {
    const matchSearch = search === '' || emp.name.toLowerCase().includes(search.toLowerCase()) || emp.designation.toLowerCase().includes(search.toLowerCase()) || (emp.employeeCode||'').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchCompany = companyFilter === 'all' || emp.company === companyFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? emp.isActive : !emp.isActive);
    return matchSearch && matchRole && matchCompany && matchStatus;
  });

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const Chip = ({ label, active, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: active ? '#F5A623' : (isDark ? '#1E1E2E' : '#F0F4FF'), borderColor: active ? '#F5A623' : border }]}>
      <Text style={{ color: active ? '#000' : sub, fontSize:12, fontWeight:'700' }}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item: emp }: any) => {
    const dept = DEPARTMENTS.find(d => d.id === emp.department);
    return (
      <TouchableOpacity style={[styles.empCard, { backgroundColor: cardBg, borderColor: border, opacity: emp.isActive ? 1 : 0.6 }]} onPress={() => router.push(('/screens/employee-detail?id='+emp.id) as any)} activeOpacity={0.7}>
        <View style={{ position:'relative' }}>
          <Image source={{ uri: emp.avatar }} style={styles.avatar} />
          <View style={[styles.statusDot, { backgroundColor: emp.isActive ? '#4CAF50' : '#F44336' }]} />
        </View>
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={{ color: txt, fontSize:14, fontWeight:'700' }}>{emp.name}</Text>
          <Text style={{ color: sub, fontSize:12, marginTop:2 }}>{emp.designation}</Text>
          <View style={{ flexDirection:'row', gap:6, marginTop:6 }}>
            <View style={[styles.miniChip, { backgroundColor: dept?.color ? dept.color + '20' : '#F5A62320' }]}>
              <Text style={{ color: dept?.color || '#F5A623', fontSize:10, fontWeight:'700' }}>{dept?.name}</Text>
            </View>
            <View style={[styles.miniChip, { backgroundColor: '#F5A62315' }]}>
              <Text style={{ color:'#F5A623', fontSize:10, fontWeight:'700' }}>{emp.role}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems:'flex-end', gap:4 }}>
          <Text style={{ color: sub, fontSize:11 }}>{emp.employeeCode||emp.id}</Text>
          {!emp.isActive && <View style={[styles.miniChip, { backgroundColor:'#F4433620' }]}><Text style={{ color:'#F44336', fontSize:9, fontWeight:'800' }}>DISABLED</Text></View>}
        </View>
        <Ionicons name="chevron-forward" size={16} color={sub} style={{ marginLeft:8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFFFFF','#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={[styles.headerTitle, { color: txt }]}>All Employees</Text>
          <Text style={[styles.headerSub, { color: sub }]}>{filtered.length} of {allEmployees.length} shown</Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[styles.filterBtn, { backgroundColor: showFilters ? '#F5A62320' : (isDark ? '#1A1A2E' : '#F0F4FF'), borderColor: showFilters ? '#F5A62340' : border }]}>
          <Ionicons name="options-outline" size={18} color={showFilters ? '#F5A623' : (isDark ? '#FFF' : '#1A1A2E')} />
          <Text style={{ color: showFilters ? '#F5A623' : (isDark ? '#FFF' : '#1A1A2E'), fontSize:12, fontWeight:'600', marginLeft:4 }}>Filter</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border }]}>
        <Ionicons name="search-outline" size={18} color={sub} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search by name, designation, ID..." placeholderTextColor={sub} style={{ flex:1, marginLeft:10, color: txt, fontSize:14 }} />
        {search !== '' && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={sub} /></TouchableOpacity>}
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={{ color: sub, fontSize:11, fontWeight:'700', marginBottom:8 }}>ROLE</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            {ROLES.map(r => <Chip key={r} label={r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase()+r.slice(1)} active={roleFilter===r} onPress={() => setRoleFilter(r)} />)}
          </View>
          <Text style={{ color: sub, fontSize:11, fontWeight:'700', marginBottom:8 }}>COMPANY</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            <Chip label="All" active={companyFilter==='all'} onPress={() => setCompanyFilter('all')} />
            <Chip label="Outsourcing" active={companyFilter==='monk-outsourcing'} onPress={() => setCompanyFilter('monk-outsourcing')} />
            <Chip label="Travel Tech" active={companyFilter==='monk-travel-tech'} onPress={() => setCompanyFilter('monk-travel-tech')} />
          </View>
          <Text style={{ color: sub, fontSize:11, fontWeight:'700', marginBottom:8 }}>STATUS</Text>
          <View style={{ flexDirection:'row', gap:8 }}>
            <Chip label="All" active={statusFilter==='all'} onPress={() => setStatusFilter('all')} />
            <Chip label="Active" active={statusFilter==='active'} onPress={() => setStatusFilter('active')} />
            <Chip label="Disabled" active={statusFilter==='inactive'} onPress={() => setStatusFilter('inactive')} />
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding:16, gap:10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={sub} />
            <Text style={{ color: sub, fontSize:16, marginTop:12 }}>No employees found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:20, fontWeight:'800' },
  headerSub: { fontSize:12, marginTop:1 },
  filterBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:8, borderRadius:12, borderWidth:1 },
  searchWrap: { flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:8, borderRadius:14, borderWidth:1, paddingHorizontal:14, paddingVertical:12 },
  filterPanel: { marginHorizontal:16, marginBottom:10, borderRadius:14, padding:14, borderWidth:1 },
  chip: { paddingHorizontal:12, paddingVertical:7, borderRadius:10, borderWidth:1 },
  empCard: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:12, borderWidth:1 },
  avatar: { width:50, height:50, borderRadius:25 },
  statusDot: { width:12, height:12, borderRadius:6, position:'absolute', bottom:0, right:0, borderWidth:2, borderColor:'#0A0A0F' },
  miniChip: { paddingHorizontal:8, paddingVertical:3, borderRadius:8 },
  empty: { flex:1, alignItems:'center', justifyContent:'center', paddingTop:80 },
});
