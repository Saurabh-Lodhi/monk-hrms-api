// import React, { useState, useEffect } from 'react';
// import {
//   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
//   SafeAreaView, StatusBar, TextInput, Alert, Image,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   RootState, AppDispatch,
//   fetchEmployeesThunk, fetchNewsThunk,
//   toggleEmployeeStatusThunk, deleteEmployeeThunk,
//   createNewsThunk, deleteNewsThunk,
// } from '../../store';
// import { useTheme } from '../../hooks/useTheme';

// export default function AdminPanelScreen() {
//   const { isDark, theme } = useTheme();
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const currentUser = useSelector((s: RootState) => s.auth.user);
//   const allEmployees = useSelector((s: RootState) => s.employees.list);
//   const allNews = useSelector((s: RootState) => s.news.list);
//   const [tab, setTab] = useState<'employees' | 'news' | 'stats'>('employees');
//   const [search, setSearch] = useState('');
//   const [togglingId, setTogglingId] = useState<number | null>(null);
//   const [deletingId, setDeletingId] = useState<number | null>(null);

//   useEffect(() => {
//     dispatch(fetchEmployeesThunk());
//     dispatch(fetchNewsThunk());
//   }, []);

//   if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0A0A0F' : '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
//         <Ionicons name="lock-closed" size={60} color="#F44336" />
//         <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Access Denied</Text>
//         <Text style={{ color: '#888', fontSize: 13, marginTop: 8 }}>Admin/HR only</Text>
//         <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12 }}>
//           <Text style={{ color: '#F5A623', fontWeight: '700' }}>Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   const filtered = allEmployees.filter(e =>
//     (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
//     (e.designation || '').toLowerCase().includes(search.toLowerCase())
//   );

//   const handleToggle = async (id: number, name: string, currentState: boolean) => {
//     Alert.alert(
//       currentState ? 'Disable Employee' : 'Enable Employee',
//       currentState
//         ? `This will revoke ${name}'s app access. Continue?`
//         : `Re-enable ${name}'s access?`,
//       [
//         {
//           text: currentState ? 'Disable' : 'Enable',
//           style: currentState ? 'destructive' : 'default',
//           onPress: async () => {
//             setTogglingId(id);
//             try {
//               const result = await dispatch(toggleEmployeeStatusThunk(id));
//               if (toggleEmployeeStatusThunk.fulfilled.match(result)) {
//                 Alert.alert(
//                   '✅ Done',
//                   `${name} has been ${currentState ? 'disabled' : 'enabled'} successfully.`
//                 );
//                 dispatch(fetchEmployeesThunk());
//               } else {
//                 Alert.alert('❌ Error', 'Failed to update employee status.');
//               }
//             } catch {
//               Alert.alert('❌ Error', 'Something went wrong.');
//             } finally {
//               setTogglingId(null);
//             }
//           },
//         },
//         { text: 'Cancel', style: 'cancel' },
//       ]
//     );
//   };

//   const handleDelete = async (id: number, name: string) => {
//     Alert.alert('Delete Employee', `Permanently delete ${name}? This cannot be undone.`, [
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           setDeletingId(id);
//           try {
//             const result = await dispatch(deleteEmployeeThunk(id));
//             if (deleteEmployeeThunk.fulfilled.match(result)) {
//               Alert.alert('✅ Deleted', `${name} has been removed.`);
//             } else {
//               Alert.alert('❌ Error', 'Failed to delete employee.');
//             }
//           } catch {
//             Alert.alert('❌ Error', 'Something went wrong.');
//           } finally {
//             setDeletingId(null);
//           }
//         },
//       },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const handleDeleteNews = (id: string, title: string) => {
//     Alert.alert('Delete', `Delete "${title}"?`, [
//       { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteNewsThunk(Number(id))) },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const bg = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt = theme.text;
//   const sub = theme.textSub;
//   const border = theme.border;

//   const activeCount = allEmployees.filter(e => e.isActive).length;
//   const inactiveCount = allEmployees.filter(e => !e.isActive).length;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

//       {/* Header */}
//       <LinearGradient colors={['#F5A623', '#E6940F']} style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//           <Ionicons name="arrow-back" size={22} color="#000" />
//         </TouchableOpacity>
//         <View style={{ flex: 1, marginLeft: 12 }}>
//           <Text style={{ color: '#000', fontSize: 18, fontWeight: '800' }}>Admin Panel</Text>
//           <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>{currentUser.role.toUpperCase()} · {currentUser.name}</Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => router.push('/screens/add-edit-employee' as any)}
//           style={styles.addBtn}
//         >
//           <Ionicons name="person-add-outline" size={18} color="#000" />
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* Stats Row */}
//       <View style={[styles.statsRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
//         {[
//           { label: 'Total', value: allEmployees.length, color: '#2196F3' },
//           { label: 'Active', value: activeCount, color: '#4CAF50' },
//           { label: 'Inactive', value: inactiveCount, color: '#F44336' },
//           { label: 'News', value: allNews.length, color: '#F5A623' },
//         ].map(s => (
//           <View key={s.label} style={styles.statItem}>
//             <Text style={{ color: s.color, fontSize: 20, fontWeight: '900' }}>{s.value}</Text>
//             <Text style={{ color: sub, fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Sub Tabs */}
//       <View style={[styles.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
//         {(['employees', 'news', 'stats'] as const).map(t => (
//           <TouchableOpacity
//             key={t}
//             style={[styles.tabItem, tab === t && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
//             onPress={() => setTab(t)}
//           >
//             <Text style={{ color: tab === t ? '#F5A623' : sub, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>{t}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>

