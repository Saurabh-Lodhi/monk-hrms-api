import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Dimensions, Image, RefreshControl,
  Platform, ActivityIndicator, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  RootState, AppDispatch,
  checkInThunk, checkOutThunk,
  fetchMyAttendanceThunk, fetchTodayAttendanceThunk,
  fetchEmployeesThunk, fetchNewsThunk,
  fetchEventsThunk, fetchNotificationsThunk,
  fetchLeaveBalanceThunk,
} from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { COMPANIES, DEPARTMENTS } from '../../data/company';

// const { width } = Dimensions.get('window');
// const CARD_W = (width - 52) / 4;

const screenWidth = Dimensions.get('window').width;
const CARD_W = screenWidth > 600
  ? (screenWidth - 80) / 4
  : (screenWidth - 48) / 4;

const QUICK_ACTIONS = [
  { id:'qa1', label:'Apply\nLeave',  icon:'calendar-outline',        route:'/screens/apply-leave',       color:'#4CAF50', bg:'rgba(76,175,80,0.15)'  },
  { id:'qa2', label:'Salary\nSlip',  icon:'document-text-outline',   route:'/screens/salary-slip',       color:'#2196F3', bg:'rgba(33,150,243,0.15)' },
  { id:'qa3', label:'Directory',     icon:'people-outline',           route:'/screens/all-employees',     color:'#9C27B0', bg:'rgba(156,39,176,0.15)' },
  { id:'qa4', label:'Org\nChart',    icon:'git-network-outline',      route:'/screens/org-chart',         color:'#F5A623', bg:'rgba(245,166,35,0.15)' },
  { id:'qa5', label:'Policies',      icon:'shield-checkmark-outline', route:'/screens/policies',          color:'#E91E63', bg:'rgba(233,30,99,0.15)'  },
  { id:'qa6', label:'Events',        icon:'star-outline',             route:'/screens/events',            color:'#00BCD4', bg:'rgba(0,188,212,0.15)'  },
  { id:'qa7', label:'Attendance',    icon:'stats-chart-outline',      route:'/screens/attendance-detail', color:'#FF9800', bg:'rgba(255,152,0,0.15)'  },
  { id:'qa8', label:'Updates',       icon:'newspaper-outline',        route:'/(tabs)/more',               color:'#795548', bg:'rgba(121,85,72,0.15)'  },
];

const ROLE_COLOR = { admin:'#F5A623', hr:'#E91E63', manager:'#2196F3', employee:'#4CAF50' } as Record<string,string>;

const fmtDate = (d:Date) => d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
const fmtShort = (s:string) => new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short'});

