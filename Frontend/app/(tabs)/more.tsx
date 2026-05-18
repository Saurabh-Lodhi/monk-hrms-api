import React, { useState, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, logoutThunk, fetchNewsThunk, deleteNewsThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { COMPANIES } from '../../data/company';

const TABS = ['Updates', 'Company', 'Profile'];

export default function MoreScreen() {
  const { isDark, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const newsItems = useSelector((s: RootState) => s.news.list);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (newsItems.length === 0) dispatch(fetchNewsThunk());
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isHR = currentUser?.role === 'hr';

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

const handleLogout = async () => {
  try {
    console.log("Logout clicked"); // debug

    await dispatch(logoutThunk()).unwrap(); // clear token

    console.log("Token cleared");

    router.replace('/(auth)/login'); // correct route
  } catch (e) {
    console.log("Logout error:", e);
  }
};
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Policy': return '#F5A623';
      case 'HR': return '#E91E63';
      case 'Benefits': return '#4CAF50';
      case 'Announcement': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      {/* <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFFFFF','#F0F4FF']} style={styles.header}>
        <Text style={[styles.headerTitle, { color: txt }]}>More</Text>
        <View style={{ flexDirection:'row', gap:10 }}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF', borderColor: border }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#F5A623" />
          </TouchableOpacity>
          {(isAdmin || isHR) && (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#F5A62320', borderColor: '#F5A62340' }]} onPress={() => router.push('/screens/admin-panel')}>
              <Ionicons name="settings-outline" size={18} color="#F5A623" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient> */}

        {/* Header */}
<LinearGradient
  colors={isDark ? ['#0F0F1A','#141420'] : ['#FFFFFF','#F0F4FF']}
  style={styles.header}
>
  <Text style={[styles.headerTitle, { color: txt }]}>More</Text>

  <View style={{ flexDirection:'row', gap:10 }}>
    
    <TouchableOpacity
      style={[
        styles.iconBtn,
        {
          backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF',
          borderColor: border
        }
      ]}
      onPress={toggleTheme}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={18}
        color="#F5A623"
      />
    </TouchableOpacity>

{(isAdmin || isHR) && (
  <TouchableOpacity
    style={[
      styles.iconBtn,
      {
        backgroundColor: '#F5A62320',
        borderColor: '#F5A62340'
      }
    ]}
    onPress={() => router.replace('/screens/create-announcement')}
  >
    <Ionicons
      name="settings-outline"
      size={18}
      color="#F5A623"
    />
  </TouchableOpacity>
)}

  </View>
</LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[styles.tabItem, tab === i && { borderBottomWidth:2, borderBottomColor:'#F5A623' }]} onPress={() => setTab(i)}>
            <Text style={{ color: tab === i ? '#F5A623' : sub, fontWeight:'700', fontSize:13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* UPDATES TAB */}
        {tab === 0 && (
          <View style={{ padding:16 }}>
            {(isAdmin || isHR) && (
              <TouchableOpacity style={[styles.addBtn, { borderColor:'#F5A623' }]} onPress={() => router.push('/screens/create-announcement')}>
                <Ionicons name="add-circle" size={18} color="#F5A623" />
                <Text style={{ color:'#F5A623', fontWeight:'700', fontSize:14, marginLeft:8 }}>Create New Update / Announcement</Text>
              </TouchableOpacity>
            )}
            {newsItems.map((item: any) => (
              <TouchableOpacity key={String(item.id)} style={[styles.newsCard, { backgroundColor: cardBg, borderColor: border }]} onPress={() => router.push('/screens/news-detail?id=' + item.id)} activeOpacity={0.75}>
                {(item.urgent||item.isUrgent) && <View style={[styles.urgentBar]} />}
                {(item.pinned||item.isPinned) && !(item.urgent||item.isUrgent) && <View style={[styles.urgentBar, { backgroundColor:'#F5A623' }]} />}
                <View style={[styles.newsBody, !(item.urgent||item.isUrgent) && !(item.pinned||item.isPinned) && { marginLeft:0 }]}>
                  <View style={{ flexDirection:'row', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                    <View style={[styles.catBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                      <Text style={{ color: getCategoryColor(item.category), fontSize:10, fontWeight:'800' }}>{item.category}</Text>
                    </View>
                    {(item.urgent||item.isUrgent) && <View style={[styles.catBadge, { backgroundColor:'#F4433620' }]}><Text style={{ color:'#F44336', fontSize:10, fontWeight:'800' }}>URGENT</Text></View>}
                    {(item.pinned||item.isPinned) && <View style={[styles.catBadge, { backgroundColor:'#F5A62320' }]}><Text style={{ color:'#F5A623', fontSize:10, fontWeight:'800' }}>📌 PINNED</Text></View>}
                  </View>
                  <Text style={{ color: txt, fontSize:14, fontWeight:'700', lineHeight:20, marginBottom:6 }}>{item.title}</Text>
                  <Text style={{ color: sub, fontSize:12, lineHeight:18 }} numberOfLines={2}>{item.content}</Text>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <Text style={{ color: sub, fontSize:11 }}>{item.authorName||item.author} · {item.publishedAt||item.date}</Text>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:3 }}>
                      <Ionicons name="eye-outline" size={12} color={sub} />
                      <Text style={{ color: sub, fontSize:11 }}>{item.views}</Text>
                    </View>
                  </View>
                  {item.tags?.length > 0 && (
                    <View style={{ flexDirection:'row', gap:6, marginTop:8, flexWrap:'wrap' }}>
                      {item.tags.map((tag: string) => (
                        <View key={tag} style={[styles.tag, { backgroundColor: isDark ? '#2A2A40' : '#F0F4FF' }]}>
                          <Text style={{ color: sub, fontSize:10 }}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={sub} style={{ marginTop:8, marginRight:4, alignSelf:'center' }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* COMPANY TAB */}
        {tab === 1 && (
          <View style={{ padding:16 }}>
            {Object.values(COMPANIES).map((co: any) => (
              <View key={co.id} style={[styles.companyCard, { backgroundColor: cardBg, borderColor: border }]}>
                <LinearGradient colors={[co.primaryColor + '30', co.primaryColor + '10']} style={styles.companyHeader}>
                  <View style={[styles.companyDot, { backgroundColor: co.primaryColor }]} />
                  <View style={{ flex:1, marginLeft:12 }}>
                    <Text style={{ color: txt, fontSize:17, fontWeight:'800' }}>{co.name}</Text>
                    <Text style={{ color: sub, fontSize:12, marginTop:2 }}>{co.tagline}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: co.primaryColor + '20', borderColor: co.primaryColor + '40' }]}>
                    <Text style={{ color: co.primaryColor, fontSize:9, fontWeight:'800' }}>ACTIVE</Text>
                  </View>
                </LinearGradient>
                <View style={{ padding:14, gap:10 }}>
                  {co.phone && (
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={16} color={co.primaryColor} />
                      <Text style={{ color: sub, fontSize:13, marginLeft:10 }}>{typeof co.phone === 'object' ? Object.values(co.phone).join(' / ') : co.phone}</Text>
                    </View>
                  )}
                  {co.email && (
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={16} color={co.primaryColor} />
                      <Text style={{ color: sub, fontSize:13, marginLeft:10 }}>{co.email}</Text>
                    </View>
                  )}
                  {co.address && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color={co.primaryColor} />
                      <Text style={{ color: sub, fontSize:13, marginLeft:10, flex:1 }}>{typeof co.address === 'object' ? Object.values(co.address).join('\n') : co.address}</Text>
                    </View>
                  )}
                  {co.cin && (
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={16} color={co.primaryColor} />
                      <Text style={{ color: sub, fontSize:13, marginLeft:10 }}>CIN: {co.cin}</Text>
                    </View>
                  )}
                  {co.brands && (
                    <View style={{ marginTop:4 }}>
                      <Text style={{ color: sub, fontSize:12, marginBottom:8 }}>Brands</Text>
                      <View style={{ flexDirection:'row', gap:8 }}>
                        {co.brands.map((b: string) => (
                          <View key={b} style={[styles.brandBadge, { backgroundColor: co.primaryColor + '20', borderColor: co.primaryColor + '30' }]}>
                            <Text style={{ color: co.primaryColor, fontSize:11, fontWeight:'700' }}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {co.services && (
                    <View style={{ marginTop:4 }}>
                      <Text style={{ color: sub, fontSize:12, marginBottom:8 }}>Services</Text>
                      {co.services.map((s: string) => (
                        <View key={s} style={styles.serviceRow}>
                          <View style={[styles.serviceDot, { backgroundColor: co.primaryColor }]} />
                          <Text style={{ color: txt, fontSize:12 }}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PROFILE TAB */}
        {tab === 2 && currentUser && (
          <View style={{ padding:16 }}>
            {/* Avatar card */}
            <LinearGradient colors={isDark ? ['#141420','#1A1A2E'] : ['#FFF','#EEF2FF']} style={[styles.profileCard, { borderColor: border }]}>
              <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
              <Text style={{ color: txt, fontSize:20, fontWeight:'800', marginTop:12 }}>{currentUser.name}</Text>
              <Text style={{ color: sub, fontSize:13, marginTop:2 }}>{currentUser.designation}</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
                <View style={[styles.roleBadge, { backgroundColor:'#F5A62320', borderColor:'#F5A62340' }]}>
                  <Text style={{ color:'#F5A623', fontSize:10, fontWeight:'800' }}>{currentUser.role.toUpperCase()}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: currentUser.isActive ? '#4CAF5020' : '#F4433620', borderColor: currentUser.isActive ? '#4CAF5040' : '#F4433640' }]}>
                  <Text style={{ color: currentUser.isActive ? '#4CAF50' : '#F44336', fontSize:10, fontWeight:'800' }}>{currentUser.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/screens/employee-detail?id=' + currentUser.id)} style={[styles.viewProfileBtn, { borderColor:'#F5A623' }]}>
                <Text style={{ color:'#F5A623', fontWeight:'700', fontSize:13 }}>View Full Profile</Text>
                <Ionicons name="arrow-forward" size={14} color="#F5A623" style={{ marginLeft:4 }} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Menu Items */}
            {[
              { label:'My Attendance', icon:'finger-print', route:'/screens/attendance-detail', color:'#2196F3' },
              { label:'Apply Leave', icon:'calendar-outline', route:'/screens/apply-leave', color:'#4CAF50' },
              { label:'Salary Slips', icon:'document-text-outline', route:'/screens/salary-slip', color:'#F5A623' },
              { label:'Company Policies', icon:'shield-checkmark-outline', route:'/screens/policies', color:'#E91E63' },
              { label:'Org Chart', icon:'git-network-outline', route:'/screens/org-chart', color:'#9C27B0' },
              { label:'All Employees', icon:'people-outline', route:'/screens/all-employees', color:'#00BCD4' },
              { label:'Events & Calendar', icon:'star-outline', route:'/screens/events', color:'#FF9800' },
              ...(isAdmin || isHR ? [{ label:'Admin Panel', icon:'settings', route:'/screens/admin-panel', color:'#F5A623' }] : []),
            ].map(item => (
              <TouchableOpacity key={item.label} style={[styles.menuItem, { backgroundColor: cardBg, borderColor: border }]} onPress={() => router.push(item.route as any)}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={{ color: txt, fontSize:14, fontWeight:'600', flex:1, marginLeft:12 }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={sub} />
              </TouchableOpacity>
            ))}

            {/* Theme Toggle */}
            <View style={[styles.menuItem, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={[styles.menuIcon, { backgroundColor:'#F5A62320' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color="#F5A623" />
              </View>
              <Text style={{ color: txt, fontSize:14, fontWeight:'600', flex:1, marginLeft:12 }}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
              <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true:'#F5A623', false:'#CCC' }} thumbColor="#FFF" />
            </View>

            {/* Logout */}
            <TouchableOpacity style={[styles.logoutBtn, { borderColor:'#F4433640' }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#F44336" />
              <Text style={{ color:'#F44336', fontWeight:'700', fontSize:14, marginLeft:10 }}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={{ color: sub, fontSize:11, textAlign:'center', marginTop:20, marginBottom:8 }}>
              Monk Group HRMS v2.0 · {String(currentUser.id)}
            </Text>
          </View>
        )}

        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:22, fontWeight:'800' },
  iconBtn: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center', borderWidth:1 },
  tabRow: { flexDirection:'row', borderBottomWidth:1 },
  tabItem: { flex:1, paddingVertical:14, alignItems:'center' },
  addBtn: { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderRadius:14, padding:14, marginBottom:16, borderStyle:'dashed' },
  newsCard: { flexDirection:'row', borderRadius:16, marginBottom:12, borderWidth:1, overflow:'hidden' },
  urgentBar: { width:4, backgroundColor:'#F44336' },
  newsBody: { flex:1, padding:14, marginLeft:0 },
  catBadge: { paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  tag: { paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  companyCard: { borderRadius:18, overflow:'hidden', marginBottom:16, borderWidth:1 },
  companyHeader: { flexDirection:'row', alignItems:'center', padding:16 },
  companyDot: { width:14, height:14, borderRadius:7 },
  roleBadge: { paddingHorizontal:8, paddingVertical:3, borderRadius:8, borderWidth:1 },
  infoRow: { flexDirection:'row', alignItems:'flex-start' },
  brandBadge: { paddingHorizontal:10, paddingVertical:5, borderRadius:10, borderWidth:1 },
  serviceRow: { flexDirection:'row', alignItems:'center', gap:8, paddingVertical:4 },
  serviceDot: { width:6, height:6, borderRadius:3 },
  profileCard: { borderRadius:20, padding:24, alignItems:'center', marginBottom:16, borderWidth:1 },
  profileAvatar: { width:80, height:80, borderRadius:40, borderWidth:3, borderColor:'#F5A623' },
  viewProfileBtn: { flexDirection:'row', alignItems:'center', marginTop:14, paddingHorizontal:20, paddingVertical:10, borderRadius:12, borderWidth:1.5 },
  menuItem: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:14, marginBottom:10, borderWidth:1 },
  menuIcon: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center' },
  logoutBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:14, padding:16, marginTop:8, borderWidth:1.5 },
});