//         {/* EMPLOYEES */}
//         {tab === 'employees' && (
//           <View style={{ padding: 16 }}>
//             {/* Search */}
//             <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: border }]}>
//               <Ionicons name="search-outline" size={16} color={sub} />
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search employees..."
//                 placeholderTextColor={sub}
//                 style={{ flex: 1, marginLeft: 8, color: txt, fontSize: 14 }}
//               />
//               {search !== '' && (
//                 <TouchableOpacity onPress={() => setSearch('')}>
//                   <Ionicons name="close-circle" size={16} color={sub} />
//                 </TouchableOpacity>
//               )}
//             </View>

//             <TouchableOpacity
//               onPress={() => router.push('/screens/add-edit-employee' as any)}
//               style={[styles.createBtn]}
//             >
//               <LinearGradient
//                 colors={['#F5A623', '#E6940F']}
//                 style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14 }}
//               >
//                 <Ionicons name="person-add-outline" size={18} color="#000" />
//                 <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>Add New Employee</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             {filtered.length === 0 && (
//               <View style={{ alignItems: 'center', padding: 40 }}>
//                 <Ionicons name="people-outline" size={48} color={sub} />
//                 <Text style={{ color: sub, marginTop: 12 }}>No employees found</Text>
//               </View>
//             )}

//             {filtered.map(emp => {
//               const isToggling = togglingId === Number(emp.id);
//               const isDeleting = deletingId === Number(emp.id);
//               return (
//                 <View key={emp.id} style={[styles.empRow, { backgroundColor: cardBg, borderColor: border }]}>
//                   <Image
//                     source={{ uri: emp.avatar }}
//                     style={[styles.empAvatar, { opacity: emp.isActive ? 1 : 0.4 }]}
//                   />
//                   <View style={{ flex: 1, marginLeft: 10 }}>
//                     <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>{emp.name}</Text>
//                     <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>
//                       {emp.designation} · {emp.employeeCode || emp.id}
//                     </Text>
//                     <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
//                       <View style={[styles.miniTag, { backgroundColor: emp.isActive ? '#4CAF5020' : '#F4433620' }]}>
//                         <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: emp.isActive ? '#4CAF50' : '#F44336' }} />
//                         <Text style={{ color: emp.isActive ? '#4CAF50' : '#F44336', fontSize: 9, fontWeight: '800' }}>
//                           {emp.isActive ? 'ACTIVE' : 'DISABLED'}
//                         </Text>
//                       </View>
//                       <View style={[styles.miniTag, { backgroundColor: '#F5A62310' }]}>
//                         <Text style={{ color: '#F5A623', fontSize: 9, fontWeight: '700' }}>{emp.role.toUpperCase()}</Text>
//                       </View>
//                     </View>
//                   </View>
//                   <View style={{ flexDirection: 'row', gap: 4 }}>
//                     {/* Edit */}
//                     <TouchableOpacity
//                       style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]}
//                       onPress={() => router.push(('/screens/add-edit-employee?id=' + emp.id) as any)}
//                     >
//                       <Ionicons name="create-outline" size={16} color="#2196F3" />
//                     </TouchableOpacity>

//                     {/* Toggle Enable/Disable */}
//                     <TouchableOpacity
//                       style={[styles.actionBtn, {
//                         backgroundColor: emp.isActive ? '#F4433615' : '#4CAF5015',
//                         opacity: isToggling ? 0.5 : 1,
//                       }]}
//                       onPress={() => !isToggling && handleToggle(Number(emp.id), emp.name, emp.isActive)}
//                       disabled={isToggling}
//                     >
//                       <Ionicons
//                         name={isToggling ? 'time-outline' : emp.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
//                         size={16}
//                         color={emp.isActive ? '#F44336' : '#4CAF50'}
//                       />
//                     </TouchableOpacity>

