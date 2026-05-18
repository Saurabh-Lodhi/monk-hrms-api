
import React, { useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  RootState, AppDispatch,
  fetchNotificationsThunk, markReadThunk, markAllReadThunk,
} from '../../store';
import { useTheme } from '../../hooks/useTheme';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  birthday:    { icon: '🎂', color: '#E91E63' },
  anniversary: { icon: '🏆', color: '#F5A623' },
  leave:       { icon: '📅', color: '#4CAF50' },
  salary:      { icon: '💰', color: '#F5A623' },
  event:       { icon: '🎉', color: '#9C27B0' },
  policy:      { icon: '📋', color: '#2196F3' },
  general:     { icon: '🔔', color: '#888888' },
};

const resolveRoute = (actionRoute?: string): string | null => {
  if (!actionRoute) return null;
  if (actionRoute.startsWith('/(tabs)')) return actionRoute;
  if (actionRoute.startsWith('/screens/')) return actionRoute;
  return null;
};

export default function NotificationsScreen() {
  const { isDark, theme } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const list   = useSelector((s: RootState) => s.notif.list);
  const unread = useSelector((s: RootState) => s.notif.unread);

  useEffect(() => { dispatch(fetchNotificationsThunk()); }, []);

  const bg     = theme.bg;
  const cardBg = theme.bgCard;
  const txt    = theme.text;
  const sub    = theme.textSub;
  const border = theme.border;

  const handlePress = async (item: any) => {
    const isRead = item.isRead || item.read;
    if (!isRead) await dispatch(markReadThunk(item.id));
    const route = resolveRoute(item.actionRoute);
    if (route) {
      try { router.push(route as any); } catch { /* ignore */ }
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllReadThunk()).then(() => dispatch(fetchNotificationsThunk()));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.headerTitle, { color: txt }]}>Notifications</Text>
          <Text style={[s.headerSub, { color: sub }]}>
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={[s.markAllBtn, { borderColor: border }]}>
            <Text style={{ color: '#F5A623', fontWeight: '700', fontSize: 12 }}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={list}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onRefresh={() => dispatch(fetchNotificationsThunk())}
        refreshing={false}
        renderItem={({ item }: any) => {
          const cfg    = TYPE_ICONS[item.type] || TYPE_ICONS.general;
          const isRead = item.isRead || item.read;
          const route  = resolveRoute(item.actionRoute);

          return (
            <TouchableOpacity
              style={[
                s.notifCard,
                {
                  backgroundColor: isRead ? cardBg : (isDark ? '#1A1A2E' : '#EEF2FF'),
                  borderColor:     isRead ? border  : (isDark ? '#3A3A55' : '#C8D3FF'),
                  borderLeftColor: cfg.color,
                },
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.82}
            >
              <View style={[s.notifIcon, { backgroundColor: cfg.color + '20' }]}>
                <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.notifTitle, { color: txt, fontWeight: isRead ? '600' : '800' }]}>
                  {item.title}
                </Text>
                <Text style={[s.notifMsg, { color: sub }]}>{item.message}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={[s.notifTime, { color: sub }]}>{item.createdAt || item.time}</Text>
                  {route && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="open-outline" size={10} color={sub} />
                      <Text style={{ color: sub, fontSize: 10 }}>Tap to open</Text>
                    </View>
                  )}
                </View>
              </View>
              {!isRead && <View style={[s.unreadDot, { backgroundColor: cfg.color }]} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={sub} />
            <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub:   { fontSize: 12, marginTop: 2 },
  markAllBtn:  { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  notifCard:   { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
  notifIcon:   { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifTitle:  { fontSize: 13, lineHeight: 18 },
  notifMsg:    { fontSize: 12, marginTop: 4, lineHeight: 17 },
  notifTime:   { fontSize: 11 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginLeft: 8 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
});

// // import React, { useEffect } from 'react';
// // import {
// //   View, Platform, Text, StyleSheet, FlatList, TouchableOpacity,
// //   SafeAreaView, StatusBar,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useSelector, useDispatch } from 'react-redux';
// // import {
// //   RootState, AppDispatch,
// //   fetchNotificationsThunk, markReadThunk, markAllReadThunk,
// // } from '../../store';
// // import { useTheme } from '../../hooks/useTheme';

// // const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
// //   birthday:    { icon: '🎂', color: '#E91E63' },
// //   anniversary: { icon: '🏆', color: '#F5A623' },
// //   leave:       { icon: '📅', color: '#4CAF50' },
// //   salary:      { icon: '💰', color: '#F5A623' },
// //   event:       { icon: '🎉', color: '#9C27B0' },
// //   policy:      { icon: '📋', color: '#2196F3' },
// //   general:     { icon: '🔔', color: '#888888' },
// // };

// // export default function NotificationsScreen() {
// //   const { isDark, theme } = useTheme();
// //   const router   = useRouter();
// //   const dispatch = useDispatch<AppDispatch>();

// //   // ← Use correct field names from store slice: list + unread
// //   const list      = useSelector((s: RootState) => s.notif.list);
// //   const unread    = useSelector((s: RootState) => s.notif.unread);

// //   useEffect(() => { dispatch(fetchNotificationsThunk()); }, []);

// //   const bg     = theme.bg;
// //   const cardBg = theme.bgCard;
// //   const txt    = theme.text;
// //   const sub    = theme.textSub;
// //   const border = theme.border;

// //   const handleMarkRead = (id: number, isRead: boolean) => {
// //     if (!isRead) dispatch(markReadThunk(id));
// //   };

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
// //       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

// //       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
// //         <TouchableOpacity onPress={() => router.back()}>
// //           <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
// //         </TouchableOpacity>
// //         <View style={{ flex: 1, marginLeft: 12 }}>
// //           <Text style={[s.headerTitle, { color: txt }]}>Notifications</Text>
// //           <Text style={[s.headerSub, { color: sub }]}>{unread} unread</Text>
// //         </View>
// //         {unread > 0 && (
// //           <TouchableOpacity
// //             onPress={() => dispatch(markAllReadThunk())}
// //             style={[s.markAllBtn, { borderColor: border }]}
// //           >
// //             <Text style={{ color: '#F5A623', fontWeight: '700', fontSize: 12 }}>Mark All Read</Text>
// //           </TouchableOpacity>
// //         )}
// //       </LinearGradient>

// //       <FlatList
// //         data={list}
// //         keyExtractor={(item: any) => String(item.id)}
// //         contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
// //         showsVerticalScrollIndicator={false}
// //         renderItem={({ item }: any) => {
// //           const cfg    = TYPE_ICONS[item.type] || TYPE_ICONS.general;
// //           const isRead = item.isRead || item.read;
// //           return (
// //             <TouchableOpacity
// //               style={[
// //                 s.notifCard,
// //                 {
// //                   backgroundColor: isRead ? cardBg : (isDark ? '#1A1A2E' : '#EEF2FF'),
// //                   borderColor:     isRead ? border  : (isDark ? '#3A3A55' : '#C8D3FF'),
// //                   borderLeftColor: cfg.color,
// //                 },
// //               ]}
// //               onPress={() => handleMarkRead(item.id, isRead)}
// //               activeOpacity={0.82}
// //             >
// //               <View style={[s.notifIcon, { backgroundColor: cfg.color + '20' }]}>
// //                 <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
// //               </View>
// //               <View style={{ flex: 1, marginLeft: 12 }}>
// //                 <Text style={[s.notifTitle, { color: txt, fontWeight: isRead ? '600' : '800' }]}>{item.title}</Text>
// //                 <Text style={[s.notifMsg,   { color: sub }]}>{item.message}</Text>
// //                 <Text style={[s.notifTime,  { color: sub }]}>{item.createdAt || item.time}</Text>
// //               </View>
// //               {!isRead && <View style={[s.unreadDot, { backgroundColor: cfg.color }]} />}
// //             </TouchableOpacity>
// //           );
// //         }}
// //         ListEmptyComponent={
// //           <View style={s.empty}>
// //             <Ionicons name="notifications-off-outline" size={48} color={sub} />
// //             <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No notifications yet</Text>
// //           </View>
// //         }
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const s = StyleSheet.create({
// //   header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
// //   headerTitle:{ fontSize: 20, fontWeight: '800' },
// //   headerSub:  { fontSize: 12, marginTop: 2 },
// //   markAllBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
// //   notifCard:  { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
// //   notifIcon:  { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
// //   notifTitle: { fontSize: 13, lineHeight: 18 },
// //   notifMsg:   { fontSize: 12, marginTop: 4, lineHeight: 17 },
// //   notifTime:  { fontSize: 11, marginTop: 6 },
// //   unreadDot:  { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginLeft: 8 },
// //   empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
// // });
// import React, { useEffect } from 'react';
// import {
//   View, Platform, Text, StyleSheet, FlatList, TouchableOpacity,
//   SafeAreaView, StatusBar, Alert,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   RootState, AppDispatch,
//   fetchNotificationsThunk, markReadThunk, markAllReadThunk,
// } from '../../store';
// import { useTheme } from '../../hooks/useTheme';

// const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
//   birthday:    { icon: '🎂', color: '#E91E63' },
//   anniversary: { icon: '🏆', color: '#F5A623' },
//   leave:       { icon: '📅', color: '#4CAF50' },
//   salary:      { icon: '💰', color: '#F5A623' },
//   event:       { icon: '🎉', color: '#9C27B0' },
//   policy:      { icon: '📋', color: '#2196F3' },
//   general:     { icon: '🔔', color: '#888888' },
// };

// // Map ActionRoute to an actual route
// const resolveRoute = (actionRoute?: string): string | null => {
//   if (!actionRoute) return null;
//   if (actionRoute.startsWith('/(tabs)')) return actionRoute;
//   if (actionRoute.startsWith('/screens/')) return actionRoute;
//   if (actionRoute === '/(tabs)/leave') return '/(tabs)/leave';
//   if (actionRoute === '/(tabs)/more') return '/(tabs)/more';
//   if (actionRoute === '/screens/events') return '/screens/events';
//   if (actionRoute === '/screens/policies') return '/screens/policies';
//   return null;
// };

// export default function NotificationsScreen() {
//   const { isDark, theme } = useTheme();
//   const router   = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const list   = useSelector((s: RootState) => s.notif.list);
//   const unread = useSelector((s: RootState) => s.notif.unread);

//   useEffect(() => { dispatch(fetchNotificationsThunk()); }, []);

//   const bg     = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt    = theme.text;
//   const sub    = theme.textSub;
//   const border = theme.border;

//   const handlePress = async (item: any) => {
//     const isRead = item.isRead || item.read;
//     if (!isRead) {
//       await dispatch(markReadThunk(item.id));
//     }
//     const route = resolveRoute(item.actionRoute);
//     if (route) {
//       try {
//         router.push(route as any);
//       } catch {
//         // ignore navigation error
//       }
//     }
//   };

//   const handleMarkAllRead = () => {
//     dispatch(markAllReadThunk()).then(() => {
//       dispatch(fetchNotificationsThunk());
//     });
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

//       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
//         <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//           <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
//         </TouchableOpacity>
//         <View style={{ flex: 1, marginLeft: 12 }}>
//           <Text style={[s.headerTitle, { color: txt }]}>Notifications</Text>
//           <Text style={[s.headerSub, { color: sub }]}>
//             {unread > 0 ? `${unread} unread` : 'All caught up!'}
//           </Text>
//         </View>
//         {unread > 0 && (
//           <TouchableOpacity
//             onPress={handleMarkAllRead}
//             style={[s.markAllBtn, { borderColor: border }]}
//           >
//             <Text style={{ color: '#F5A623', fontWeight: '700', fontSize: 12 }}>Mark All Read</Text>
//           </TouchableOpacity>
//         )}
//       </LinearGradient>

//       <FlatList
//         data={list}
//         keyExtractor={(item: any) => String(item.id)}
//         contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
//         showsVerticalScrollIndicator={false}
//         onRefresh={() => dispatch(fetchNotificationsThunk())}
//         refreshing={false}
//         renderItem={({ item }: any) => {
//           const cfg    = TYPE_ICONS[item.type] || TYPE_ICONS.general;
//           const isRead = item.isRead || item.read;
//           const route  = resolveRoute(item.actionRoute);
//           return (
//             <TouchableOpacity
//               style={[
//                 s.notifCard,
//                 {
//                   backgroundColor: isRead ? cardBg : (isDark ? '#1A1A2E' : '#EEF2FF'),
//                   borderColor:     isRead ? border  : (isDark ? '#3A3A55' : '#C8D3FF'),
//                   borderLeftColor: cfg.color,
//                 },
//               ]}
//               onPress={() => handlePress(item)}
//               activeOpacity={0.82}
//             >
//               <View style={[s.notifIcon, { backgroundColor: cfg.color + '20' }]}>
//                 <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
//               </View>
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={[s.notifTitle, { color: txt, fontWeight: isRead ? '600' : '800' }]}>
//                   {item.title}
//                 </Text>
//                 <Text style={[s.notifMsg, { color: sub }]}>{item.message}</Text>
//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
//                   <Text style={[s.notifTime, { color: sub }]}>{item.createdAt || item.time}</Text>
//                   {route && (
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
//                       <Ionicons name="open-outline" size={10} color={sub} />
//                       <Text style={{ color: sub, fontSize: 10 }}>Tap to open</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//               {!isRead && <View style={[s.unreadDot, { backgroundColor: cfg.color }]} />}
//             </TouchableOpacity>
//           );
//         }}
//         ListEmptyComponent={
//           <View style={s.empty}>
//             <Ionicons name="notifications-off-outline" size={48} color={sub} />
//             <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No notifications yet</Text>
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
//   headerTitle: { fontSize: 20, fontWeight: '800' },
//   headerSub:   { fontSize: 12, marginTop: 2 },
//   markAllBtn:  { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
//   notifCard:   { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
//   notifIcon:   { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
//   notifTitle:  { fontSize: 13, lineHeight: 18 },
//   notifMsg:    { fontSize: 12, marginTop: 4, lineHeight: 17 },
//   notifTime:   { fontSize: 11 },
//   unreadDot:   { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginLeft: 8 },
//   empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
// });