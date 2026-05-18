// import React, { useState } from 'react';
// import {
//   View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
//   SafeAreaView, StatusBar, TextInput, Alert,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch, createEmployeeThunk, updateEmployeeThunk } from '../../store';
// import { useTheme } from '../../hooks/useTheme';
// import { DEPARTMENTS, COMPANIES } from '../../data/company';


// const ROLES = ['admin','hr','manager','employee'];

// export default function AddEditEmployeeScreen() {
//   const [saving, setSaving] = useState(false);
//   const { isDark, theme } = useTheme();
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const { id } = useLocalSearchParams<{ id?: string }>();
//   const existing = useSelector((s: RootState) => s.employees.list.find((e:any) => String(e.id) === String(id)));

//   const [form, setForm] = useState({
//     name: existing?.name || '',
//     designation: existing?.designation || '',
//     email: existing?.email || '',
//     phone: existing?.phone || '',
//     department: existing?.department || 'it',
//     company: existing?.company || 'monk-outsourcing',
//     role: existing?.role || 'employee',
//     dob: existing?.dateOfBirth || existing?.dob || '',
//     doj: existing?.dateOfJoining || existing?.doj || '',
//     address: existing?.address || '',
//     bloodGroup: existing?.bloodGroup || 'O+',
//     gender: existing?.gender || 'Male',
//     salary: String(existing?.salary || 30000),
//     employmentType: existing?.employmentType || 'Full-time',
//     reportingTo: existing?.reportingToId ? String(existing.reportingToId) : '',
//     avatar: existing?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
//     panCard: existing?.panCard || '',
//     bankAccount: existing?.bankAccount || '',
//     ifsc: existing?.ifsc || '',
//     aadhar: existing?.aadhar || '',
//     emergencyContact: existing?.emergencyContact || '',
//     fingerprintId: existing?.fingerprintId || '',
//   });

//   const isEdit = !!existing;

//   const bg = theme.bg;
//   const cardBg = theme.bgCard;
//   const txt = theme.text;
//   const sub = theme.textSub;
//   const border = theme.border;
// const Field = ({
//   label,
//   value,
//   onChange,
//   placeholder,
//   keyboardType = 'default',
//   multiline = false,
//   isDark,
//   border,
//   txt,
// }: any) => {
//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
//         {label}
//       </Text>

//       <TextInput
//         value={value}
//         onChangeText={onChange}
//         placeholder={placeholder}
//         placeholderTextColor={isDark ? '#444' : '#AAA'}
//         keyboardType={keyboardType}
//         multiline={multiline}
//         blurOnSubmit={false}
//         returnKeyType="next"
//         style={{
//           borderRadius: 12,
//           borderWidth: 1,
//           paddingHorizontal: 14,
//           paddingVertical: 12,
//           fontSize: 14,
//           textAlignVertical: 'top',
//           backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF',
//           borderColor: border,
//           color: txt,
//           height: multiline ? 80 : 48,
//         }}
//       />
//     </View>
//   );
// };

//   const SelectField = ({ label, field, options }: { label: string; field: string; options: { label: string; value: string }[] }) => (
//     <View style={{ marginBottom:14 }}>
//       <Text style={{ color: sub, fontSize:12, fontWeight:'600', marginBottom:6 }}>{label}</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
//         {options.map(opt => (
//           <TouchableOpacity key={opt.value} onPress={() => setForm(f => ({ ...f, [field]: opt.value }))}
//             style={[styles.selectChip, { backgroundColor: (form as any)[field] === opt.value ? '#F5A623' : (isDark ? '#1E1E2E' : '#F0F4FF'), borderColor: (form as any)[field] === opt.value ? '#F5A623' : border }]}>
//             <Text style={{ color: (form as any)[field] === opt.value ? '#000' : txt, fontSize:12, fontWeight:'600' }}>{opt.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//   );

// const handleSave = async () => {
//   if (saving) return;

//   if (!form.name || !form.email || !form.designation) {
//     Alert.alert('Error', 'Name, email, and designation are required.');
//     return;
//   }

//   setSaving(true);