//                     {/* Delete (admin only) */}
//                     {currentUser?.role === 'admin' && (
//                       <TouchableOpacity
//                         style={[styles.actionBtn, { backgroundColor: '#F4433615', opacity: isDeleting ? 0.5 : 1 }]}
//                         onPress={() => !isDeleting && handleDelete(Number(emp.id), emp.name)}
//                         disabled={isDeleting}
//                       >
//                         <Ionicons name="trash-outline" size={16} color="#F44336" />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {/* NEWS */}
//         {tab === 'news' && (
//           <View style={{ padding: 16 }}>
//             <TouchableOpacity
//               onPress={() => router.push('/screens/add-edit-employee' as any)}
//               style={[styles.createBtn]}
//             >
//               <LinearGradient
//                 colors={['#E91E63', '#C2185B']}
//                 style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14 }}
//               >
//                 <Ionicons name="add-circle-outline" size={18} color="#FFF" />
//                 <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Create New Announcement</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//             {allNews.map((item: any) => (
//               <View key={item.id} style={[styles.newsItem, { backgroundColor: cardBg, borderColor: border }]}>
//                 <View style={{ flex: 1 }}>
//                   <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
//                     {(item.isPinned || item.pinned) && (
//                       <View style={[styles.miniTag, { backgroundColor: '#F5A62320' }]}>
//                         <Text style={{ color: '#F5A623', fontSize: 9, fontWeight: '800' }}>PINNED</Text>
//                       </View>
//                     )}
//                     {(item.isUrgent || item.urgent) && (
//                       <View style={[styles.miniTag, { backgroundColor: '#F4433620' }]}>
//                         <Text style={{ color: '#F44336', fontSize: 9, fontWeight: '800' }}>URGENT</Text>
//                       </View>
//                     )}
//                     <View style={[styles.miniTag, { backgroundColor: '#2196F320' }]}>
//                       <Text style={{ color: '#2196F3', fontSize: 9, fontWeight: '800' }}>{item.category}</Text>
//                     </View>
//                   </View>
//                   <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }} numberOfLines={2}>{item.title}</Text>
//                   <Text style={{ color: sub, fontSize: 11, marginTop: 4 }}>
//                     {item.authorName || item.author} · {item.publishedAt || item.date} · {item.views} views
//                   </Text>
//                 </View>
//                 <View style={{ flexDirection: 'row', gap: 6, marginLeft: 10 }}>
//                   <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]}>
//                     <Ionicons name="create-outline" size={16} color="#2196F3" />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.actionBtn, { backgroundColor: '#F4433615' }]}
//                     onPress={() => handleDeleteNews(item.id, item.title)}
//                   >
//                     <Ionicons name="trash-outline" size={16} color="#F44336" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* STATS */}
//         {tab === 'stats' && (
//           <View style={{ padding: 16 }}>
//             {[
//               { label: 'Total Employees', value: allEmployees.length, icon: 'people', color: '#2196F3' },
//               { label: 'Active Employees', value: activeCount, icon: 'checkmark-circle', color: '#4CAF50' },
//               { label: 'Disabled Accounts', value: inactiveCount, icon: 'pause-circle', color: '#F44336' },
//               { label: 'Admins', value: allEmployees.filter(e => e.role === 'admin').length, icon: 'shield', color: '#F5A623' },
//               { label: 'HR Team', value: allEmployees.filter(e => e.role === 'hr').length, icon: 'people-circle', color: '#E91E63' },
//               { label: 'Managers', value: allEmployees.filter(e => e.role === 'manager').length, icon: 'briefcase', color: '#9C27B0' },
//               { label: 'Employees', value: allEmployees.filter(e => e.role === 'employee').length, icon: 'person', color: '#00BCD4' },
//               { label: 'Monk Outsourcing', value: allEmployees.filter(e => e.company === 'monk-outsourcing').length, icon: 'business', color: '#F5A623' },
//               { label: 'Monk Travel Tech', value: allEmployees.filter(e => e.company === 'monk-travel-tech').length, icon: 'airplane', color: '#00BCD4' },
//             ].map(item => (
//               <View key={item.label} style={[styles.statRow, { backgroundColor: cardBg, borderColor: border }]}>
//                 <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
//                   <Ionicons name={item.icon as any} size={20} color={item.color} />
//                 </View>
//                 <Text style={{ color: txt, fontSize: 14, fontWeight: '600', flex: 1, marginLeft: 12 }}>{item.label}</Text>
//                 <Text style={{ color: item.color, fontSize: 22, fontWeight: '900' }}>{item.value}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         <View style={{ height: 20 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
//   addBtn: { width: 38, height: 38, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   statsRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 12 },
//   statItem: { flex: 1, alignItems: 'center' },
//   tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
//   tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
//   searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
//   createBtn: { marginBottom: 14 },
//   empRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1 },
//   empAvatar: { width: 44, height: 44, borderRadius: 22 },
//   miniTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
//   actionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
//   newsItem: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
//   statRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
//   statIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
// });

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
// //   SafeAreaView, StatusBar, TextInput, Alert, Image, Switch,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { RootState, AppDispatch, fetchEmployeesThunk, fetchNewsThunk, toggleEmployeeStatusThunk, deleteEmployeeThunk, createNewsThunk, deleteNewsThunk } from '../../store';
// // import { useTheme } from '../../hooks/useTheme';

// // export default function AdminPanelScreen() {
// //   const { isDark, theme } = useTheme();
// //   const router = useRouter();
// //   const dispatch = useDispatch<AppDispatch>();
// //   const currentUser = useSelector((s: RootState) => s.auth.user);
// //   const allEmployees = useSelector((s: RootState) => s.employees.list);
// //   const allNews = useSelector((s: RootState) => s.news.list);
// //   const [tab, setTab] = useState<'employees' | 'news' | 'stats'>('employees');
// //   const [search, setSearch] = useState('');

