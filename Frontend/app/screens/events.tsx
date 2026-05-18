import React, { useState, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  RootState, AppDispatch,
  createEventThunk, deleteEventThunk, fetchEventsThunk, fetchEmployeesThunk,
  fetchNotificationsThunk,
} from '../../store';
import { useTheme } from '../../hooks/useTheme';

const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  birthday:     { icon: '🎂', label: 'Birthday'         },
  anniversary:  { icon: '🏆', label: 'Work Anniversary' },
  holiday:      { icon: '🏖️', label: 'Holiday'          },
  meeting:      { icon: '💼', label: 'Meeting'           },
  training:     { icon: '📚', label: 'Training'          },
  announcement: { icon: '📢', label: 'Announcement'     },
  new_joiner:   { icon: '👋', label: 'New Joiner'       },
  celebration:  { icon: '🎉', label: 'Celebration'      },
};

export default function EventsScreen() {
  const { isDark, theme } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const currentUser  = useSelector((s: RootState) => s.auth.user);
  const events       = useSelector((s: RootState) => s.events.list);
  const allEmployees = useSelector((s: RootState) => s.employees.list);

  const [filter,     setFilter]     = useState<'upcoming' | 'all' | 'mine'>('upcoming');
  const [showCreate, setShowCreate] = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [newEvent,   setNewEvent]   = useState({
    title: '', description: '', date: '', time: '', type: 'announcement', color: '#F5A623',
  });

  const isHRorAdmin = currentUser?.role === 'hr' || currentUser?.role === 'admin';

  useEffect(() => {
    dispatch(fetchEventsThunk());
    dispatch(fetchEmployeesThunk({}));
  }, []);

  const getDate = (evt: any): string => (evt.eventDate || evt.date || '').split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const filtered = events
    .filter((e: any) => {
      const d = getDate(e);
      if (filter === 'upcoming') return d >= today;
      if (filter === 'mine') return e.relatedEmployeeId === currentUser?.id || e.employeeId === currentUser?.id;
      return true;
    })
    .sort((a: any, b: any) => getDate(a).localeCompare(getDate(b)));

  const todayEvents = events.filter((e: any) => getDate(e) === today);

  const bg     = theme.bg;
  const cardBg = theme.bgCard;
  const txt    = theme.text;
  const sub    = theme.textSub;
  const border = theme.border;

  const handleCreate = async () => {
    if (!newEvent.title.trim() || !newEvent.date) {
      Alert.alert('Missing Fields', 'Title and date are required.');
      return;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newEvent.date)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format.');
      return;
    }

    setCreating(true);
    try {
      const result = await dispatch(createEventThunk({
        title:       newEvent.title.trim(),
        description: newEvent.description,
        date:        newEvent.date,
        time:        newEvent.time || null,
        type:        newEvent.type,
        color:       newEvent.color,
        isAllDay:    !newEvent.time,
      }));

      if (createEventThunk.fulfilled.match(result)) {
        setNewEvent({ title: '', description: '', date: '', time: '', type: 'announcement', color: '#F5A623' });
        setShowCreate(false);
        // Refresh notifications count since backend notifies all employees
        dispatch(fetchNotificationsThunk());
        Alert.alert('✅ Event Created!', 'The event has been added and all employees notified.');
      } else {
        Alert.alert('❌ Error', 'Failed to create event. Please try again.');
      }
    } catch {
      Alert.alert('❌ Error', 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.headerTitle, { color: txt }]}>Events & Calendar</Text>
          <Text style={[s.headerSub, { color: sub }]}>{filtered.length} events</Text>
        </View>
        {isHRorAdmin && (
          <TouchableOpacity
            onPress={() => setShowCreate(!showCreate)}
            style={[s.createBtn, { backgroundColor: showCreate ? '#F5A623' : '#F5A62320', borderColor: '#F5A62340' }]}
          >
            <Ionicons name={showCreate ? 'close' : 'add'} size={18} color={showCreate ? '#000' : '#F5A623'} />
            <Text style={{ color: showCreate ? '#000' : '#F5A623', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>
              {showCreate ? 'Cancel' : 'Create'}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Today banner */}
      {todayEvents.length > 0 && (
        <LinearGradient colors={['#F5A623', '#E6940F']} style={s.todayBanner}>
          <Ionicons name="star" size={16} color="#000" />
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 13, marginLeft: 8 }} numberOfLines={1}>
            Today: {todayEvents.map((e: any) => e.title).join(' · ')}
          </Text>
        </LinearGradient>
      )}

      {/* Create form */}
      {showCreate && (
        <View style={[s.createForm, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={{ color: txt, fontSize: 15, fontWeight: '800', marginBottom: 12 }}>Create New Event</Text>
          {[
            { label: 'Title *',             field: 'title',       placeholder: 'e.g. Team Lunch 2025'     },
            { label: 'Date * (YYYY-MM-DD)', field: 'date',        placeholder: '2025-06-15'                },
            { label: 'Time (optional)',      field: 'time',        placeholder: '2:00 PM'                  },
            { label: 'Description',         field: 'description', placeholder: 'Details about the event...' },
          ].map(f => (
            <View key={f.field} style={{ marginBottom: 10 }}>
              <Text style={{ color: sub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>{f.label}</Text>
              <TextInput
                value={(newEvent as any)[f.field]}
                onChangeText={v => setNewEvent(e => ({ ...e, [f.field]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={sub}
                style={[s.createInput, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
              />
            </View>
          ))}

          {/* Type selector */}
          <Text style={{ color: sub, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setNewEvent(e => ({ ...e, type: key }))}
                style={[s.typeChip, {
                  backgroundColor: newEvent.type === key ? '#F5A623' : (isDark ? '#1E1E2E' : '#F0F4FF'),
                  borderColor:     newEvent.type === key ? '#F5A623' : border,
                }]}
              >
                <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
                <Text style={{ color: newEvent.type === key ? '#000' : sub, fontSize: 11, marginLeft: 4 }}>{cfg.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={handleCreate} disabled={creating}>
            <LinearGradient colors={creating ? ['#888', '#666'] : ['#F5A623', '#E6940F']} style={s.createSubmit}>
              <Text style={{ color: creating ? '#DDD' : '#000', fontWeight: '800', fontSize: 14 }}>
                {creating ? 'Creating...' : 'Create & Notify All'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter tabs */}
      <View style={[s.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
        {(['upcoming', 'all', 'mine'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tabItem, filter === t && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
            onPress={() => setFilter(t)}
          >
            <Text style={{ color: filter === t ? '#F5A623' : sub, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>
              {t === 'mine' ? 'My Events' : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 10 }}>
          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="calendar-outline" size={48} color={sub} />
              <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No events found</Text>
            </View>
          )}

          {filtered.map((evt: any) => {
            const evtDate    = getDate(evt);
            const emp        = (evt.relatedEmployeeId || evt.employeeId)
              ? allEmployees.find((e: any) => e.id === (evt.relatedEmployeeId || evt.employeeId))
              : null;
            const typeConfig = TYPE_CONFIG[evt.type] || { icon: '📅', label: 'Event' };
            const isToday    = evtDate === today;
            const color      = evt.color || '#F5A623';

            return (
              <TouchableOpacity
                key={evt.id}
                activeOpacity={0.85}
                onPress={() => {
                  // If event is linked to an employee, go to their profile
                  if (emp) {
                    router.push(('/screens/employee-detail?id=' + emp.id) as any);
                  }
                }}
              >
                <LinearGradient
                  colors={isToday ? [color + '40', color + '20'] : isDark ? ['#141420', '#1A1A2E'] : ['#FFF', '#F8FAFF']}
                  style={[s.eventCard, { borderColor: isToday ? color + '60' : border }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={[s.eventIcon, { backgroundColor: color + '25' }]}>
                      <Text style={{ fontSize: 22 }}>{typeConfig.icon}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: txt, fontSize: 14, fontWeight: '800', flex: 1 }}>{evt.title}</Text>
                        {isToday && (
                          <View style={[s.todayBadge, { backgroundColor: color }]}>
                            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>TODAY</Text>
                          </View>
                        )}
                      </View>
                      {evt.description ? (
                        <Text style={{ color: sub, fontSize: 12, marginTop: 4, lineHeight: 18 }}>{evt.description}</Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="calendar-outline" size={12} color={color} />
                          <Text style={{ color, fontSize: 11, fontWeight: '700' }}>
                            {evtDate ? new Date(evtDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </Text>
                        </View>
                        {(evt.eventTime || evt.time) && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="time-outline" size={12} color={sub} />
                            <Text style={{ color: sub, fontSize: 11 }}>{evt.eventTime || evt.time}</Text>
                          </View>
                        )}
                        <View style={[s.typeBadge, { backgroundColor: color + '20' }]}>
                          <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{typeConfig.label}</Text>
                        </View>
                      </View>
                      {emp && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                          {emp.avatar
                            ? <Image source={{ uri: emp.avatar }} style={s.empAvatarSm} />
                            : (
                              <View style={[s.empAvatarSm, { backgroundColor: color + '40', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 10, color }}>{emp.name?.[0]}</Text>
                              </View>
                            )
                          }
                          <Text style={{ color: sub, fontSize: 11 }}>{emp.name} · {emp.designation}</Text>
                        </View>
                      )}
                    </View>
                    {isHRorAdmin && !evt.isAutoGenerated && (
                      <TouchableOpacity
                        onPress={() => Alert.alert('Delete Event', 'Delete this event?', [
                          { text: 'Delete', style: 'destructive', onPress: async () => {
                            await dispatch(deleteEventThunk(Number(evt.id)));
                            dispatch(fetchNotificationsThunk());
                          }},
                          { text: 'Cancel', style: 'cancel' },
                        ])}
                        style={{ padding: 8 }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub:   { fontSize: 12, marginTop: 2 },
  createBtn:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  todayBanner: { padding: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  createForm:  { margin: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  createInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  typeChip:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  createSubmit:{ borderRadius: 12, padding: 13, alignItems: 'center' },
  tabRow:      { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem:     { flex: 1, paddingVertical: 12, alignItems: 'center' },
  eventCard:   { borderRadius: 16, padding: 14, borderWidth: 1 },
  eventIcon:   { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  todayBadge:  { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  typeBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  empAvatarSm: { width: 22, height: 22, borderRadius: 11 },
});

// import React, { useState, useEffect } from 'react';
// import {
//   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
//   SafeAreaView, StatusBar, Image, Alert, TextInput,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch, createEventThunk, deleteEventThunk, fetchEventsThunk, fetchEmployeesThunk } from '../../store';
// import { useTheme } from '../../hooks/useTheme';

// const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
//   birthday:     { icon: '🎂', label: 'Birthday'      },
//   anniversary:  { icon: '🏆', label: 'Work Anniversary' },
//   holiday:      { icon: '🏖️', label: 'Holiday'       },
//   meeting:      { icon: '💼', label: 'Meeting'        },
//   training:     { icon: '📚', label: 'Training'       },
//   announcement: { icon: '📢', label: 'Announcement'  },
//   new_joiner:   { icon: '👋', label: 'New Joiner'    },
//   celebration:  { icon: '🎉', label: 'Celebration'   },
// };

// export default function EventsScreen() {
//   const { isDark, theme } = useTheme();
//   const router   = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const currentUser  = useSelector((s: RootState) => s.auth.user);
//   const events       = useSelector((s: RootState) => s.events.list);
//   const allEmployees = useSelector((s: RootState) => s.employees.list);

//   const [filter,    setFilter]    = useState<'upcoming' | 'all' | 'mine'>('upcoming');
//   const [showCreate, setShowCreate] = useState(false);
//   const [newEvent,  setNewEvent]  = useState({
//     title: '', description: '', date: '', time: '', type: 'announcement', color: '#F5A623',
//   });

//   const isHRorAdmin = currentUser?.role === 'hr' || currentUser?.role === 'admin';

// useEffect(() => {
//   dispatch(fetchEventsThunk()); 
//   dispatch(fetchEmployeesThunk({}));
// }, []);
//   // API returns eventDate as "YYYY-MM-DDTHH:mm:ss" — normalise to "YYYY-MM-DD"
//   const getDate = (evt: any): string => (evt.eventDate || evt.date || '').split('T')[0];

//   const today = new Date().toISOString().split('T')[0];

//   const filtered = events
//     .filter((e: any) => {
//       const d = getDate(e);
//       if (filter === 'upcoming') return d >= today;
//       if (filter === 'mine')     return e.relatedEmployeeId === currentUser?.id || e.employeeId === currentUser?.id;
//       return true;
//     })
//     .sort((a: any, b: any) => getDate(a).localeCompare(getDate(b)));

//   const todayEvents = events.filter((e: any) => getDate(e) === today);

//   const bg     = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt    = theme.text;
//   const sub    = theme.textSub;
//   const border = theme.border;

//   const handleCreate = () => {
//     if (!newEvent.title || !newEvent.date) {
//       Alert.alert('Error', 'Title and date are required.');
//       return;
//     }
//     dispatch(createEventThunk({
//       title:       newEvent.title,
//       description: newEvent.description,
//       date:        newEvent.date,
//       time:        newEvent.time || null,
//       type:        newEvent.type,
//       color:       newEvent.color,
//       isAllDay:    !newEvent.time,
//     }));
//     setNewEvent({ title: '', description: '', date: '', time: '', type: 'announcement', color: '#F5A623' });
//     setShowCreate(false);
//     Alert.alert('✅ Event Created!', 'The event has been added and all employees notified.');
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

//       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
//         </TouchableOpacity>
//         <View style={{ flex: 1, marginLeft: 12 }}>
//           <Text style={[s.headerTitle, { color: txt }]}>Events & Calendar</Text>
//           <Text style={[s.headerSub,  { color: sub }]}>{filtered.length} events</Text>
//         </View>
//         {isHRorAdmin && (
//           <TouchableOpacity
//             onPress={() => setShowCreate(!showCreate)}
//             style={[s.createBtn, { backgroundColor: showCreate ? '#F5A623' : '#F5A62320', borderColor: '#F5A62340' }]}
//           >
//             <Ionicons name={showCreate ? 'close' : 'add'} size={18} color={showCreate ? '#000' : '#F5A623'} />
//             <Text style={{ color: showCreate ? '#000' : '#F5A623', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>
//               {showCreate ? 'Cancel' : 'Create'}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </LinearGradient>

//       {/* Today banner */}
//       {todayEvents.length > 0 && (
//         <LinearGradient colors={['#F5A623', '#E6940F']} style={s.todayBanner}>
//           <Ionicons name="star" size={16} color="#000" />
//           <Text style={{ color: '#000', fontWeight: '800', fontSize: 13, marginLeft: 8 }} numberOfLines={1}>
//             Today: {todayEvents.map((e: any) => e.title).join(' · ')}
//           </Text>
//         </LinearGradient>
//       )}

//       {/* Create form */}
//       {showCreate && (
//         <View style={[s.createForm, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={{ color: txt, fontSize: 15, fontWeight: '800', marginBottom: 12 }}>Create New Event</Text>
//           {[
//             { label: 'Title *',              field: 'title',       placeholder: 'e.g. Team Lunch 2025'    },
//             { label: 'Date * (YYYY-MM-DD)',  field: 'date',        placeholder: '2025-06-15'               },
//             { label: 'Time (optional)',      field: 'time',        placeholder: '2:00 PM'                 },
//             { label: 'Description',          field: 'description', placeholder: 'Details about the event...' },
//           ].map(f => (
//             <View key={f.field} style={{ marginBottom: 10 }}>
//               <Text style={{ color: sub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>{f.label}</Text>
//               <TextInput
//                 value={(newEvent as any)[f.field]}
//                 onChangeText={v => setNewEvent(e => ({ ...e, [f.field]: v }))}
//                 placeholder={f.placeholder}
//                 placeholderTextColor={sub}
//                 style={[s.createInput, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
//               />
//             </View>
//           ))}
//           {/* Type selector */}
//           <Text style={{ color: sub, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>Type</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
//             {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
//               <TouchableOpacity
//                 key={key}
//                 onPress={() => setNewEvent(e => ({ ...e, type: key }))}
//                 style={[s.typeChip, {
//                   backgroundColor: newEvent.type === key ? '#F5A623' : (isDark ? '#1E1E2E' : '#F0F4FF'),
//                   borderColor:     newEvent.type === key ? '#F5A623' : border,
//                 }]}
//               >
//                 <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
//                 <Text style={{ color: newEvent.type === key ? '#000' : sub, fontSize: 11, marginLeft: 4 }}>{cfg.label}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//           <TouchableOpacity onPress={handleCreate}>
//             <LinearGradient colors={['#F5A623', '#E6940F']} style={s.createSubmit}>
//               <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>Create & Notify All</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Filter tabs */}
//       <View style={[s.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
//         {(['upcoming', 'all', 'mine'] as const).map(t => (
//           <TouchableOpacity
//             key={t}
//             style={[s.tabItem, filter === t && { borderBottomWidth: 2, borderBottomColor: '#F5A623' }]}
//             onPress={() => setFilter(t)}
//           >
//             <Text style={{ color: filter === t ? '#F5A623' : sub, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>
//               {t === 'mine' ? 'My Events' : t}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={{ padding: 16, gap: 10 }}>
//           {filtered.length === 0 && (
//             <View style={{ alignItems: 'center', paddingTop: 60 }}>
//               <Ionicons name="calendar-outline" size={48} color={sub} />
//               <Text style={{ color: sub, fontSize: 16, marginTop: 12 }}>No events found</Text>
//             </View>
//           )}
//           {filtered.map((evt: any) => {
//             const evtDate    = getDate(evt);
//             const emp        = (evt.relatedEmployeeId || evt.employeeId)
//               ? allEmployees.find((e: any) => e.id === (evt.relatedEmployeeId || evt.employeeId))
//               : null;
//             const typeConfig = TYPE_CONFIG[evt.type] || { icon: '📅', label: 'Event' };
//             const isToday    = evtDate === today;
//             const color      = evt.color || '#F5A623';
//             return (
//               <LinearGradient
//                 key={evt.id}
//                 colors={isToday ? [color + '40', color + '20'] : isDark ? ['#141420', '#1A1A2E'] : ['#FFF', '#F8FAFF']}
//                 style={[s.eventCard, { borderColor: isToday ? color + '60' : border }]}
//               >
//                 <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
//                   <View style={[s.eventIcon, { backgroundColor: color + '25' }]}>
//                     <Text style={{ fontSize: 22 }}>{typeConfig.icon}</Text>
//                   </View>
//                   <View style={{ flex: 1, marginLeft: 12 }}>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                       <Text style={{ color: txt, fontSize: 14, fontWeight: '800', flex: 1 }}>{evt.title}</Text>
//                       {isToday && (
//                         <View style={[s.todayBadge, { backgroundColor: color }]}>
//                           <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>TODAY</Text>
//                         </View>
//                       )}
//                     </View>
//                     {evt.description ? (
//                       <Text style={{ color: sub, fontSize: 12, marginTop: 4, lineHeight: 18 }}>{evt.description}</Text>
//                     ) : null}
//                     <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
//                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                         <Ionicons name="calendar-outline" size={12} color={color} />
//                         <Text style={{ color, fontSize: 11, fontWeight: '700' }}>
//                           {evtDate ? new Date(evtDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
//                         </Text>
//                       </View>
//                       {evt.eventTime && (
//                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                           <Ionicons name="time-outline" size={12} color={sub} />
//                           <Text style={{ color: sub, fontSize: 11 }}>{evt.eventTime}</Text>
//                         </View>
//                       )}
//                       <View style={[s.typeBadge, { backgroundColor: color + '20' }]}>
//                         <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{typeConfig.label}</Text>
//                       </View>
//                     </View>
//                     {emp && (
//                       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
//                         {emp.avatar
//                           ? <Image source={{ uri: emp.avatar }} style={s.empAvatarSm} />
//                           : <View style={[s.empAvatarSm, { backgroundColor: color + '40', justifyContent: 'center', alignItems: 'center' }]}>
//                               <Text style={{ fontSize: 10, color }}>{emp.name?.[0]}</Text>
//                             </View>
//                         }
//                         <Text style={{ color: sub, fontSize: 11 }}>{emp.name} · {emp.designation}</Text>
//                       </View>
//                     )}
//                   </View>
//                   {isHRorAdmin && !evt.isAutoGenerated && (
//                     <TouchableOpacity
//                       onPress={() => Alert.alert('Delete Event', 'Delete this event?', [
//                         { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteEventThunk(Number(evt.id))) },
//                         { text: 'Cancel', style: 'cancel' },
//                       ])}
//                       style={{ padding: 4 }}
//                     >
//                       <Ionicons name="trash-outline" size={16} color="#F44336" />
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </LinearGradient>
//             );
//           })}
//         </View>
//         <View style={{ height: 20 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
//   headerTitle: { fontSize: 20, fontWeight: '800' },
//   headerSub:   { fontSize: 12, marginTop: 2 },
//   createBtn:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
//   todayBanner: { padding: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
//   createForm:  { margin: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
//   createInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
//   typeChip:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
//   createSubmit:{ borderRadius: 12, padding: 13, alignItems: 'center' },
//   tabRow:      { flexDirection: 'row', borderBottomWidth: 1 },
//   tabItem:     { flex: 1, paddingVertical: 12, alignItems: 'center' },
//   eventCard:   { borderRadius: 16, padding: 14, borderWidth: 1 },
//   eventIcon:   { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
//   todayBadge:  { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
//   typeBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
//   empAvatarSm: { width: 22, height: 22, borderRadius: 11 },
// });