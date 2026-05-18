import React, { useState, useEffect } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, applyLeaveThunk, fetchLeaveBalanceThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { LEAVE_TYPES } from '../../data/company';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ApplyLeaveScreen() {
  const { isDark, theme } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const balance     = useSelector((s: RootState) => s.leave.balance);
  const loading     = useSelector((s: RootState) => s.leave.loading);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchLeaveBalanceThunk()); }, []);

  const [selectedType,    setSelectedType]    = useState('cl');
  const [fromDate,        setFromDate]        = useState('');
  const [toDate,          setToDate]          = useState('');
  const [reason,          setReason]          = useState('');
  const [isHalfDay,       setIsHalfDay]       = useState(false);
  const [showFromPicker,  setShowFromPicker]  = useState(false);
  const [showToPicker,    setShowToPicker]    = useState(false);
  const [submitting,      setSubmitting]      = useState(false);

  const bg     = theme.bg;
  const cardBg = theme.bgCard;
  const txt    = theme.text;
  const sub    = theme.textSub;
  const border = theme.border;

  const selectedLeave = LEAVE_TYPES.find(l => l.id === selectedType);

  const calcDays = () => {
    if (!fromDate || !toDate) return 0;
    const f = new Date(fromDate), t = new Date(toDate);
    if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
    const diff = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
    return isHalfDay ? 0.5 : Math.max(0, diff);
  };

  const days = calcDays();

  // FIX: balance keys from backend are UPPERCASE (CL, SL, EL, ML, PL, LOP)
  const getAvailableBalance = (leaveTypeId: string) => {
    if (!balance) return '—';
    const key = leaveTypeId.toUpperCase() as keyof typeof balance;
    const val = balance[key];
    return val !== undefined && val !== null ? val : '—';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchLeaveBalanceThunk());
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleSubmit = async () => {
    if (submitting || loading) return;

    if (!fromDate || !toDate) {
      Alert.alert('Missing Dates', 'Please select both From Date and To Date.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Missing Reason', 'Please provide a reason for your leave.');
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      Alert.alert('Invalid Dates', 'To Date cannot be before From Date.');
      return;
    }
    if (days <= 0) {
      Alert.alert('Invalid Duration', 'Leave duration must be at least 0.5 days.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(applyLeaveThunk({
        leaveType: selectedType,
        fromDate,
        toDate,
        reason: reason.trim(),
        isHalfDay,
      }));

      if (applyLeaveThunk.fulfilled.match(result)) {
        Alert.alert(
          '✅ Leave Applied',
          `Your ${selectedLeave?.name} leave for ${days} day(s) has been submitted. You will be notified once approved.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const errMsg = (result.payload as string) || 'Failed to apply leave. Please try again.';
        Alert.alert('❌ Error', errMsg);
      }
    } catch (err: any) {
      Alert.alert('❌ Error', err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '800', marginLeft: 12, flex: 1 }}>
          Apply Leave
        </Text>
        {balance && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: sub, fontSize: 10 }}>Available</Text>
            {/* FIX: use uppercase key to match backend */}
            <Text style={{ color: '#F5A623', fontSize: 13, fontWeight: '800' }}>
              {getAvailableBalance(selectedType)} days
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" colors={['#F5A623']} />
        }
      >

        {/* Leave Type */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: txt }]}>Leave Type</Text>
          {LEAVE_TYPES.map(lt => {
            // FIX: correct uppercase key for balance lookup
            const available = getAvailableBalance(lt.id);
            return (
              <TouchableOpacity
                key={lt.id}
                onPress={() => setSelectedType(lt.id)}
                style={[styles.leaveOption, {
                  borderColor: selectedType === lt.id ? lt.color : border,
                  backgroundColor: selectedType === lt.id ? lt.color + '15' : 'transparent',
                }]}
              >
                <View style={[styles.radio, { borderColor: lt.color }]}>
                  {selectedType === lt.id && <View style={[styles.radioInner, { backgroundColor: lt.color }]} />}
                </View>
                <View style={[styles.leaveIcon, { backgroundColor: lt.color + '20' }]}>
                  <Ionicons name={lt.icon as any} size={18} color={lt.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>{lt.name} ({lt.short})</Text>
                  <Text style={{ color: sub, fontSize: 11, marginTop: 2 }}>{lt.desc}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {selectedType === lt.id && <Ionicons name="checkmark-circle" size={20} color={lt.color} />}
                  <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                    {lt.total > 0 ? `${available}/${lt.total}` : '∞'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dates */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: txt }]}>Date Selection</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            {/* FROM */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>From Date *</Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const date = prompt('Enter From Date (YYYY-MM-DD)');
                    if (date) setFromDate(date);
                  } else { setShowFromPicker(true); }
                }}
                style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: fromDate ? '#F5A623' : border }]}
              >
                <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={{ color: fromDate ? txt : sub, fontSize: 13 }}>{fromDate || 'Select date'}</Text>
              </TouchableOpacity>
            </View>

            {/* TO */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>To Date *</Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const date = prompt('Enter To Date (YYYY-MM-DD)');
                    if (date) setToDate(date);
                  } else { setShowToPicker(true); }
                }}
                style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: toDate ? '#F5A623' : border }]}
              >
                <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={{ color: toDate ? txt : sub, fontSize: 13 }}>{toDate || 'Select date'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showFromPicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={fromDate ? new Date(fromDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowFromPicker(false);
                if (event.type === 'dismissed') return;
                if (selectedDate) {
                  const formatted = selectedDate.toISOString().split('T')[0];
                  setFromDate(formatted);
                  if (toDate && new Date(toDate) < selectedDate) setToDate(formatted);
                }
              }}
            />
          )}

          {showToPicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={toDate ? new Date(toDate) : (fromDate ? new Date(fromDate) : new Date())}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={fromDate ? new Date(fromDate) : undefined}
              onChange={(event, selectedDate) => {
                setShowToPicker(false);
                if (event.type === 'dismissed') return;
                if (selectedDate) setToDate(selectedDate.toISOString().split('T')[0]);
              }}
            />
          )}

          {/* Half day toggle */}
          <TouchableOpacity
            onPress={() => setIsHalfDay(!isHalfDay)}
            style={[styles.halfDayToggle, {
              borderColor: isHalfDay ? '#F5A62340' : border,
              backgroundColor: isHalfDay ? '#F5A62315' : 'transparent',
            }]}
          >
            <View style={[styles.checkbox, {
              borderColor: isHalfDay ? '#F5A623' : sub,
              backgroundColor: isHalfDay ? '#F5A623' : 'transparent',
            }]}>
              {isHalfDay && <Ionicons name="checkmark" size={12} color="#000" />}
            </View>
            <Text style={{ color: txt, fontSize: 13, fontWeight: '600', marginLeft: 10 }}>Half Day Leave</Text>
          </TouchableOpacity>

          {days > 0 && (
            <View style={[styles.daysSummary, { backgroundColor: '#F5A62320', borderColor: '#F5A62340' }]}>
              <Ionicons name="time-outline" size={18} color="#F5A623" />
              <Text style={{ color: '#F5A623', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
                {days} Day{days !== 1 ? 's' : ''} of {selectedLeave?.name}
              </Text>
            </View>
          )}
        </View>

        {/* Reason */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: txt }]}>Reason *</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Briefly describe the reason for leave..."
            placeholderTextColor={sub}
            multiline
            numberOfLines={4}
            maxLength={200}
            style={[styles.textArea, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
          />
          <Text style={{ color: sub, fontSize: 11, marginTop: 6 }}>{reason.length}/200 characters</Text>
        </View>

        {/* Summary */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: txt }]}>Application Summary</Text>
          {[
            { label: 'Employee',         value: currentUser?.name },
            { label: 'Leave Type',       value: selectedLeave?.name },
            { label: 'Duration',         value: days > 0 ? `${days} day(s)` : 'Select dates' },
            { label: 'Dates',            value: fromDate && toDate ? `${fromDate} → ${toDate}` : 'Select dates' },
            { label: 'Available Balance',value: balance ? `${getAvailableBalance(selectedType)} days` : 'Loading...' },
            { label: 'Approver',         value: 'HR / Manager' },
          ].map(row => (
            <View key={row.label} style={[styles.summaryRow, { borderBottomColor: border }]}>
              <Text style={{ color: sub, fontSize: 12, flex: 1 }}>{row.label}</Text>
              <Text style={{ color: txt, fontSize: 13, fontWeight: '600' }}>{row.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting || loading} activeOpacity={0.8}>
          <LinearGradient
            colors={submitting || loading ? ['#888', '#666'] : ['#4CAF50', '#2E7D32']}
            style={styles.submitBtn}
          >
            <Ionicons name="send-outline" size={18} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16, marginLeft: 10 }}>
              {submitting || loading ? 'Submitting...' : 'Submit Application'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  card:          { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitle:     { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  leaveOption:   { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
  radio:         { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radioInner:    { width: 10, height: 10, borderRadius: 5 },
  leaveIcon:     { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inputRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
  halfDayToggle: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  checkbox:      { width: 20, height: 20, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  daysSummary:   { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  textArea:      { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, height: 100, textAlignVertical: 'top' },
  summaryRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  submitBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
});

// import React, { useState, useEffect } from 'react';
// import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl , StatusBar, TextInput, Alert } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch, applyLeaveThunk, fetchLeaveBalanceThunk } from '../../store';
// import { useTheme } from '../../hooks/useTheme';
// import { LEAVE_TYPES } from '../../data/company';
// import DateTimePicker from '@react-native-community/datetimepicker';

// export default function ApplyLeaveScreen() {
//   const { isDark, theme } = useTheme();
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const currentUser = useSelector((s: RootState) => s.auth.user);
//   const balance     = useSelector((s: RootState) => s.leave.balance);
//   const loading     = useSelector((s: RootState) => s.leave.loading);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => { dispatch(fetchLeaveBalanceThunk(undefined as any)); }, []);

//   const [selectedType, setSelectedType] = useState('cl');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [reason, setReason] = useState('');
//   const [isHalfDay, setIsHalfDay] = useState(false);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const bg = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt = theme.text;
//   const sub = theme.textSub;
//   const border = theme.border;

//   const selectedLeave = LEAVE_TYPES.find(l => l.id === selectedType);

//   const calcDays = () => {
//     if (!fromDate || !toDate) return 0;
//     const f = new Date(fromDate), t = new Date(toDate);
//     if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
//     const diff = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
//     return isHalfDay ? 0.5 : Math.max(0, diff);
//   };

//   const onRefresh = async () => {
//   setRefreshing(true);

//   try {
//     // call your APIs here if needed
//     // example:
//     // dispatch(fetchSomething());
//   } catch (e) {
//     console.log(e);
//   }

//   setTimeout(() => setRefreshing(false), 1000);
// };
//   const days = calcDays();

//   const handleSubmit = async () => {
//     if (submitting) return;

//     if (!currentUser) {
//       Alert.alert('Error', 'User not found');
//       return;
//     }

//     if (!fromDate || !toDate) {
//       Alert.alert('Missing Dates', 'Please select both From Date and To Date.');
//       return;
//     }

//     if (!reason.trim()) {
//       Alert.alert('Missing Reason', 'Please provide a reason for your leave.');
//       return;
//     }

//     if (new Date(toDate) < new Date(fromDate)) {
//       Alert.alert('Invalid Dates', 'To Date cannot be before From Date.');
//       return;
//     }

//     if (days <= 0) {
//       Alert.alert('Invalid Duration', 'Leave duration must be at least 0.5 days.');
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const result = await dispatch(applyLeaveThunk({
//         employeeId: currentUser.id,
//         leaveType: selectedType,
//         fromDate,
//         toDate,
//         days,
//         reason: reason.trim(),
//         status: 'pending',
//         appliedOn: new Date().toISOString().split('T')[0],
//       }));

//       if (applyLeaveThunk.fulfilled.match(result)) {
//         Alert.alert(
//           '✅ Success',
//           `Your ${selectedLeave?.name} leave for ${days} day(s) has been submitted successfully. You will be notified once approved.`,
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 setFromDate('');
//                 setToDate('');
//                 setReason('');
//                 setIsHalfDay(false);
//                 router.back();
//               },
//             },
//           ]
//         );
//       } else {
//         const errMsg = (result as any)?.error?.message || (result as any)?.payload || 'Failed to apply leave. Please try again.';
//         Alert.alert('❌ Error', errMsg);
//       }
//     } catch (err: any) {
//       Alert.alert('❌ Error', err?.message || 'Something went wrong. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
//       <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//           <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
//         </TouchableOpacity>
//         <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '800', marginLeft: 12, flex: 1 }}>Apply Leave</Text>
//         {balance && (
//           <View style={{ alignItems: 'flex-end' }}>
//             <Text style={{ color: sub, fontSize: 10 }}>Available</Text>
//             <Text style={{ color: '#F5A623', fontSize: 13, fontWeight: '800' }}>
//               {((balance as any)[selectedType?.toUpperCase() ?? 'CL'] ?? 0)} days
//             </Text>
//           </View>
//         )}
//       </LinearGradient>

//       {/* <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
//        */}
// <ScrollView
//   keyboardShouldPersistTaps="handled"
//   showsVerticalScrollIndicator={false}
//   refreshControl={
//     <RefreshControl
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       tintColor="#F5A623"
//       colors={['#F5A623']}
//     />
//   }
// >
//         {/* Leave Type */}
//         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.cardTitle, { color: txt }]}>Leave Type</Text>
//           {LEAVE_TYPES.map(lt => {
//             const available = (balance as any)?.[lt.id.toUpperCase()] ?? lt.total;
//             return (
//               <TouchableOpacity
//                 key={lt.id}
//                 onPress={() => setSelectedType(lt.id)}
//                 style={[styles.leaveOption, {
//                   borderColor: selectedType === lt.id ? lt.color : border,
//                   backgroundColor: selectedType === lt.id ? lt.color + '15' : 'transparent',
//                 }]}
//               >
//                 <View style={[styles.radio, { borderColor: lt.color }]}>
//                   {selectedType === lt.id && <View style={[styles.radioInner, { backgroundColor: lt.color }]} />}
//                 </View>
//                 <View style={[styles.leaveIcon, { backgroundColor: lt.color + '20' }]}>
//                   <Ionicons name={lt.icon as any} size={18} color={lt.color} />
//                 </View>
//                 <View style={{ flex: 1, marginLeft: 10 }}>
//                   <Text style={{ color: txt, fontSize: 13, fontWeight: '700' }}>{lt.name} ({lt.short})</Text>
//                   <Text style={{ color: sub, fontSize: 11, marginTop: 2 }}>{lt.desc}</Text>
//                 </View>
//                 <View style={{ alignItems: 'flex-end' }}>
//                   {selectedType === lt.id && <Ionicons name="checkmark-circle" size={20} color={lt.color} />}
//                   <Text style={{ color: lt.color, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
//                     {lt.total > 0 ? `${available}/${lt.total}` : '∞'}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         {/* Dates */}
//         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.cardTitle, { color: txt }]}>Date Selection</Text>

//           <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
//             {/* FROM DATE */}
//             <View style={{ flex: 1 }}>
//               <Text style={{ color: sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>From Date *</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   if (Platform.OS === 'web') {
//                     const date = prompt('Enter From Date (YYYY-MM-DD)');
//                     if (date) setFromDate(date);
//                   } else {
//                     setShowFromPicker(true);
//                   }
//                 }}
//                 style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: fromDate ? '#F5A623' : border }]}
//               >
//                 <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight: 8 }} />
//                 <Text style={{ color: fromDate ? txt : sub, fontSize: 13 }}>
//                   {fromDate || 'Select date'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* TO DATE */}
//             <View style={{ flex: 1 }}>
//               <Text style={{ color: sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>To Date *</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   if (Platform.OS === 'web') {
//                     const date = prompt('Enter To Date (YYYY-MM-DD)');
//                     if (date) setToDate(date);
//                   } else {
//                     setShowToPicker(true);
//                   }
//                 }}
//                 style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: toDate ? '#F5A623' : border }]}
//               >
//                 <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight: 8 }} />
//                 <Text style={{ color: toDate ? txt : sub, fontSize: 13 }}>
//                   {toDate || 'Select date'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* FROM PICKER */}
//           {showFromPicker && Platform.OS !== 'web' && (
//             <DateTimePicker
//               value={fromDate ? new Date(fromDate) : new Date()}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={(event, selectedDate) => {
//                 setShowFromPicker(false);
//                 if (event.type === 'dismissed') return;
//                 if (selectedDate) {
//                   const formatted = selectedDate.toISOString().split('T')[0];
//                   setFromDate(formatted);
//                   if (toDate && new Date(toDate) < selectedDate) {
//                     setToDate(formatted);
//                   }
//                 }
//               }}
//             />
//           )}

//           {/* TO PICKER */}
//           {showToPicker && Platform.OS !== 'web' && (
//             <DateTimePicker
//               value={toDate ? new Date(toDate) : (fromDate ? new Date(fromDate) : new Date())}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               minimumDate={fromDate ? new Date(fromDate) : undefined}
//               onChange={(event, selectedDate) => {
//                 setShowToPicker(false);
//                 if (event.type === 'dismissed') return;
//                 if (selectedDate) {
//                   setToDate(selectedDate.toISOString().split('T')[0]);
//                 }
//               }}
//             />
//           )}

//           {/* HALF DAY */}
//           <TouchableOpacity
//             onPress={() => setIsHalfDay(!isHalfDay)}
//             style={[styles.halfDayToggle, {
//               borderColor: isHalfDay ? '#F5A62340' : border,
//               backgroundColor: isHalfDay ? '#F5A62315' : 'transparent',
//             }]}
//           >
//             <View style={[styles.checkbox, {
//               borderColor: isHalfDay ? '#F5A623' : sub,
//               backgroundColor: isHalfDay ? '#F5A623' : 'transparent',
//             }]}>
//               {isHalfDay && <Ionicons name="checkmark" size={12} color="#000" />}
//             </View>
//             <Text style={{ color: txt, fontSize: 13, fontWeight: '600', marginLeft: 10 }}>Half Day Leave</Text>
//           </TouchableOpacity>

//           {/* DAYS SUMMARY */}
//           {days > 0 && (
//             <View style={[styles.daysSummary, { backgroundColor: '#F5A62320', borderColor: '#F5A62340' }]}>
//               <Ionicons name="time-outline" size={18} color="#F5A623" />
//               <Text style={{ color: '#F5A623', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
//                 {days} Day{days !== 1 ? 's' : ''} of {selectedLeave?.name}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Reason */}
//         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.cardTitle, { color: txt }]}>Reason *</Text>
//           <TextInput
//             value={reason}
//             onChangeText={setReason}
//             placeholder="Briefly describe the reason for leave..."
//             placeholderTextColor={sub}
//             multiline
//             numberOfLines={4}
//             maxLength={200}
//             style={[styles.textArea, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
//           />
//           <Text style={{ color: sub, fontSize: 11, marginTop: 6 }}>{reason.length}/200 characters</Text>
//         </View>

//         {/* Summary */}
//         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.cardTitle, { color: txt }]}>Application Summary</Text>
//           {[
//             { label: 'Employee', value: currentUser?.name },
//             { label: 'Leave Type', value: selectedLeave?.name },
//             { label: 'Duration', value: days > 0 ? `${days} day(s)` : 'Select dates' },
//             { label: 'Dates', value: fromDate && toDate ? `${fromDate} → ${toDate}` : 'Select dates' },
//             { label: 'Available Balance', value: balance ? `${(balance as any)[selectedType.toUpperCase()] ?? 0} days` : 'Loading...' },
//             { label: 'Approver', value: 'HR / Manager' },
//           ].map(row => (
//             <View key={row.label} style={[styles.summaryRow, { borderBottomColor: border }]}>
//               <Text style={{ color: sub, fontSize: 12, flex: 1 }}>{row.label}</Text>
//               <Text style={{ color: txt, fontSize: 13, fontWeight: '600' }}>{row.value}</Text>
//             </View>
//           ))}
//         </View>

//         <TouchableOpacity onPress={handleSubmit} disabled={submitting || loading}>
//           <LinearGradient
//             colors={submitting || loading ? ['#888', '#666'] : ['#4CAF50', '#2E7D32']}
//             style={styles.submitBtn}
//           >
//             <Ionicons name="send-outline" size={18} color="#FFF" />
//             <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16, marginLeft: 10 }}>
//               {submitting || loading ? 'Submitting...' : 'Submit Application'}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
//   card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
//   cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
//   leaveOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
//   radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
//   radioInner: { width: 10, height: 10, borderRadius: 5 },
//   leaveIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
//   halfDayToggle: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 4 },
//   checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
//   daysSummary: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 12 },
//   textArea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, height: 100, textAlignVertical: 'top' },
//   summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
//   submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
// });

// // import React, { useState, useEffect } from 'react';
// // import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { RootState, AppDispatch, applyLeaveThunk, fetchLeaveBalanceThunk } from '../../store';
// // import { useTheme } from '../../hooks/useTheme';
// // import { LEAVE_TYPES } from '../../data/company';
// // import DateTimePicker from '@react-native-community/datetimepicker';

// // export default function ApplyLeaveScreen() {
// //   const { isDark, theme } = useTheme();
// //   const router = useRouter();
// //   const dispatch = useDispatch<AppDispatch>();
// //   const currentUser = useSelector((s: RootState) => s.auth.user);
// //   const balance     = useSelector((s: RootState) => s.leave.balance);
// //   const loading     = useSelector((s: RootState) => s.leave.loading);
  

// //   useEffect(() => { dispatch(fetchLeaveBalanceThunk(undefined)); }, []);
// //   const [selectedType, setSelectedType] = useState('cl');
// //   const [fromDate, setFromDate] = useState('');
// //   const [toDate, setToDate] = useState('');
// //   const [reason, setReason] = useState('');
// //   const [isHalfDay, setIsHalfDay] = useState(false);
// // const [showFromPicker, setShowFromPicker] = useState(false);
// // const [showToPicker, setShowToPicker] = useState(false);
// //   const bg = theme.bg;
// //   const cardBg = theme.bgCard;
// //   const txt = theme.text;
// //   const sub = theme.textSub;
// //   const border = theme.border;

// //   const selectedLeave = LEAVE_TYPES.find(l => l.id === selectedType);

// //   const calcDays = () => {
// //     if (!fromDate || !toDate) return 0;
// //     const f = new Date(fromDate), t = new Date(toDate);
// //     if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
// //     const diff = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
// //     return isHalfDay ? 0.5 : Math.max(0, diff);
// //   };

// //   const days = calcDays();
// // const handleSubmit = async () => {
// //   console.log("SUBMIT CLICKED");

// //   if (!currentUser) {
// //     Alert.alert('Error', 'User not found');
// //     return;
// //   }

// //   if (!fromDate || !toDate || !reason.trim()) {
// //     Alert.alert('Error', 'Please fill all required fields.');
// //     return;
// //   }

// //   if (new Date(toDate) < new Date(fromDate)) {
// //     Alert.alert('Error', 'To Date cannot be before From Date');
// //     return;
// //   }

// //   try {
// //     await dispatch(applyLeaveThunk({
// //       employeeId: currentUser.id,
// //       leaveType: selectedType,
// //       fromDate,
// //       toDate,
// //       days,
// //       reason: reason.trim(),
// //       status: 'pending',
// //       appliedOn: new Date().toISOString().split('T')[0],
// //     })).unwrap();

// //     Alert.alert('Success 🎉', 'Leave applied successfully', [
// //       {
// //         text: 'OK',
// //         onPress: () => {
// //           setFromDate('');
// //           setToDate('');
// //           setReason('');
// //           setIsHalfDay(false);
// //           router.replace('/(tabs)/leave');
// //         }
// //       }
// //     ]);

// //   } catch (err: any) {
// //     console.log("ERROR:", err);
// //     Alert.alert('Error', err?.message || 'Failed to apply leave');
// //   }
// // };
// //   return (
// //     <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
// //       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
// //       <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFF','#F0F4FF']} style={styles.header}>
// //         <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} /></TouchableOpacity>
// //         <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize:18, fontWeight:'800', marginLeft:12 }}>Apply Leave</Text>
// //       </LinearGradient>
// //       <ScrollView style={{ padding:16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

// //         {/* Leave Type */}
// //         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
// //           <Text style={[styles.cardTitle, { color: txt }]}>Leave Type</Text>
// //           {LEAVE_TYPES.map(lt => (
// //             <TouchableOpacity key={lt.id} onPress={() => setSelectedType(lt.id)} style={[styles.leaveOption, { borderColor: selectedType === lt.id ? lt.color : border, backgroundColor: selectedType === lt.id ? lt.color + '15' : 'transparent' }]}>
// //               <View style={[styles.radio, { borderColor: lt.color }]}>{selectedType === lt.id && <View style={[styles.radioInner, { backgroundColor: lt.color }]} />}</View>
// //               <View style={[styles.leaveIcon, { backgroundColor: lt.color + '20' }]}>
// //                 <Ionicons name={lt.icon as any} size={18} color={lt.color} />
// //               </View>
// //               <View style={{ flex:1, marginLeft:10 }}>
// //                 <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>{lt.name} ({lt.short})</Text>
// //                 <Text style={{ color: sub, fontSize:11, marginTop:2 }}>{lt.desc}</Text>
// //               </View>
// //               {selectedType === lt.id && <Ionicons name="checkmark-circle" size={20} color={lt.color} />}
// //             </TouchableOpacity>
// //           ))}
// //         </View>

// //         {/* Dates */}
// // <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
// //   <Text style={[styles.cardTitle, { color: txt }]}>Date Selection</Text>

// //   <View style={{ flexDirection:'row', gap:12, marginBottom:14 }}>
    
// //     {/* FROM DATE */}
// //     <View style={{ flex:1 }}>
// //       <Text style={{ color: sub, fontSize:12, fontWeight:'600', marginBottom:6 }}>From Date *</Text>
      
// //       <TouchableOpacity
// //   onPress={() => {
// //   if (Platform.OS === 'web') {
// //     const date = prompt('Enter To Date (YYYY-MM-DD)');
// //     if (date) setToDate(date);
// //   } else {
// //     setShowToPicker(true);
// //   }
// // }}
// //         style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border }]}
// //       >
// //         <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight:8 }} />
// //         <Text style={{ color: fromDate ? txt : sub }}>
// //           {fromDate || 'Select date'}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>

// //     {/* TO DATE */}
// //     <View style={{ flex:1 }}>
// //       <Text style={{ color: sub, fontSize:12, fontWeight:'600', marginBottom:6 }}>To Date *</Text>

// //       <TouchableOpacity
// //         onPress={() => setShowToPicker(true)}
// //         style={[styles.inputRow, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border }]}
// //       >
// //         <Ionicons name="calendar-outline" size={16} color="#F5A623" style={{ marginRight:8 }} />
// //         <Text style={{ color: toDate ? txt : sub }}>
// //           {toDate || 'Select date'}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>

// //   </View>

// //   {/* FROM PICKER */}
// // {showFromPicker && Platform.OS !== 'web' && (
// //   <DateTimePicker
// //     value={fromDate ? new Date(fromDate) : new Date()}
// //     mode="date"
// //     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
// //     onChange={(event, selectedDate) => {
// //       if (event.type === 'dismissed') {
// //         setShowFromPicker(false);
// //         return;
// //       }

// //       if (selectedDate) {
// //         const formatted = selectedDate.toISOString().split('T')[0];
// //         setFromDate(formatted);

// //         if (toDate && new Date(toDate) < selectedDate) {
// //           setToDate(formatted);
// //         }
// //       }

// //       setShowFromPicker(false);
// //     }}
// //   />
// // )}

// //   {/* TO PICKER */}
// //  {showToPicker && Platform.OS !== 'web' && (
// //   <DateTimePicker
// //     value={toDate ? new Date(toDate) : new Date()}
// //     mode="date"
// //     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
// //     minimumDate={fromDate ? new Date(fromDate) : undefined}
// //     onChange={(event, selectedDate) => {
// //       if (event.type === 'dismissed') {
// //         setShowToPicker(false);
// //         return;
// //       }

// //       if (selectedDate) {
// //         const formatted = selectedDate.toISOString().split('T')[0];
// //         setToDate(formatted);
// //       }

// //       setShowToPicker(false);
// //     }}
// //   />
// // )}

// //   {/* HALF DAY */}
// //   <TouchableOpacity
// //     onPress={() => setIsHalfDay(!isHalfDay)}
// //     style={[styles.halfDayToggle, {
// //       borderColor: isHalfDay ? '#F5A62340' : border,
// //       backgroundColor: isHalfDay ? '#F5A62315' : 'transparent'
// //     }]}
// //   >
// //     <View style={[styles.checkbox, {
// //       borderColor: isHalfDay ? '#F5A623' : sub,
// //       backgroundColor: isHalfDay ? '#F5A623' : 'transparent'
// //     }]}>
// //       {isHalfDay && <Ionicons name="checkmark" size={12} color="#000" />}
// //     </View>
// //     <Text style={{ color: txt, fontSize:13, fontWeight:'600', marginLeft:10 }}>
// //       Half Day Leave
// //     </Text>
// //   </TouchableOpacity>

// //   {/* DAYS SUMMARY */}
// //   {days > 0 && (
// //     <View style={[styles.daysSummary, { backgroundColor: '#F5A62320', borderColor:'#F5A62340' }]}>
// //       <Ionicons name="time-outline" size={18} color="#F5A623" />
// //       <Text style={{ color:'#F5A623', fontWeight:'800', fontSize:15, marginLeft:8 }}>
// //         {days} Day{days !== 1 ? 's' : ''} of {selectedLeave?.name}
// //       </Text>
// //     </View>
// //   )}
// // </View>

// //         {/* Reason */}
// //         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
// //           <Text style={[styles.cardTitle, { color: txt }]}>Reason *</Text>
// //           <TextInput
// //             value={reason} onChangeText={setReason}
// //             placeholder="Briefly describe the reason for leave..."
// //             placeholderTextColor={sub}
// //             multiline numberOfLines={4}
// //             style={[styles.textArea, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
// //           />
// //           <Text style={{ color: sub, fontSize:11, marginTop:6 }}>{reason.length}/200 characters</Text>
// //         </View>

// //         {/* Summary */}
// //         <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
// //           <Text style={[styles.cardTitle, { color: txt }]}>Application Summary</Text>
// //           {[
// //             { label:'Employee', value: currentUser?.name },
// //             { label:'Leave Type', value: selectedLeave?.name },
// //             { label:'Duration', value: days > 0 ? `${days} day(s)` : 'Select dates' },
// //             { label:'Dates', value: fromDate && toDate ? `${fromDate} to ${toDate}` : 'Select dates' },
// //             { label:'Approver', value: 'HR / Manager' },
// //           ].map(row => (
// //             <View key={row.label} style={[styles.summaryRow, { borderBottomColor: border }]}>
// //               <Text style={{ color: sub, fontSize:12, flex:1 }}>{row.label}</Text>
// //               <Text style={{ color: txt, fontSize:13, fontWeight:'600' }}>{row.value}</Text>
// //             </View>
// //           ))}
// //         </View>

// //       <TouchableOpacity onPress={handleSubmit} disabled={loading}>
// //           <LinearGradient colors={['#4CAF50','#2E7D32']} style={styles.submitBtn}>
// //             <Ionicons name="send-outline" size={18} color="#FFF" />
// //            <Text style={{ color:'#FFF', fontWeight:'800', fontSize:16, marginLeft:10 }}>
// //   {loading ? 'Submitting...' : 'Submit Application'}
// // </Text>
// //           </LinearGradient>
// //         </TouchableOpacity>
// //         <View style={{ height:40 }} />
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
// //   card: { borderRadius:16, padding:16, marginBottom:16, borderWidth:1 },
// //   cardTitle: { fontSize:15, fontWeight:'800', marginBottom:14 },
// //   leaveOption: { flexDirection:'row', alignItems:'center', padding:12, borderRadius:12, borderWidth:1.5, marginBottom:10 },
// //   radio: { width:20, height:20, borderRadius:10, borderWidth:2, justifyContent:'center', alignItems:'center', marginRight:8 },
// //   radioInner: { width:10, height:10, borderRadius:5 },
// //   leaveIcon: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center' },
// //   inputRow: { flexDirection:'row', alignItems:'center', borderRadius:12, borderWidth:1, paddingHorizontal:12, paddingVertical:12 },
// //   halfDayToggle: { flexDirection:'row', alignItems:'center', padding:12, borderRadius:12, borderWidth:1, marginTop:4 },
// //   checkbox: { width:20, height:20, borderRadius:6, borderWidth:2, justifyContent:'center', alignItems:'center' },
// //   daysSummary: { flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, borderWidth:1, marginTop:12 },
// //   textArea: { borderRadius:12, borderWidth:1, padding:14, fontSize:14, height:100, textAlignVertical:'top' },
// //   summaryRow: { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1 },
// //   submitBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:16, paddingVertical:16, marginBottom:16 },
// // });