// //   useEffect(() => {
// //     dispatch(fetchEmployeesThunk());
// //     dispatch(fetchNewsThunk());
// //   }, []);

// //   if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
// //     return (
// //       <SafeAreaView style={{ flex:1, backgroundColor: isDark ? '#0A0A0F' : '#F0F4FF', justifyContent:'center', alignItems:'center' }}>
// //         <Ionicons name="lock-closed" size={60} color="#F44336" />
// //         <Text style={{ color: '#FFF', fontSize:18, fontWeight:'700', marginTop:16 }}>Access Denied</Text>
// //         <Text style={{ color:'#888', fontSize:13, marginTop:8 }}>Admin/HR only</Text>
// //       </SafeAreaView>
// //     );
// //   }

// //   const filtered = allEmployees.filter(e =>
// //     (e.name||'').toLowerCase().includes(search.toLowerCase()) ||
// //     (e.designation||'').toLowerCase().includes(search.toLowerCase())
// //   );

// //   const handleToggle = (id: string, currentState: boolean) => {
// //     Alert.alert(
// //       currentState ? 'Disable Employee' : 'Enable Employee',
// //       currentState ? 'This will immediately revoke the employee\'s app access. Continue?' : 'Re-enable this employee\'s access?',
// //       [
// //         { text: currentState ? 'Disable' : 'Enable', style: currentState ? 'destructive' : 'default', onPress: () => dispatch(toggleEmployeeStatusThunk(Number(id))) },
// //         { text: 'Cancel', style: 'cancel' },
// //       ]
// //     );
// //   };

// //   const handleDelete = (id: string, name: string) => {
// //     Alert.alert('Delete Employee', `Permanently delete ${name}? This cannot be undone.`, [
// //       { text:'Delete', style:'destructive', onPress:() => dispatch(deleteEmployeeThunk(Number(id))) },
// //       { text:'Cancel', style:'cancel' },
// //     ]);
// //   };

// //   const handleDeleteNews = (id: string, title: string) => {
// //     Alert.alert('Delete', `Delete "${title}"?`, [
// //       { text:'Delete', style:'destructive', onPress:() => dispatch(deleteNewsThunk(Number(id))) },
// //       { text:'Cancel', style:'cancel' },
// //     ]);
// //   };

// //   const bg = theme.bg;
// //   const cardBg = theme.bgCard;
// //   const txt = theme.text;
// //   const sub = theme.textSub;
// //   const border = theme.border;

// //   const activeCount = allEmployees.filter(e => e.isActive).length;
// //   const inactiveCount = allEmployees.filter(e => !e.isActive).length;

// //   return (
// //     <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
// //       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

// //       {/* Header */}
// //       <LinearGradient colors={['#F5A623','#E6940F']} style={styles.header}>
// //         <TouchableOpacity onPress={() => router.back()}>
// //           <Ionicons name="arrow-back" size={22} color="#000" />
// //         </TouchableOpacity>
// //         <View style={{ flex:1, marginLeft:12 }}>
// //           <Text style={{ color:'#000', fontSize:18, fontWeight:'800' }}>Admin Panel</Text>
// //           <Text style={{ color:'rgba(0,0,0,0.6)', fontSize:12 }}>{currentUser.role.toUpperCase()} · {currentUser.name}</Text>
// //         </View>
// //         <TouchableOpacity onPress={() => router.push('/screens/add-edit-employee' as any)} style={styles.addBtn}>
// //           <Ionicons name="person-add-outline" size={18} color="#000" />
// //         </TouchableOpacity>
// //       </LinearGradient>

// //       {/* Stats Row */}
// //       <View style={[styles.statsRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
// //         {[
// //           { label:'Total', value: allEmployees.length, color:'#2196F3' },
// //           { label:'Active', value: activeCount, color:'#4CAF50' },
// //           { label:'Inactive', value: inactiveCount, color:'#F44336' },
// //           { label:'News', value: allNews.length, color:'#F5A623' },
// //         ].map(s => (
// //           <View key={s.label} style={styles.statItem}>
// //             <Text style={{ color: s.color, fontSize:20, fontWeight:'900' }}>{s.value}</Text>
// //             <Text style={{ color: sub, fontSize:10, fontWeight:'600' }}>{s.label}</Text>
// //           </View>
// //         ))}
// //       </View>

// //       {/* Sub Tabs */}
// //       <View style={[styles.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
// //         {(['employees','news','stats'] as const).map(t => (
// //           <TouchableOpacity key={t} style={[styles.tabItem, tab === t && { borderBottomWidth:2, borderBottomColor:'#F5A623' }]} onPress={() => setTab(t)}>
// //             <Text style={{ color: tab === t ? '#F5A623' : sub, fontWeight:'700', fontSize:12, textTransform:'capitalize' }}>{t}</Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView showsVerticalScrollIndicator={false}>

// //         {/* EMPLOYEES */}
// //         {tab === 'employees' && (
// //           <View style={{ padding:16 }}>
// //             {/* Search */}
// //             <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: border }]}>
// //               <Ionicons name="search-outline" size={16} color={sub} />
// //               <TextInput
// //                 value={search} onChangeText={setSearch}
// //                 placeholder="Search employees..."
// //                 placeholderTextColor={sub}
// //                 style={{ flex:1, marginLeft:8, color: txt, fontSize:14 }}
// //               />
// //             </View>