//   try {
//     const payload = {
//       name: form.name,
//       designation: form.designation,
//       email: form.email,
//       phone: form.phone,
//       department: form.department,
//       company: form.company,
//       role: form.role,
//       dateOfBirth: form.dob,
//       dateOfJoining: form.doj,
//       address: form.address,
//       bloodGroup: form.bloodGroup,
//       gender: form.gender,
//       salary: parseInt(form.salary) || 0,
//       employmentType: form.employmentType,
//       reportingToId: form.reportingTo ? parseInt(form.reportingTo) || null : null,
//       avatar: form.avatar,
//       fingerprintId: form.fingerprintId,
//       panCard: form.panCard,
//       bankAccount: form.bankAccount,
//       ifsc: form.ifsc,
//       aadhar: form.aadhar,
//       emergencyContact: form.emergencyContact,
//       password: 'monk@123',
//     };

//     console.log("PAYLOAD:", payload);

//     let result;

//     if (isEdit) {
//       result = await dispatch(updateEmployeeThunk({
//         id: Number(existing!.id),
//         data: payload,
//       }));
//     } else {
//       result = await dispatch(createEmployeeThunk(payload));
//     }

//     if (
//       createEmployeeThunk.fulfilled.match(result) ||
//       updateEmployeeThunk.fulfilled.match(result)
//     ) {
//       Alert.alert('Success', 'Employee saved successfully!', [
//         { text: 'OK', onPress: () => router.back() },
//       ]);
//     } else {
//       Alert.alert('Error', 'API failed. Check backend.');
//     }

//   } catch (err) {
//     console.log("ERROR:", err);
//     Alert.alert('Error', 'Something went wrong');
//   } finally {
//     setSaving(false);
//   }
// };

//   return (
//     <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
//       <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

//       {/* Header */}
//       <LinearGradient colors={isEdit ? ['#1565C0','#1976D2'] : ['#2E7D32','#388E3C']} style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color="#FFF" />
//         </TouchableOpacity>
//         <Text style={{ color:'#FFF', fontSize:18, fontWeight:'800', marginLeft:12, flex:1 }}>
//           {isEdit ? 'Edit Employee' : 'Add New Employee'}
//         </Text>
//         <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
//           <Text style={{ color:'#FFF', fontWeight:'800', fontSize:14 }}>Save</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       <ScrollView style={{ padding:16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
// {/* 
//         <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.sectionTitle, { color: txt }]}>👤 Basic Information</Text>
//           <Field label="Full Name *" field="name" placeholder="e.g. Rahul Sharma" />
//           <Field label="Designation *" field="designation" placeholder="e.g. Senior Developer" />
//           <Field label="Work Email *" field="email" placeholder="name@monkoutsourcing.com" keyboardType="email-address" />
//           <Field label="Phone" field="phone" placeholder="+91 98765 XXXXX" keyboardType="phone-pad" />
//           <SelectField label="Gender" field="gender" options={['Male','Female','Other'].map(v => ({ label:v, value:v }))} />
//           <Field label="Date of Birth (YYYY-MM-DD)" field="dob" placeholder="1995-03-15" />
//           <Field label="Profile Avatar URL" field="avatar" placeholder="https://..." />
//         </View> */}

//         <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
//   <Text style={[styles.sectionTitle, { color: txt }]}>👤 Basic Information</Text>

//   <Field
//     label="Full Name *"
//     value={form.name}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, name: val }))
//     }
//     placeholder="e.g. Rahul Sharma"
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />

//   <Field
//     label="Designation *"
//     value={form.designation}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, designation: val }))
//     }
//     placeholder="e.g. Senior Developer"
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />

//   <Field
//     label="Work Email *"
//     value={form.email}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, email: val }))
//     }
//     placeholder="name@monkoutsourcing.com"
//     keyboardType="email-address"
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />

//   <Field
//     label="Phone"
//     value={form.phone}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, phone: val }))
//     }
//     placeholder="+91 98765 XXXXX"
//     keyboardType="phone-pad"
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />

//   <SelectField
//     label="Gender"
//     field="gender"
//     options={['Male','Female','Other'].map(v => ({ label:v, value:v }))}
//   />

//   <Field
//     label="Date of Birth (YYYY-MM-DD)"
//     value={form.dob}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, dob: val }))
//     }
//     placeholder="1995-03-15"
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />

