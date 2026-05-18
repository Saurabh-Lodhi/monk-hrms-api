import React, { useState, useRef, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, toggleEmployeeStatusThunk, fetchEmployeesThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { DEPARTMENTS, COMPANIES } from '../../data/company';

export default function EmployeeDetailScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const employee = useSelector((s: RootState) => s.employees.list.find((e:any) => String(e.id) === String(id)));
  const [showSensitive, setShowSensitive] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { dispatch(fetchEmployeesThunk()); }, []);

  if (!employee) {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor: isDark ? '#0A0A0F' : '#F0F4FF', justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color:'#FFF', fontSize:16 }}>Employee not found</Text>
      </SafeAreaView>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isHR = currentUser?.role === 'hr';
  const isSelf = String(currentUser?.id) === String(employee?.id);
  const canSeeSalary = isAdmin || isHR || isSelf;
  const canEdit = isAdmin || isHR;

  const dept = DEPARTMENTS.find(d => d.id === employee.department);
  const company = COMPANIES[employee.company];

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const toggleSensitive = () => {
    Animated.spring(revealAnim, { toValue: showSensitive ? 0 : 1, useNativeDriver: true, tension: 80 }).start();
    setShowSensitive(!showSensitive);
  };

  const mask = (val: string) => showSensitive ? val : val.replace(/[\d]/g, '•').slice(0, val.length);
  const maskSalary = (val: number) => showSalary ? `₹ ${val.toLocaleString('en-IN')}` : '₹ •••,•••';

  const InfoRow = ({ icon, label, value, sensitive = false, redacted = false }: any) => (
    <View style={[styles.infoRow, { borderBottomColor: border }]}>
      <View style={[styles.infoIcon, { backgroundColor: dept?.color ? dept.color + '20' : '#F5A62320' }]}>
        <Ionicons name={icon} size={14} color={dept?.color || '#F5A623'} />
      </View>
      <View style={{ flex:1, marginLeft:10 }}>
        <Text style={{ color: sub, fontSize:11, fontWeight:'600' }}>{label}</Text>
        <Text style={{ color: (sensitive && !showSensitive) || (redacted && !canSeeSalary) ? sub : txt, fontSize:13, fontWeight:'600', marginTop:2, letterSpacing: (sensitive && !showSensitive) ? 2 : 0 }}>
          {redacted ? (canSeeSalary ? value : '🔒 Restricted') : (sensitive ? (showSensitive ? value : value?.replace(/[\w@.]/g, '•')) : value)}
        </Text>
      </View>
    </View>
  );

  const basic = Math.round(employee.salary * 0.5);
  const hra = Math.round(employee.salary * 0.2);
  const netPay = Math.round(employee.salary - basic * 0.12 - (employee.salary <= 21000 ? employee.salary * 0.0075 : 0));

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient colors={isDark ? ['#141420','#0A0A0F'] : ['#EEF2FF','#F0F4FF']} style={styles.hero}>
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.navBtn, { backgroundColor:'rgba(255,255,255,0.1)' }]}>
              <Ionicons name="arrow-back" size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
            </TouchableOpacity>
            <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize:16, fontWeight:'700' }}>Employee Profile</Text>
            {canEdit ? (
              <TouchableOpacity onPress={() => router.push(('/screens/add-edit-employee?id='+employee.id) as any)} style={[styles.navBtn, { backgroundColor:'#F5A62320' }]}>
                <Ionicons name="create-outline" size={20} color="#F5A623" />
              </TouchableOpacity>
            ) : <View style={{ width:38 }} />}
          </View>

          <View style={styles.heroContent}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: employee.avatar }} style={styles.avatar} />
              <View style={[styles.activeIndicator, { backgroundColor: employee.isActive ? '#4CAF50' : '#F44336' }]} />
            </View>
            <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize:22, fontWeight:'900', marginTop:12 }}>{employee.name}</Text>
            <Text style={{ color: isDark ? sub : sub, fontSize:14, marginTop:4 }}>{employee.designation}</Text>

            <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
              <View style={[styles.badge, { backgroundColor: dept?.color ? dept.color + '20' : '#F5A62320', borderColor: dept?.color ? dept.color + '40' : '#F5A62340' }]}>
                <Ionicons name={(dept?.icon || 'briefcase') as any} size={12} color={dept?.color || '#F5A623'} />
                <Text style={{ color: dept?.color || '#F5A623', fontSize:11, fontWeight:'700', marginLeft:4 }}>{dept?.name}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor:'#F5A62320', borderColor:'#F5A62340' }]}>
                <Text style={{ color:'#F5A623', fontSize:11, fontWeight:'800' }}>{employee.role.toUpperCase()}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: employee.isActive ? '#4CAF5020' : '#F4433620', borderColor: employee.isActive ? '#4CAF5040' : '#F4433640' }]}>
                <Text style={{ color: employee.isActive ? '#4CAF50' : '#F44336', fontSize:11, fontWeight:'800' }}>{employee.isActive ? 'ACTIVE' : 'DISABLED'}</Text>
              </View>
            </View>

            <Text style={{ color: sub, fontSize:12, marginTop:8 }}>{employee.employeeCode||employee.id} · {company?.name}</Text>
            {employee.quote && <Text style={{ color: sub, fontSize:12, marginTop:8, fontStyle:'italic', textAlign:'center' }}>{employee.quote}</Text>}
          </View>
        </LinearGradient>

        <View style={{ padding:16, gap:14 }}>

          {/* Quick Stats */}
          <View style={{ flexDirection:'row', gap:10 }}>
            {[
              { label:'Dept', value: dept?.name || '—', icon:'briefcase', color: dept?.color || '#888' },
              { label:'DOJ', value: employee.doj, icon:'calendar', color:'#2196F3' },
              { label:'Type', value: employee.employmentType, icon:'document-outline', color:'#9C27B0' },
            ].map(s => (
              <View key={s.label} style={[styles.quickStat, { backgroundColor: cardBg, borderColor: border }]}>
                <Ionicons name={s.icon as any} size={16} color={s.color} />
                <Text style={{ color: txt, fontSize:11, fontWeight:'700', marginTop:4, textAlign:'center' }}>{s.value}</Text>
                <Text style={{ color: sub, fontSize:10, marginTop:2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Sensitive Toggle Banner */}
          <TouchableOpacity onPress={toggleSensitive} style={[styles.sensitiveToggle, { backgroundColor: showSensitive ? '#FF980020' : '#2196F320', borderColor: showSensitive ? '#FF980040' : '#2196F340' }]}>
            <Ionicons name={showSensitive ? 'eye-off-outline' : 'eye-outline'} size={18} color={showSensitive ? '#FF9800' : '#2196F3'} />
            <Text style={{ color: showSensitive ? '#FF9800' : '#2196F3', fontWeight:'700', fontSize:14, marginLeft:8 }}>
              {showSensitive ? 'Hide Sensitive Info' : 'Tap to Reveal Sensitive Info'}
            </Text>
            <Ionicons name="shield-outline" size={16} color={showSensitive ? '#FF9800' : '#2196F3'} style={{ marginLeft:'auto' }} />
          </TouchableOpacity>

          {/* Contact Info */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.cardTitle, { color: txt }]}>📞 Contact Information</Text>
            <InfoRow icon="mail-outline" label="Email" value={employee.email} sensitive={!isSelf && !canEdit} />
            <InfoRow icon="call-outline" label="Phone" value={employee.phone} sensitive={!isSelf && !canEdit} />
            <InfoRow icon="location-outline" label="Address" value={employee.address} />
            <InfoRow icon="heart-outline" label="Blood Group" value={employee.bloodGroup} />
            <InfoRow icon="people-outline" label="Emergency Contact" value={employee.emergencyContact || 'Not provided'} sensitive />
          </View>

          {/* Work Info */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.cardTitle, { color: txt }]}>💼 Work Information</Text>
            <InfoRow icon="calendar-outline" label="Date of Birth" value={employee.dateOfBirth||employee.dateOfBirth||employee.dob} />
            <InfoRow icon="enter-outline" label="Date of Joining" value={employee.dateOfJoining||employee.dateOfJoining||employee.doj} />
            <InfoRow icon="business-outline" label="Company" value={company?.name} />
            <InfoRow icon="briefcase-outline" label="Department" value={dept?.name} />
            <InfoRow icon="person-outline" label="Employment Type" value={employee.employmentType} />
            <InfoRow icon="finger-print" label="Fingerprint ID" value={employee.fingerprintId || 'Not enrolled'} sensitive />
          </View>

          {/* Salary Section — Role gated */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <Text style={[styles.cardTitle, { color: txt, marginBottom:0 }]}>💰 Salary Details</Text>
              {canSeeSalary ? (
                <TouchableOpacity onPress={() => setShowSalary(!showSalary)} style={[styles.eyeBtn, { borderColor: border }]}>
                  <Ionicons name={showSalary ? 'eye-off-outline' : 'eye-outline'} size={14} color="#F5A623" />
                  <Text style={{ color:'#F5A623', fontSize:11, fontWeight:'700', marginLeft:4 }}>{showSalary ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {!canSeeSalary ? (
              <View style={styles.restricted}>
                <Ionicons name="lock-closed" size={28} color={sub} />
                <Text style={{ color: sub, fontSize:13, fontWeight:'700', marginTop:8 }}>Restricted Access</Text>
                <Text style={{ color: sub, fontSize:11, marginTop:4, textAlign:'center' }}>Salary info is only visible to the employee, HR & Admin</Text>
              </View>
            ) : (
              <>
                <View style={[styles.salaryHighlight, { backgroundColor: isDark ? '#141420' : '#F0F4FF' }]}>
                  <Text style={{ color: sub, fontSize:12 }}>Monthly CTC</Text>
                  <Text style={{ color: '#F5A623', fontSize:28, fontWeight:'900', marginTop:4 }}>{maskSalary(employee.salary)}</Text>
                  <Text style={{ color: sub, fontSize:11, marginTop:2 }}>Annual: {showSalary ? `₹ ${(employee.salary * 12 / 100000).toFixed(2)}L` : '₹ ••L'}</Text>
                </View>
                <View style={{ marginTop:12, gap:8 }}>
                  {[
                    { label:'Basic Salary (50%)', value: basic, color:'#4CAF50' },
                    { label:'HRA (20%)', value: hra, color:'#2196F3' },
                    { label:'PF Deduction (12% of Basic)', value: Math.round(basic * 0.12), color:'#F44336', minus:true },
                    { label:'Net Take Home', value: netPay, color:'#F5A623' },
                  ].map(item => (
                    <View key={item.label} style={[styles.salaryRow, { borderBottomColor: border }]}>
                      <Text style={{ color: sub, fontSize:12, flex:1 }}>{item.label}</Text>
                      <Text style={{ color: item.color, fontSize:13, fontWeight:'800' }}>
                        {item.minus ? '-' : ''}{showSalary ? `₹ ${item.value.toLocaleString('en-IN')}` : '₹ •••,•••'}
                      </Text>
                    </View>
                  ))}
                </View>
                {(isAdmin || isHR) && (
                  <TouchableOpacity onPress={() => router.push(('/screens/salary-slip?empId='+employee.id) as any)} style={[styles.slipBtn, { borderColor:'#F5A623' }]}>
                    <Ionicons name="document-text-outline" size={16} color="#F5A623" />
                    <Text style={{ color:'#F5A623', fontWeight:'700', fontSize:13, marginLeft:6 }}>View Salary Slip</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Finance/KYC — Sensitive */}
          {(canEdit || isSelf) && (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.cardTitle, { color: txt }]}>🏦 Finance & KYC</Text>
              <InfoRow icon="card-outline" label="PAN Card" value={employee.panCard || 'Not provided'} sensitive />
              <InfoRow icon="save-outline" label="Bank Account" value={employee.bankAccount || 'Not provided'} sensitive />
              <InfoRow icon="code-outline" label="IFSC Code" value={employee.ifsc || 'Not provided'} sensitive />
              <InfoRow icon="id-card-outline" label="Aadhaar" value={employee.aadhar || 'Not provided'} sensitive />
            </View>
          )}

          {/* Admin Actions */}
          {canEdit && (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.cardTitle, { color: txt }]}>⚙️ Admin Actions</Text>
              <View style={{ gap:10 }}>
                <TouchableOpacity onPress={() => router.push(('/screens/add-edit-employee?id='+employee.id) as any)} style={[styles.adminAction, { borderColor:'#2196F340', backgroundColor:'#2196F310' }]}>
                  <Ionicons name="create-outline" size={18} color="#2196F3" />
                  <Text style={{ color:'#2196F3', fontWeight:'700', marginLeft:8 }}>Edit Employee Details</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert(employee.isActive?'Disable?':'Enable?',`${employee.isActive?'Disable':'Re-enable'} ${employee.name}?`,[{text:employee.isActive?'Disable':'Enable',style:employee.isActive?'destructive':'default',onPress:()=>dispatch(toggleEmployeeStatusThunk(employee.id))},{text:'Cancel',style:'cancel'}])} style={[styles.adminAction, { borderColor: employee.isActive ? '#F4433640' : '#4CAF5040', backgroundColor: employee.isActive ? '#F4433610' : '#4CAF5010' }]}>
                  <Ionicons name={employee.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={18} color={employee.isActive ? '#F44336' : '#4CAF50'} />
                  <Text style={{ color: employee.isActive ? '#F44336' : '#4CAF50', fontWeight:'700', marginLeft:8 }}>{employee.isActive ? 'Disable Account' : 'Enable Account'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={{ height:24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom:20 },
  heroNav: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:12 },
  navBtn: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center' },
  heroContent: { alignItems:'center', paddingHorizontal:16, paddingTop:12 },
  avatarWrap: { position:'relative' },
  avatar: { width:90, height:90, borderRadius:45, borderWidth:3, borderColor:'#F5A623' },
  activeIndicator: { width:14, height:14, borderRadius:7, position:'absolute', bottom:0, right:0, borderWidth:2.5, borderColor:'#0A0A0F' },
  badge: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:5, borderRadius:10, borderWidth:1 },
  quickStat: { flex:1, alignItems:'center', padding:12, borderRadius:14, borderWidth:1, gap:4 },
  sensitiveToggle: { flexDirection:'row', alignItems:'center', padding:14, borderRadius:14, borderWidth:1 },
  card: { borderRadius:16, padding:16, borderWidth:1 },
  cardTitle: { fontSize:15, fontWeight:'800', marginBottom:14 },
  infoRow: { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1 },
  infoIcon: { width:32, height:32, borderRadius:10, justifyContent:'center', alignItems:'center' },
  eyeBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:6, borderRadius:10, borderWidth:1 },
  restricted: { alignItems:'center', padding:20 },
  salaryHighlight: { borderRadius:14, padding:16, alignItems:'center', marginBottom:4 },
  salaryRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1 },
  slipBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:12, paddingVertical:12, borderRadius:12, borderWidth:1.5 },
  adminAction: { flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, borderWidth:1 },
});