// //             <TouchableOpacity onPress={() => router.push('/screens/add-edit-employee' as any)} style={[styles.createBtn]}>
// //               <LinearGradient colors={['#F5A623','#E6940F']} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, padding:14, borderRadius:14 }}>
// //                 <Ionicons name="person-add-outline" size={18} color="#000" />
// //                 <Text style={{ color:'#000', fontWeight:'800', fontSize:14 }}>Add New Employee</Text>
// //               </LinearGradient>
// //             </TouchableOpacity>

// //             {filtered.map(emp => (
// //               <View key={emp.id} style={[styles.empRow, { backgroundColor: cardBg, borderColor: border }]}>
// //                 <Image source={{ uri: emp.avatar }} style={[styles.empAvatar, { opacity: emp.isActive ? 1 : 0.4 }]} />
// //                 <View style={{ flex:1, marginLeft:10 }}>
// //                   <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>{emp.name}</Text>
// //                   <Text style={{ color: sub, fontSize:11, marginTop:1 }}>{emp.designation} · {emp.employeeCode||emp.id}</Text>
// //                   <View style={{ flexDirection:'row', gap:6, marginTop:4 }}>
// //                     <View style={[styles.miniTag, { backgroundColor: emp.isActive ? '#4CAF5020' : '#F4433620' }]}>
// //                       <View style={{ width:5, height:5, borderRadius:3, backgroundColor: emp.isActive ? '#4CAF50' : '#F44336' }} />
// //                       <Text style={{ color: emp.isActive ? '#4CAF50' : '#F44336', fontSize:9, fontWeight:'800' }}>{emp.isActive ? 'ACTIVE' : 'DISABLED'}</Text>
// //                     </View>
// //                     <View style={[styles.miniTag, { backgroundColor:'#F5A62310' }]}>
// //                       <Text style={{ color:'#F5A623', fontSize:9, fontWeight:'700' }}>{emp.role.toUpperCase()}</Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //                 <View style={{ flexDirection:'row', gap:4 }}>
// //                   <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]} onPress={() => router.push(('/screens/add-edit-employee?id='+emp.id) as any)}>
// //                     <Ionicons name="create-outline" size={16} color="#2196F3" />
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={[styles.actionBtn, { backgroundColor: emp.isActive ? '#F4433615' : '#4CAF5015' }]} onPress={() => handleToggle(emp.id, emp.isActive)}>
// //                     <Ionicons name={emp.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color={emp.isActive ? '#F44336' : '#4CAF50'} />
// //                   </TouchableOpacity>
// //                   {currentUser?.role === 'admin' && (
// //                     <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#F4433615' }]} onPress={() => handleDelete(emp.id, emp.name)}>
// //                       <Ionicons name="trash-outline" size={16} color="#F44336" />
// //                     </TouchableOpacity>
// //                   )}
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         {/* NEWS */}
// //         {tab === 'news' && (
// //           <View style={{ padding:16 }}>
// //             <TouchableOpacity style={[styles.createBtn]}>
// //               <LinearGradient colors={['#E91E63','#C2185B']} style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, padding:14, borderRadius:14 }}>
// //                 <Ionicons name="add-circle-outline" size={18} color="#FFF" />
// //                 <Text style={{ color:'#FFF', fontWeight:'800', fontSize:14 }}>Create New Announcement</Text>
// //               </LinearGradient>
// //             </TouchableOpacity>
// //             {allNews.map((item: any) => (
// //               <View key={item.id} style={[styles.newsItem, { backgroundColor: cardBg, borderColor: border }]}>
// //                 <View style={{ flex:1 }}>
// //                   <View style={{ flexDirection:'row', gap:6, marginBottom:6 }}>
// //                     {(item.isPinned||item.pinned) && <View style={[styles.miniTag, { backgroundColor:'#F5A62320' }]}><Text style={{ color:'#F5A623', fontSize:9, fontWeight:'800' }}>PINNED</Text></View>}
// //                     {(item.isUrgent||item.urgent) && <View style={[styles.miniTag, { backgroundColor:'#F4433620' }]}><Text style={{ color:'#F44336', fontSize:9, fontWeight:'800' }}>URGENT</Text></View>}
// //                     <View style={[styles.miniTag, { backgroundColor:'#2196F320' }]}><Text style={{ color:'#2196F3', fontSize:9, fontWeight:'800' }}>{item.category}</Text></View>
// //                   </View>
// //                   <Text style={{ color: txt, fontSize:13, fontWeight:'700' }} numberOfLines={2}>{item.title}</Text>
// //                   <Text style={{ color: sub, fontSize:11, marginTop:4 }}>{item.authorName||item.author} · {item.publishedAt||item.date} · {item.views} views</Text>
// //                 </View>
// //                 <View style={{ flexDirection:'row', gap:6, marginLeft:10 }}>
// //                   <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]}>
// //                     <Ionicons name="create-outline" size={16} color="#2196F3" />
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={[styles.actionBtn, { backgroundColor:'#F4433615' }]} onPress={() => handleDeleteNews(item.id, item.title)}>
// //                     <Ionicons name="trash-outline" size={16} color="#F44336" />
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         {/* STATS */}
// //         {tab === 'stats' && (
// //           <View style={{ padding:16 }}>
// //             {[
// //               { label:'Total Employees', value: allEmployees.length, icon:'people', color:'#2196F3' },
// //               { label:'Active Employees', value: activeCount, icon:'checkmark-circle', color:'#4CAF50' },
// //               { label:'Disabled Accounts', value: inactiveCount, icon:'pause-circle', color:'#F44336' },
// //               { label:'Admins', value: allEmployees.filter(e => e.role === 'admin').length, icon:'shield', color:'#F5A623' },
// //               { label:'HR Team', value: allEmployees.filter(e => e.role === 'hr').length, icon:'people-circle', color:'#E91E63' },
// //               { label:'Managers', value: allEmployees.filter(e => e.role === 'manager').length, icon:'briefcase', color:'#9C27B0' },
// //               { label:'Employees', value: allEmployees.filter(e => e.role === 'employee').length, icon:'person', color:'#00BCD4' },
// //               { label:'Monk Outsourcing', value: allEmployees.filter(e => e.company === 'monk-outsourcing').length, icon:'business', color:'#F5A623' },
// //               { label:'Monk Travel Tech', value: allEmployees.filter(e => e.company === 'monk-travel-tech').length, icon:'airplane', color:'#00BCD4' },
// //             ].map(item => (
// //               <View key={item.label} style={[styles.statRow, { backgroundColor: cardBg, borderColor: border }]}>
// //                 <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
// //                   <Ionicons name={item.icon as any} size={20} color={item.color} />
// //                 </View>
// //                 <Text style={{ color: txt, fontSize:14, fontWeight:'600', flex:1, marginLeft:12 }}>{item.label}</Text>
// //                 <Text style={{ color: item.color, fontSize:22, fontWeight:'900' }}>{item.value}</Text>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         <View style={{ height:20 }} />
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
// //   addBtn: { width:38, height:38, backgroundColor:'rgba(0,0,0,0.2)', borderRadius:12, justifyContent:'center', alignItems:'center' },
// //   statsRow: { flexDirection:'row', borderBottomWidth:1, paddingVertical:12 },
// //   statItem: { flex:1, alignItems:'center' },
// //   tabRow: { flexDirection:'row', borderBottomWidth:1 },
// //   tabItem: { flex:1, paddingVertical:12, alignItems:'center' },
// //   searchBox: { flexDirection:'row', alignItems:'center', borderRadius:12, borderWidth:1, paddingHorizontal:12, paddingVertical:10, marginBottom:12 },
// //   createBtn: { marginBottom:14 },
// //   empRow: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:12, marginBottom:10, borderWidth:1 },
// //   empAvatar: { width:44, height:44, borderRadius:22 },
// //   miniTag: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:7, paddingVertical:3, borderRadius:6 },
// //   actionBtn: { width:34, height:34, borderRadius:10, justifyContent:'center', alignItems:'center' },
// //   newsItem: { flexDirection:'row', alignItems:'flex-start', borderRadius:14, padding:14, marginBottom:10, borderWidth:1 },
// //   statRow: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:14, marginBottom:10, borderWidth:1 },
// //   statIcon: { width:42, height:42, borderRadius:14, justifyContent:'center', alignItems:'center' },
// // });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Platform, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  RootState, AppDispatch,
  fetchEmployeesThunk, fetchNewsThunk,
  toggleEmployeeStatusThunk, deleteEmployeeThunk,
  deleteNewsThunk,
} from '../../store';
import { useTheme } from '../../hooks/useTheme';