//   <Field
//     label="Profile Avatar URL"
//     value={form.avatar}
//     onChange={(val: string) =>
//       setForm(f => ({ ...f, avatar: val }))
//     }
//     placeholder="https://..."
//     isDark={isDark}
//     border={border}
//     txt={txt}
//   />
// </View>

//         <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.sectionTitle, { color: txt }]}>🏢 Work Details</Text>
//           <SelectField label="Company" field="company" options={[{label:'Monk Outsourcing',value:'monk-outsourcing'},{label:'Monk Travel Tech',value:'monk-travel-tech'}]} />
//           <SelectField label="Department" field="department" options={DEPARTMENTS.map(d => ({ label: d.name, value: d.id }))} />
//           <SelectField label="Role" field="role" options={ROLES.map(r => ({ label: r.charAt(0).toUpperCase() + r.slice(1), value: r }))} />
//           <Field label="Date of Joining (YYYY-MM-DD)" field="doj" placeholder="2024-01-15" />
//           <SelectField label="Employment Type" field="employmentType" options={['Full-time','Part-time','Contract','Intern'].map(v => ({ label:v, value:v }))} />
//           <Field label="Reporting To (Employee ID)" field="reportingTo" placeholder="EMP001" />
//           <Field label="Fingerprint ID" field="fingerprintId" placeholder="FP021" />
//         </View>

//         <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.sectionTitle, { color: txt }]}>💰 Salary & Finance</Text>
//           <Field label="Monthly CTC (₹)" field="salary" placeholder="45000" keyboardType="numeric" />
//           <Field label="PAN Card" field="panCard" placeholder="ABCDE1234F" />
//           <Field label="Bank Account (last 4 digits)" field="bankAccount" placeholder="XXXX XXXX 1234" />
//           <Field label="IFSC Code" field="ifsc" placeholder="HDFC0001234" />
//           <Field label="Aadhaar (masked)" field="aadhar" placeholder="XXXX XXXX 5678" />
//         </View>

//         <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
//           <Text style={[styles.sectionTitle, { color: txt }]}>📋 Other Details</Text>
//           <SelectField label="Blood Group" field="bloodGroup" options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ label:v, value:v }))} />
//           <Field label="Address" field="address" placeholder="City, State" multiline />
//           <Field label="Emergency Contact" field="emergencyContact" placeholder="+91 98765 XXXXX" keyboardType="phone-pad" />
//         </View>

//         <TouchableOpacity onPress={handleSave}>
//           <LinearGradient colors={isEdit ? ['#1565C0','#1976D2'] : ['#2E7D32','#388E3C']} style={styles.submitBtn}>
//             <Ionicons name={isEdit ? 'save-outline' : 'person-add-outline'} size={20} color="#FFF" />
//             <Text style={{ color:'#FFF', fontWeight:'800', fontSize:16, marginLeft:8 }}>
//               {isEdit ? 'Save Changes' : 'Create Employee'}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <View style={{ height:40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
//   saveBtn: { backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:16, paddingVertical:8, borderRadius:12 },
//   section: { borderRadius:16, padding:16, marginBottom:16, borderWidth:1 },
//   sectionTitle: { fontSize:15, fontWeight:'800', marginBottom:14 },
//   input: { borderRadius:12, borderWidth:1, paddingHorizontal:14, paddingVertical:12, fontSize:14, textAlignVertical:'top' },
//   selectChip: { paddingHorizontal:14, paddingVertical:8, borderRadius:10, borderWidth:1 },
//   submitBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:16, paddingVertical:16, marginBottom:16 },
// });
import React, { useState } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, createEmployeeThunk, updateEmployeeThunk, fetchEmployeesThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { DEPARTMENTS } from '../../data/company';

const ROLES = ['admin', 'hr', 'manager', 'employee'];