export default function HomeScreen() {
  const { isDark, theme, colors } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const currentUser  = useSelector((s:RootState) => s.auth.user);
  const todayStatus  = useSelector((s:RootState) => s.today);
  const unreadCount  = useSelector((s:RootState) => s.notif.unread);
  const allEmployees = useSelector((s:RootState) => s.employees.list);
  const attendance   = useSelector((s:RootState) => s.attendance.records);
  const newsItems    = useSelector((s:RootState) => s.news.list);
  const events       = useSelector((s:RootState) => s.events.list);
  const leaveBalance = useSelector((s:RootState) => s.leave.balance);
  const newsLoading  = useSelector((s:RootState) => s.news.loading);

  const [greeting,   setGreeting]   = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchAll = useCallback(() => {
    dispatch(fetchTodayAttendanceThunk());
    dispatch(fetchMyAttendanceThunk({}));
    dispatch(fetchEmployeesThunk());
    dispatch(fetchNewsThunk());
    dispatch(fetchEventsThunk());
    dispatch(fetchNotificationsThunk());
    dispatch(fetchLeaveBalanceThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
    const h = new Date().getHours();
    setGreeting(h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening');
    Animated.parallel([
      Animated.timing(fadeAnim,  {toValue:1,duration:500,useNativeDriver:true}),
      Animated.spring(slideAnim, {toValue:0,useNativeDriver:true,tension:80,friction:10}),
    ]).start();
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim,{toValue:1.06,duration:800,useNativeDriver:true}),
      Animated.timing(pulseAnim,{toValue:1,   duration:800,useNativeDriver:true}),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchTodayAttendanceThunk()), dispatch(fetchMyAttendanceThunk({})),
      dispatch(fetchEmployeesThunk()),       dispatch(fetchNewsThunk()),
      dispatch(fetchEventsThunk()),          dispatch(fetchNotificationsThunk()),
      dispatch(fetchLeaveBalanceThunk()),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const today         = new Date().toISOString().split('T')[0];
  const presentDays   = attendance.filter((a:any)=>a.status==='present'||a.status==='late').length;
  const absentDays    = attendance.filter((a:any)=>a.status==='absent').length;
  const lateDays      = attendance.filter((a:any)=>a.status==='late').length;
  const totalLeave    = leaveBalance ? (leaveBalance.CL||0)+(leaveBalance.SL||0)+(leaveBalance.EL||0) : 0;
  const todayEvts     = events.filter((e:any)=>e.eventDate?.split('T')[0]===today);
  const celebrations  = events
    .filter((e:any)=>(e.type==='birthday'||e.type==='anniversary')&&e.eventDate?.split('T')[0]>=today)
    .slice(0,5);
  const myTeam = currentUser
    ? allEmployees.filter((e:any)=>(e.reportingToId===currentUser.id||e.id===currentUser.reportingToId)&&e.id!==currentUser.id).slice(0,6)
    : [];

  const company   = currentUser ? COMPANIES[currentUser.company] : null;
  const roleColor = currentUser ? (ROLE_COLOR[currentUser.role]||'#F5A623') : '#F5A623';
  const dept      = currentUser ? DEPARTMENTS.find((d:any)=>d.id===currentUser.department) : null;
  const bg=theme.bg; const cardBg=theme.bgCard; const border=theme.border;
  const txt=theme.text; const sub=theme.textSub; const muted=theme.textMuted;

  const isIn   = todayStatus.status==='in';
  const isDone = todayStatus.status==='done';
  const isOut  = todayStatus.status==='out';
  const attColors:[string,string] = isIn?['#1B5E20','#2E7D32']:isDone?['#0D47A1','#1565C0']:isDark?['#141420','#1A1A2E']:['#FFFFFF','#EEF2FF'];

  return (
    <View style={{flex:1,backgroundColor:bg}}>
      <StatusBar barStyle={isDark?'light-content':'dark-content'} translucent />
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} />}
        contentContainerStyle={{paddingBottom:100}}
      >
        {/* ── STICKY HEADER ─────────────────────────────────── */}
        <LinearGradient colors={isDark?['#0D0D18','#0D0D18F5']:['#FFFFFFF5','#F0F4FFF0']} style={s.header}>
          <TouchableOpacity style={s.headerLeft} onPress={()=>router.push((`/screens/employee-detail?id=${currentUser?.id}`) as any)} activeOpacity={0.85}>
            <View style={{position:'relative'}}>
              {currentUser?.avatar
                ?<Image source={{uri:currentUser.avatar}} style={s.avatar}/>
                :<View style={[s.avatar,{backgroundColor:roleColor,justifyContent:'center',alignItems:'center'}]}>
                  <Text style={{color:'#000',fontWeight:'900',fontSize:18}}>{currentUser?.name?.[0]}</Text>
                </View>
              }
              <View style={[s.onlineDot,{backgroundColor:colors.success,borderColor:bg}]}/>
            </View>
            <View style={{marginLeft:12,flex:1}}>
              <Text style={{fontSize:11,fontWeight:'600',color:muted,letterSpacing:0.2}}>{greeting} 👋</Text>
              <Text style={{fontSize:17,fontWeight:'800',color:txt,letterSpacing:-0.3,marginTop:1}} numberOfLines={1}>{currentUser?.name}</Text>
              {dept&&<View style={[s.deptPill,{backgroundColor:(dept.color||roleColor)+'20'}]}>
                <Text style={{fontSize:10,fontWeight:'700',color:dept.color||roleColor}}>{dept.name}</Text>
              </View>}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.notifBtn,{backgroundColor:isDark?'#1A1A2E':'#EEF2FF'}]} onPress={()=>router.push('/screens/notifications' as any)} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color={txt}/>
            {unreadCount>0&&<View style={s.badge}><Text style={s.badgeTxt}>{unreadCount>9?'9+':unreadCount}</Text></View>}
          </TouchableOpacity>
        </LinearGradient>

        <Animated.View style={{opacity:fadeAnim,transform:[{translateY:slideAnim}]}}>

          {/* ── COMPANY BANNER ──────────────────────────────── */}
          <View style={{paddingHorizontal:16,marginTop:14,marginBottom:todayEvts.length?8:12}}>
            <View style={[s.companyBanner,{backgroundColor:cardBg,borderColor:border}]}>
              <View style={[s.companyDot,{backgroundColor:company?.primaryColor||roleColor}]}/>
              <Text style={{fontSize:14,fontWeight:'700',color:txt,flex:1}} numberOfLines={1}>{company?.name||'Monk Group'}</Text>
              <View style={[s.rolePill,{backgroundColor:roleColor+'20',borderColor:roleColor+'40'}]}>
                <Text style={{fontSize:10,fontWeight:'800',color:roleColor,letterSpacing:0.5}}>{currentUser?.role?.toUpperCase()}</Text>
              </View>
              <Text style={{fontSize:12,color:sub}} numberOfLines={1}>{currentUser?.designation}</Text>
            </View>
          </View>

          {/* ── TODAY ALERTS ────────────────────────────────── */}
          {todayEvts.length>0&&(
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginHorizontal:16,marginBottom:10}} contentContainerStyle={{gap:8}}>
              {todayEvts.map((e:any)=>(
                <LinearGradient key={e.id} colors={[e.color+'DD',e.color+'99']} style={s.alertChip}>
                  <Text style={{color:'#FFF',fontSize:12,fontWeight:'700'}} numberOfLines={1}>{e.title}</Text>
                </LinearGradient>
              ))}
            </ScrollView>
          )}

          {/* ── ATTENDANCE CARD ─────────────────────────────── */}
          <View style={{paddingHorizontal:16,marginBottom:14}}>
            <LinearGradient colors={attColors} style={[s.attCard,{borderColor:isOut?border:'transparent',borderWidth:isOut?1:0}]}>
              {/* Top row */}
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <View>
                  <View style={{flexDirection:'row',alignItems:'center',gap:6,marginBottom:4}}>
                    <View style={[s.statusDot,{backgroundColor:isIn?'#4CAF50':isDone?'#2196F3':isDark?'#444':'#CCC'}]}/>
                    <Text style={{fontSize:12,fontWeight:'600',color:isOut?(isDark?'#888':'#AAA'):'rgba(255,255,255,0.7)'}}>
                      {isOut?'Not checked in':isIn?'● Live · Checked in':'✓ Day complete'}
                    </Text>
                  </View>
                  <Text style={{fontSize:17,fontWeight:'800',letterSpacing:-0.2,color:isOut?txt:'#FFF'}}>{fmtDate(new Date())}</Text>
                </View>
                <View style={[s.fpTag,{backgroundColor:'rgba(245,166,35,0.15)',borderColor:'rgba(245,166,35,0.3)'}]}>
                  <Ionicons name="finger-print" size={13} color="#F5A623"/>
                  <Text style={{color:'#F5A623',fontSize:9,fontWeight:'800',letterSpacing:0.5,marginLeft:4}}>BIOMETRIC</Text>
                </View>
              </View>

              {/* Times */}
              <View style={{flexDirection:'row',alignItems:'center',marginBottom:16}}>
                {[{lbl:'Check In',val:todayStatus.checkIn||'--:--'},{lbl:'Check Out',val:todayStatus.checkOut||'--:--'},{lbl:'Status',val:isIn?'Live':isDone?'Done':'--'}].map((t,i)=>(
                  <React.Fragment key={t.lbl}>
                    {i>0&&<View style={{width:1,height:36,backgroundColor:'rgba(255,255,255,0.15)',marginHorizontal:4}}/>}
                    <View style={{flex:1,alignItems:'center',gap:3}}>
                      <Text style={{fontSize:11,fontWeight:'500',color:isOut?muted:'rgba(255,255,255,0.55)'}}>{t.lbl}</Text>
                      <Text style={{fontWeight:'800',letterSpacing:-0.5,fontSize:i===2?14:20,color:i===2?'#F5A623':isOut?txt:'#FFF'}}>{t.val}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              {/* Actions */}
              <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                {isOut&&(
                  <Animated.View style={{flex:1,transform:[{scale:pulseAnim}]}}>
                    <TouchableOpacity onPress={()=>dispatch(checkInThunk())} disabled={todayStatus.loading} activeOpacity={0.88}>
                      <LinearGradient colors={['#F5A623','#E6940F']} style={s.actionBtn}>
                        {todayStatus.loading?<ActivityIndicator color="#000" size="small"/>:<>
                          <Ionicons name="log-in-outline" size={17} color="#000"/>
                          <Text style={{fontWeight:'800',fontSize:14,color:'#000'}}>Check In</Text>
                        </>}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                )}
                {isIn&&(
                  <TouchableOpacity style={{flex:1}} onPress={()=>dispatch(checkOutThunk())} disabled={todayStatus.loading} activeOpacity={0.88}>
                    <LinearGradient colors={['#EF5350','#C62828']} style={s.actionBtn}>
                      {todayStatus.loading?<ActivityIndicator color="#FFF" size="small"/>:<>
                        <Ionicons name="log-out-outline" size={17} color="#FFF"/>
                        <Text style={{fontWeight:'800',fontSize:14,color:'#FFF'}}>Check Out</Text>
                      </>}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {isDone&&(
                  <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6}}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50"/>
                    <Text style={{color:'#4CAF50',fontWeight:'800',fontSize:14}}>Day Complete!</Text>
                  </View>
                )}
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:3,paddingHorizontal:10,paddingVertical:8}} onPress={()=>router.push('/screens/attendance-detail' as any)} activeOpacity={0.8}>
                  <Text style={{color:'#F5A623',fontSize:12,fontWeight:'700'}}>View Log</Text>
                  <Ionicons name="chevron-forward" size={13} color="#F5A623"/>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* ── STATS ───────────────────────────────────────── */}
          <View style={{flexDirection:'row',paddingHorizontal:16,gap:8,marginBottom:4}}>
            {[
              {lbl:'Present',val:presentDays,icon:'checkmark-circle',color:'#4CAF50'},
              {lbl:'Absent', val:absentDays, icon:'close-circle',    color:'#F44336'},
              {lbl:'Late',   val:lateDays,   icon:'time',            color:'#FF9800'},
              {lbl:'Leave',  val:totalLeave, icon:'calendar',        color:'#2196F3'},
            ].map(st=>(
              <View key={st.lbl} style={[s.statCard,{backgroundColor:cardBg,borderColor:border}]}>
                <View style={[s.statIcon,{backgroundColor:st.color+'18'}]}>
                  <Ionicons name={st.icon as any} size={15} color={st.color}/>
                </View>
                <Text style={{fontSize:17,fontWeight:'900',color:txt,letterSpacing:-0.5}}>{st.val}</Text>
                <Text style={{fontSize:9,fontWeight:'700',color:muted,textTransform:'uppercase',letterSpacing:0.4}}>{st.lbl}</Text>
              </View>
            ))}
          </View>

          {/* ── QUICK ACTIONS ───────────────────────────────── */}
          <View style={{paddingHorizontal:16,marginTop:22}}>
            <Text style={{fontSize:16,fontWeight:'800',color:txt,letterSpacing:-0.3,marginBottom:12}}>Quick Actions</Text>
            {/* <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}> */}
            <View style={{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', rowGap:10 }}>
              {QUICK_ACTIONS.map(qa=>(
                <Pressable
                  key={qa.id}
                  style={({pressed})=>[s.qaCard,{backgroundColor:cardBg,borderColor:border},pressed&&{opacity:0.72,transform:[{scale:0.95}]}]}
                  onPress={()=>router.push(qa.route as any)}
                >
                  <View style={[s.qaIcon,{backgroundColor:qa.bg}]}>
                    <Ionicons name={qa.icon as any} size={20} color={qa.color}/>
                  </View>
                  <Text style={{fontSize:10,fontWeight:'700',color:sub,textAlign:'center',lineHeight:14}}>{qa.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── CELEBRATIONS ────────────────────────────────── */}
          {celebrations.length>0&&(
            <View style={{paddingHorizontal:16,marginTop:22}}>
              <Text style={{fontSize:16,fontWeight:'800',color:txt,letterSpacing:-0.3,marginBottom:12}}>🎉 Celebrations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10}}>
                {celebrations.map((evt:any)=>{
                  const emp  = allEmployees.find((e:any)=>e.id===evt.relatedEmployeeId);
                  const evtDate = evt.eventDate?.split('T')[0];
                  const isTdy  = evtDate===today;
                  return (
                    <TouchableOpacity key={evt.id} style={[s.celebCard,{backgroundColor:cardBg,borderColor:isTdy?evt.color:border,borderWidth:isTdy?1.5:1}]} onPress={()=>emp&&router.push((`/screens/employee-detail?id=${emp.id}`) as any)} activeOpacity={0.82}>
                      <LinearGradient colors={[evt.color+'35',evt.color+'10']} style={{alignItems:'center',paddingVertical:14,paddingHorizontal:8,gap:5}}>
                        {emp?.avatar
                          ?<Image source={{uri:emp.avatar}} style={s.celebAvatar}/>
                          :<View style={[s.celebAvatar,{backgroundColor:evt.color+'40',justifyContent:'center',alignItems:'center'}]}><Text style={{fontSize:20}}>👤</Text></View>
                        }
                        <Text style={{fontSize:18,marginTop:2}}>{evt.type==='birthday'?'🎂':'🏆'}</Text>
                        <Text style={{fontSize:11,fontWeight:'800',color:txt,textAlign:'center'}} numberOfLines={1}>{emp?.name?.split(' ')[0]||evt.title?.split(' ')[0]}</Text>
                        <View style={[s.celebDatePill,{backgroundColor:evt.color+'25'}]}>
                          <Text style={{fontSize:9,fontWeight:'800',color:evt.color}}>{isTdy?'🎊 Today!':fmtShort(evtDate)}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── HR UPDATES ──────────────────────────────────── */}
          <View style={{paddingHorizontal:16,marginTop:22}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <Text style={{fontSize:16,fontWeight:'800',color:txt,letterSpacing:-0.3}}>HR Updates</Text>
              <TouchableOpacity onPress={()=>router.push('/(tabs)/more' as any)} activeOpacity={0.7}>
                <Text style={{fontSize:13,fontWeight:'700',color:colors.gold}}>See All →</Text>
              </TouchableOpacity>
            </View>
            {newsLoading&&!newsItems.length
              ?<ActivityIndicator color={colors.gold} style={{marginTop:16}}/>
              :newsItems.length===0
                ?<Text style={{color:muted,textAlign:'center',marginTop:12,fontSize:13}}>No updates yet.</Text>
                :newsItems.slice(0,3).map((item:any)=>(
                  <TouchableOpacity key={item.id} style={[s.newsCard,{backgroundColor:cardBg,borderColor:border}]} onPress={()=>router.push((`/screens/news-detail?id=${item.id}`) as any)} activeOpacity={0.82}>
                    {(item.isUrgent||item.urgent)&&<View style={s.urgentStripe}/>}
                    <View style={{flex:1,padding:13}}>
                      <View style={{flexDirection:'row',gap:6,marginBottom:7,flexWrap:'wrap'}}>
                        <View style={[s.newsTag,{backgroundColor:colors.gold+'20'}]}>
                          <Text style={{fontSize:9,fontWeight:'800',color:colors.gold,letterSpacing:0.3}}>{item.category}</Text>
                        </View>
                        {(item.isUrgent||item.urgent)&&<View style={[s.newsTag,{backgroundColor:'#F4433620'}]}><Text style={{fontSize:9,fontWeight:'800',color:'#F44336',letterSpacing:0.3}}>URGENT</Text></View>}
                        {(item.isPinned||item.pinned)&&<View style={[s.newsTag,{backgroundColor:colors.gold+'15'}]}><Text style={{fontSize:9,fontWeight:'800',color:colors.gold,letterSpacing:0.3}}>📌 PINNED</Text></View>}
                      </View>
                      <Text style={{fontSize:13,fontWeight:'700',color:txt,lineHeight:18}} numberOfLines={2}>{item.title}</Text>
                      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:7}}>
                        <Text style={{fontSize:11,color:muted}}>{item.authorName||item.author||'HR Team'}</Text>
                        <Text style={{fontSize:11,color:muted}}>
                          {item.publishedAt?new Date(item.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):item.date}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={isDark?'#3A3A55':'#C8D0E8'} style={{marginRight:12}}/>
                  </TouchableOpacity>
                ))
            }
          </View>

          {/* ── MY TEAM ─────────────────────────────────────── */}
          {myTeam.length>0&&(
            <View style={{paddingHorizontal:16,marginTop:22}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <Text style={{fontSize:16,fontWeight:'800',color:txt,letterSpacing:-0.3}}>My Team</Text>
                <TouchableOpacity onPress={()=>router.push('/screens/all-employees' as any)} activeOpacity={0.7}>
                  <Text style={{fontSize:13,fontWeight:'700',color:colors.gold}}>View All →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10}}>
                {myTeam.map((emp:any)=>{
                  const ec = ROLE_COLOR[emp.role]||'#888';
                  return (
                    <TouchableOpacity key={emp.id} style={[s.teamCard,{backgroundColor:cardBg,borderColor:border}]} onPress={()=>router.push((`/screens/employee-detail?id=${emp.id}`) as any)} activeOpacity={0.82}>
                      <View style={{position:'relative',marginBottom:4}}>
                        {emp.avatar
                          ?<Image source={{uri:emp.avatar}} style={s.teamAvatar}/>
                          :<View style={[s.teamAvatar,{backgroundColor:ec+'30',justifyContent:'center',alignItems:'center'}]}>
                            <Text style={{color:ec,fontWeight:'900',fontSize:16}}>{emp.name?.[0]}</Text>
                          </View>
                        }
                        <View style={[s.teamOnline,{backgroundColor:emp.isActive?'#4CAF50':'#F44336',borderColor:cardBg}]}/>
                      </View>
                      <Text style={{fontSize:11,fontWeight:'800',color:txt,textAlign:'center'}} numberOfLines={1}>{emp.name?.split(' ')[0]}</Text>
                      <Text style={{fontSize:9,color:muted,textAlign:'center',paddingHorizontal:4}} numberOfLines={1}>{emp.designation?.split(' ').slice(0,2).join(' ')}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  // Header
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:Platform.OS==='ios'?52:Platform.OS==='android'?44:20,paddingBottom:14},
  headerLeft:{flexDirection:'row',alignItems:'center',flex:1},
  avatar:{width:46,height:46,borderRadius:23,borderWidth:2.5,borderColor:'#F5A623'},
  onlineDot:{width:11,height:11,borderRadius:6,position:'absolute',bottom:0,right:0,borderWidth:2},
  deptPill:{alignSelf:'flex-start',paddingHorizontal:7,paddingVertical:2,borderRadius:6,marginTop:4},
  notifBtn:{width:40,height:40,borderRadius:13,justifyContent:'center',alignItems:'center',position:'relative'},
  badge:{position:'absolute',top:-3,right:-3,backgroundColor:'#F44336',borderRadius:8,minWidth:16,height:16,justifyContent:'center',alignItems:'center',paddingHorizontal:2},
  badgeTxt:{color:'#FFF',fontSize:9,fontWeight:'900'},
  // Company
  companyBanner:{flexDirection:'row',alignItems:'center',gap:10,borderRadius:14,padding:13,borderWidth:1},
  companyDot:{width:9,height:9,borderRadius:5},
  rolePill:{paddingHorizontal:9,paddingVertical:3,borderRadius:8,borderWidth:1},
  // Alert
  alertChip:{paddingHorizontal:14,paddingVertical:7,borderRadius:20},
  // Attendance
  attCard:{borderRadius:22,padding:18},
  statusDot:{width:8,height:8,borderRadius:4},
  fpTag:{flexDirection:'row',alignItems:'center',paddingHorizontal:9,paddingVertical:5,borderRadius:9,borderWidth:1},
  actionBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,borderRadius:13,paddingVertical:12},
  // Stats
  statCard:{flex:1,alignItems:'center',paddingVertical:12,borderRadius:14,borderWidth:1,gap:5},
  statIcon:{width:30,height:30,borderRadius:9,justifyContent:'center',alignItems:'center'},
  // Quick Actions
  qaCard:{width:CARD_W,alignItems:'center',justifyContent:'center',paddingVertical:14,borderRadius:16,borderWidth:1,marginBottom:10},
  qaIcon:{width:42,height:42,borderRadius:13,justifyContent:'center',alignItems:'center'},
  // Celebrations
  celebCard:{width:96,borderRadius:16,overflow:'hidden'},
  celebAvatar:{width:46,height:46,borderRadius:23},
  celebDatePill:{paddingHorizontal:7,paddingVertical:2,borderRadius:8,marginTop:2},
  // News
  newsCard:{flexDirection:'row',alignItems:'center',borderRadius:14,marginBottom:9,borderWidth:1,overflow:'hidden'},
  urgentStripe:{width:4,backgroundColor:'#F44336',alignSelf:'stretch'},
  newsTag:{paddingHorizontal:7,paddingVertical:3,borderRadius:6},
  // Team
  teamCard:{width:82,alignItems:'center',paddingVertical:13,borderRadius:16,borderWidth:1,gap:2},
  teamAvatar:{width:44,height:44,borderRadius:22},
  teamOnline:{width:11,height:11,borderRadius:6,position:'absolute',bottom:0,right:0,borderWidth:2},
});