export default function AdminPanelScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const allEmployees = useSelector((s: RootState) => s.employees.list);
  const allNews = useSelector((s: RootState) => s.news.list);
  const [tab, setTab] = useState<'employees' | 'news' | 'stats'>('employees');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
    dispatch(fetchNewsThunk());
  }, []);

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0A0A0F' : '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="lock-closed" size={60} color="#F44336" />
        <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Access Denied</Text>
        <Text style={{ color: '#888', fontSize: 13, marginTop: 8 }}>Admin/HR only</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12 }}>
          <Text style={{ color: '#F5A623', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filtered = allEmployees.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.employeeCode || '').toLowerCase().includes(search.toLowerCase())
  );

  // FIX: toggle enable/disable with proper refetch after success
  const handleToggle = useCallback(async (id: number, name: string, currentIsActive: boolean) => {
    Alert.alert(
      currentIsActive ? 'Disable Employee' : 'Enable Employee',
      currentIsActive
        ? `This will revoke ${name}'s app access. Continue?`
        : `Re-enable ${name}'s access?`,
      [
        {
          text: currentIsActive ? 'Disable' : 'Enable',
          style: currentIsActive ? 'destructive' : 'default',
          onPress: async () => {
            setTogglingId(id);
            try {
              const result = await dispatch(toggleEmployeeStatusThunk(id));
              if (toggleEmployeeStatusThunk.fulfilled.match(result)) {
                // Refetch to ensure server truth
                dispatch(fetchEmployeesThunk());
                Alert.alert(
                  'Done',
                  `${name} has been ${currentIsActive ? 'disabled' : 'enabled'} successfully.`
                );
              } else {
                // Revert optimistic update by refetching
                dispatch(fetchEmployeesThunk());
                Alert.alert('Error', (result.payload as string) || 'Failed to update employee status.');
              }
            } catch {
              dispatch(fetchEmployeesThunk());
              Alert.alert('Error', 'Something went wrong.');
            } finally {
              setTogglingId(null);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [dispatch]);

  const handleDelete = useCallback(async (id: number, name: string) => {
    Alert.alert('Delete Employee', `Permanently delete ${name}? This cannot be undone.`, [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            const result = await dispatch(deleteEmployeeThunk(id));
            if (deleteEmployeeThunk.fulfilled.match(result)) {
              Alert.alert('Deleted', `${name} has been removed.`);
            } else {
              Alert.alert('Error', (result.payload as string) || 'Failed to delete employee.');
            }
          } catch {
            Alert.alert('Error', 'Something went wrong.');
          } finally {
            setDeletingId(null);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [dispatch]);

  const handleDeleteNews = useCallback((id: number, title: string) => {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteNewsThunk(id)) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [dispatch]);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const activeCount   = allEmployees.filter(e => e.isActive).length;
  const inactiveCount = allEmployees.filter(e => !e.isActive).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={['#F5A623', '#E6940F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: '#000', fontSize: 18, fontWeight: '800' }}>Admin Panel</Text>
          <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12 }}>{currentUser.role.toUpperCase()} · {currentUser.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/screens/add-edit-employee' as any)}
          style={styles.addBtn}
        >
          <Ionicons name="person-add-outline" size={18} color="#000" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
        {[
          { label: 'Total',    value: allEmployees.length, color: '#2196F3' },
          { label: 'Active',   value: activeCount,         color: '#4CAF50' },
          { label: 'Inactive', value: inactiveCount,       color: '#F44336' },
          { label: 'News',     value: allNews.length,      color: '#F5A623' },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={{ color: s.color, fontSize: 20, fontWeight: '900' }}>{s.value}</Text>
            <Text style={{ color: sub, fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Sub Tabs */}
      <View style={[styles.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
        {(['employees', 'news', 'stats'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabItem, tab === t && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
            onPress={() => setTab(t)}
          >
            <Text style={{ color: tab === t ? '#F5A623' : sub, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* EMPLOYEES TAB */}
        {tab === 'employees' && (
          <View style={{ padding: 16 }}>
            <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="search-outline" size={16} color={sub} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search employees..."
                placeholderTextColor={sub}
                style={{ flex: 1, marginLeft: 8, color: txt, fontSize: 14 }}
              />
              {search !== '' && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={sub} />
                </TouchableOpacity>
              )}
            </View>

            {/* FIX: Add Employee button goes to correct route */}
            <TouchableOpacity
              onPress={() => router.push('/screens/add-edit-employee' as any)}
              style={styles.createBtn}
            >
              <LinearGradient
                colors={['#F5A623', '#E6940F']}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14 }}
              >
                <Ionicons name="person-add-outline" size={18} color="#000" />
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>Add New Employee</Text>
              </LinearGradient>
            </TouchableOpacity>

            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="people-outline" size={48} color={sub} />
                <Text style={{ color: sub, marginTop: 12 }}>No employees found</Text>
              </View>
            )}

            {filtered.map(emp => {
              const isToggling = togglingId === Number(emp.id);
              const isDeleting = deletingId === Number(emp.id);
              return (
                <View key={emp.id} style={[styles.empRow, { backgroundColor: cardBg, borderColor: border }]}>
                  <Image
                    source={{ uri: emp.avatar }}
                    style={[styles.empAvatar, { opacity: emp.isActive ? 1 : 0.4 }]}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>{emp.name}</Text>
                    <Text style={{ color: sub, fontSize: 11, marginTop: 1 }}>
                      {emp.designation} · {emp.employeeCode || emp.id}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <View style={[styles.miniTag, { backgroundColor: emp.isActive ? '#4CAF5020' : '#F4433620' }]}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: emp.isActive ? '#4CAF50' : '#F44336' }} />
                        <Text style={{ color: emp.isActive ? '#4CAF50' : '#F44336', fontSize: 9, fontWeight: '800' }}>
                          {emp.isActive ? 'ACTIVE' : 'DISABLED'}
                        </Text>
                      </View>
                      <View style={[styles.miniTag, { backgroundColor: '#F5A62310' }]}>
                        <Text style={{ color: '#F5A623', fontSize: 9, fontWeight: '700' }}>{emp.role.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {/* Edit */}
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]}
                      onPress={() => router.push(('/screens/add-edit-employee?id=' + emp.id) as any)}
                    >
                      <Ionicons name="create-outline" size={16} color="#2196F3" />
                    </TouchableOpacity>

                    {/* FIX: Toggle Enable/Disable — passes correct current state */}
                    <TouchableOpacity
                      style={[styles.actionBtn, {
                        backgroundColor: emp.isActive ? '#F4433615' : '#4CAF5015',
                        opacity: isToggling ? 0.5 : 1,
                      }]}
                      onPress={() => {
                        if (!isToggling) {
                          handleToggle(Number(emp.id), emp.name, emp.isActive);
                        }
                      }}
                      disabled={isToggling}
                    >
                      <Ionicons
                        name={isToggling ? 'time-outline' : emp.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={16}
                        color={emp.isActive ? '#F44336' : '#4CAF50'}
                      />
                    </TouchableOpacity>

                    {/* Delete (admin only) */}
                    {currentUser?.role === 'admin' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#F4433615', opacity: isDeleting ? 0.5 : 1 }]}
                        onPress={() => !isDeleting && handleDelete(Number(emp.id), emp.name)}
                        disabled={isDeleting}
                      >
                        <Ionicons name="trash-outline" size={16} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* NEWS TAB — FIX: "Create Announcement" goes to correct route */}
        {tab === 'news' && (
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={() => router.push('/screens/create-announcement' as any)}
              style={styles.createBtn}
            >
              <LinearGradient
                colors={['#E91E63', '#C2185B']}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14 }}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Create New Announcement</Text>
              </LinearGradient>
            </TouchableOpacity>

            {allNews.length === 0 && (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="newspaper-outline" size={48} color={sub} />
                <Text style={{ color: sub, marginTop: 12 }}>No announcements yet</Text>
              </View>
            )}

            {allNews.map((item: any) => (
              <View key={item.id} style={[styles.newsItem, { backgroundColor: cardBg, borderColor: border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                    {(item.isPinned || item.pinned) && (
                      <View style={[styles.miniTag, { backgroundColor: '#F5A62320' }]}>
                        <Text style={{ color: '#F5A623', fontSize: 9, fontWeight: '800' }}>PINNED</Text>
                      </View>
                    )}
                    {(item.isUrgent || item.urgent) && (
                      <View style={[styles.miniTag, { backgroundColor: '#F4433620' }]}>
                        <Text style={{ color: '#F44336', fontSize: 9, fontWeight: '800' }}>URGENT</Text>
                      </View>
                    )}
                    <View style={[styles.miniTag, { backgroundColor: '#2196F320' }]}>
                      <Text style={{ color: '#2196F3', fontSize: 9, fontWeight: '800' }}>{item.category}</Text>
                    </View>
                  </View>
                  <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }} numberOfLines={2}>{item.title}</Text>
                  <Text style={{ color: sub, fontSize: 11, marginTop: 4 }}>
                    {item.authorName || item.author} · {item.publishedAt || item.date} · {item.views} views
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginLeft: 10 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F0F4FF' }]}
                    onPress={() => router.push(('/screens/create-announcement?id=' + item.id) as any)}
                  >
                    <Ionicons name="create-outline" size={16} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#F4433615' }]}
                    onPress={() => handleDeleteNews(Number(item.id), item.title)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <View style={{ padding: 16 }}>
            {[
              { label: 'Total Employees',   value: allEmployees.length,                                    icon: 'people',         color: '#2196F3' },
              { label: 'Active Employees',  value: activeCount,                                            icon: 'checkmark-circle',color: '#4CAF50' },
              { label: 'Disabled Accounts', value: inactiveCount,                                          icon: 'pause-circle',   color: '#F44336' },
              { label: 'Admins',            value: allEmployees.filter(e => e.role === 'admin').length,    icon: 'shield',         color: '#F5A623' },
              { label: 'HR Team',           value: allEmployees.filter(e => e.role === 'hr').length,       icon: 'people-circle',  color: '#E91E63' },
              { label: 'Managers',          value: allEmployees.filter(e => e.role === 'manager').length,  icon: 'briefcase',      color: '#9C27B0' },
              { label: 'Employees',         value: allEmployees.filter(e => e.role === 'employee').length, icon: 'person',         color: '#00BCD4' },
              { label: 'Monk Outsourcing',  value: allEmployees.filter(e => e.company === 'monk-outsourcing').length,  icon: 'business', color: '#F5A623' },
              { label: 'Monk Travel Tech',  value: allEmployees.filter(e => e.company === 'monk-travel-tech').length,  icon: 'airplane', color: '#00BCD4' },
            ].map(item => (
              <View key={item.label} style={[styles.statRow, { backgroundColor: cardBg, borderColor: border }]}>
                <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={{ color: txt, fontSize: 14, fontWeight: '600', flex: 1, marginLeft: 12 }}>{item.label}</Text>
                <Text style={{ color: item.color, fontSize: 22, fontWeight: '900' }}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  addBtn:    { width: 38, height: 38, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statsRow:  { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 12 },
  statItem:  { flex: 1, alignItems: 'center' },
  tabRow:    { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem:   { flex: 1, paddingVertical: 12, alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  createBtn: { marginBottom: 14 },
  empRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1 },
  empAvatar: { width: 44, height: 44, borderRadius: 22 },
  miniTag:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  newsItem:  { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  statRow:   { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  statIcon:  { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});