export default function AddEditEmployeeScreen() {
  const [saving, setSaving] = useState(false);
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useSelector((s: RootState) => s.employees.list.find((e: any) => String(e.id) === String(id)));

  const [form, setForm] = useState({
    name: existing?.name || '',
    designation: existing?.designation || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    department: existing?.department || 'it',
    company: existing?.company || 'monk-outsourcing',
    role: existing?.role || 'employee',
    dob: existing?.dateOfBirth || (existing as any)?.dob || '',
    doj: existing?.dateOfJoining || (existing as any)?.doj || '',
    address: existing?.address || '',
    bloodGroup: existing?.bloodGroup || 'O+',
    gender: existing?.gender || 'Male',
    salary: String(existing?.salary || 30000),
    employmentType: existing?.employmentType || 'Full-time',
    reportingTo: existing?.reportingToId ? String(existing.reportingToId) : '',
    avatar: existing?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    panCard: (existing as any)?.panCard || '',
    bankAccount: (existing as any)?.bankAccount || '',
    ifsc: (existing as any)?.ifsc || '',
    aadhar: (existing as any)?.aadhar || '',
    emergencyContact: (existing as any)?.emergencyContact || '',
    fingerprintId: (existing as any)?.fingerprintId || '',
  });

  const isEdit = !!existing;

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const Field = ({
    label,
    value,
    onChange,
    placeholder,
    keyboardType = 'default',
    multiline = false,
  }: any) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#444' : '#AAA'}
        keyboardType={keyboardType}
        multiline={multiline}
        blurOnSubmit={false}
        returnKeyType="next"
        style={{
          borderRadius: 12,
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          textAlignVertical: 'top',
          backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF',
          borderColor: border,
          color: txt,
          height: multiline ? 80 : 48,
        }}
      />
    </View>
  );

  const SelectField = ({
    label,
    field,
    options,
  }: { label: string; field: string; options: { label: string; value: string }[] }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: sub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setForm(f => ({ ...f, [field]: opt.value }))}
            style={[
              styles.selectChip,
              {
                backgroundColor: (form as any)[field] === opt.value ? '#F5A623' : (isDark ? '#1E1E2E' : '#F0F4FF'),
                borderColor: (form as any)[field] === opt.value ? '#F5A623' : border,
              },
            ]}
          >
            <Text style={{
              color: (form as any)[field] === opt.value ? '#000' : txt,
              fontSize: 12,
              fontWeight: '600',
            }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleSave = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }
    if (!form.designation.trim()) {
      Alert.alert('Validation Error', 'Designation is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        department: form.department,
        company: form.company,
        role: form.role,
        dateOfBirth: form.dob || '1990-01-01',
        dateOfJoining: form.doj || new Date().toISOString().split('T')[0],
        address: form.address,
        bloodGroup: form.bloodGroup,
        gender: form.gender,
        salary: parseInt(form.salary) || 30000,
        employmentType: form.employmentType,
        reportingToId: form.reportingTo ? parseInt(form.reportingTo) || null : null,
        avatar: form.avatar,
        fingerprintId: form.fingerprintId,
        panCard: form.panCard,
        bankAccount: form.bankAccount,
        ifsc: form.ifsc,
        aadhar: form.aadhar,
        emergencyContact: form.emergencyContact,
        password: 'monk@123',
      };

      let result;
      if (isEdit) {
        result = await dispatch(updateEmployeeThunk({ id: Number(existing!.id), data: payload }));
      } else {
        result = await dispatch(createEmployeeThunk(payload));
      }

      const isSuccess = isEdit
        ? updateEmployeeThunk.fulfilled.match(result)
        : createEmployeeThunk.fulfilled.match(result);

      if (isSuccess) {
        dispatch(fetchEmployeesThunk());
        Alert.alert(
          '✅ Success',
          isEdit ? 'Employee updated successfully!' : 'New employee created successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const errMsg = (result as any)?.error?.message || (result as any)?.payload || 'API error. Please check backend.';
        Alert.alert('❌ Error', errMsg);
      }
    } catch (err: any) {
      Alert.alert('❌ Error', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={isEdit ? ['#1565C0', '#1976D2'] : ['#2E7D32', '#388E3C']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', marginLeft: 12, flex: 1 }}>
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]}
          disabled={saving}
        >
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">

        {/* Basic Info */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: txt }]}>👤 Basic Information</Text>
          <Field label="Full Name *" value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Rahul Sharma" />
          <Field label="Designation *" value={form.designation} onChange={(v: string) => setForm(f => ({ ...f, designation: v }))} placeholder="e.g. Senior Developer" />
          <Field label="Work Email *" value={form.email} onChange={(v: string) => setForm(f => ({ ...f, email: v }))} placeholder="name@monkoutsourcing.com" keyboardType="email-address" />
          <Field label="Phone" value={form.phone} onChange={(v: string) => setForm(f => ({ ...f, phone: v }))} placeholder="+91 98765 XXXXX" keyboardType="phone-pad" />
          <SelectField label="Gender" field="gender" options={['Male', 'Female', 'Other'].map(v => ({ label: v, value: v }))} />
          <Field label="Date of Birth (YYYY-MM-DD)" value={form.dob} onChange={(v: string) => setForm(f => ({ ...f, dob: v }))} placeholder="1995-03-15" />
          <Field label="Profile Avatar URL" value={form.avatar} onChange={(v: string) => setForm(f => ({ ...f, avatar: v }))} placeholder="https://..." />
        </View>

        {/* Work Details */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: txt }]}>🏢 Work Details</Text>
          <SelectField
            label="Company"
            field="company"
            options={[
              { label: 'Monk Outsourcing', value: 'monk-outsourcing' },
              { label: 'Monk Travel Tech', value: 'monk-travel-tech' },
            ]}
          />
          <SelectField
            label="Department"
            field="department"
            options={DEPARTMENTS.map(d => ({ label: d.name, value: d.id }))}
          />
          <SelectField
            label="Role"
            field="role"
            options={ROLES.map(r => ({ label: r.charAt(0).toUpperCase() + r.slice(1), value: r }))}
          />
          <Field
            label="Date of Joining (YYYY-MM-DD)"
            value={form.doj}
            onChange={(v: string) => setForm(f => ({ ...f, doj: v }))}
            placeholder="2024-01-15"
          />
          <SelectField
            label="Employment Type"
            field="employmentType"
            options={['Full-time', 'Part-time', 'Contract', 'Intern'].map(v => ({ label: v, value: v }))}
          />
          <Field
            label="Reporting To (Employee ID)"
            value={form.reportingTo}
            onChange={(v: string) => setForm(f => ({ ...f, reportingTo: v }))}
            placeholder="1"
            keyboardType="numeric"
          />
          <Field
            label="Fingerprint ID"
            value={form.fingerprintId}
            onChange={(v: string) => setForm(f => ({ ...f, fingerprintId: v }))}
            placeholder="FP021"
          />
        </View>

        {/* Salary & Finance */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: txt }]}>💰 Salary & Finance</Text>
          <Field label="Monthly CTC (₹)" value={form.salary} onChange={(v: string) => setForm(f => ({ ...f, salary: v }))} placeholder="45000" keyboardType="numeric" />
          <Field label="PAN Card" value={form.panCard} onChange={(v: string) => setForm(f => ({ ...f, panCard: v }))} placeholder="ABCDE1234F" />
          <Field label="Bank Account" value={form.bankAccount} onChange={(v: string) => setForm(f => ({ ...f, bankAccount: v }))} placeholder="XXXX XXXX 1234" />
          <Field label="IFSC Code" value={form.ifsc} onChange={(v: string) => setForm(f => ({ ...f, ifsc: v }))} placeholder="HDFC0001234" />
          <Field label="Aadhaar (masked)" value={form.aadhar} onChange={(v: string) => setForm(f => ({ ...f, aadhar: v }))} placeholder="XXXX XXXX 5678" />
        </View>

        {/* Other Details */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: txt }]}>📋 Other Details</Text>
          <SelectField
            label="Blood Group"
            field="bloodGroup"
            options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ label: v, value: v }))}
          />
          <Field label="Address" value={form.address} onChange={(v: string) => setForm(f => ({ ...f, address: v }))} placeholder="City, State" multiline />
          <Field label="Emergency Contact" value={form.emergencyContact} onChange={(v: string) => setForm(f => ({ ...f, emergencyContact: v }))} placeholder="+91 98765 XXXXX" keyboardType="phone-pad" />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <LinearGradient
            colors={saving ? ['#888', '#666'] : isEdit ? ['#1565C0', '#1976D2'] : ['#2E7D32', '#388E3C']}
            style={styles.submitBtn}
          >
            <Ionicons name={isEdit ? 'save-outline' : 'person-add-outline'} size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16, marginLeft: 8 }}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  section: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  selectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
});