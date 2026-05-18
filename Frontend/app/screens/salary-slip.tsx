import React, { useState, useRef } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { COMPANIES } from '../../data/company';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function SalarySlipScreen() {
  const { isDark, theme } = useTheme();
  const router    = useRouter();
  const { month: monthParam, empId } = useLocalSearchParams<{ month?: string; empId?: string }>();

  const currentUser  = useSelector((s: RootState) => s.auth.user);
  const allEmployees = useSelector((s: RootState) => s.employees.list);

  const isAdmin = currentUser?.role === 'admin';
  const isHR    = currentUser?.role === 'hr';

  const targetEmpId = empId ? String(empId) : String(currentUser?.id);
  const employee    = allEmployees.find((e: any) => String(e.id) === targetEmpId) || currentUser;

  if (!isAdmin && !isHR && String(currentUser?.id) !== targetEmpId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0A0A0F' : '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="lock-closed" size={60} color="#F44336" />
        <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Access Restricted</Text>
        <Text style={{ color: '#888', marginTop: 8 }}>You cannot view another employee's salary slip</Text>
      </SafeAreaView>
    );
  }

  const now      = new Date();
  const [selMonth, setSelMonth] = useState(monthParam ? parseInt(monthParam) - 1 : now.getMonth());
  const [hidden,   setHidden]   = useState(false);
  const monthLabel = MONTHS[selMonth];

  if (!employee) return null;

  const salary   = (employee as any).salary || 0;
  const basic    = Math.round(salary * 0.5);
  const hra      = Math.round(salary * 0.2);
  const conv     = Math.round(salary * 0.1);
  const special  = salary - basic - hra - conv;
  const medical  = 1250;
  const gross    = salary + medical;
  const pf       = Math.round(basic * 0.12);
  const empPF    = Math.round(basic * 0.12);
  const esi      = salary <= 21000 ? Math.round(salary * 0.0075) : 0;
  const tds      = salary > 50000  ? Math.round(salary * 0.1)    : 0;
  const pt       = 200;
  const totalDed = pf + esi + tds + pt;
  const netPay   = salary - totalDed;
  const company  = COMPANIES[(employee as any).company || 'monk-outsourcing'];

  const mask = (v: number) => hidden ? '₹ ****' : `₹ ${v.toLocaleString('en-IN')}`;

  const slipMonths = MONTHS.slice(0, now.getMonth() + 1).reverse().slice(0, 6);

  // ── PDF / Download ──────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (Platform.OS === 'web') {
      // Build a clean HTML document and trigger browser print/save-as-PDF
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Salary Slip — ${(employee as any).name} — ${monthLabel} 2025</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
    body{background:#fff;color:#333;padding:30px;font-size:13px}
    .header{background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;padding:20px;border-radius:10px;margin-bottom:20px}
    .co-name{font-size:18px;font-weight:900;margin-bottom:4px}
    .slip-title{color:#F5A623;font-size:14px;font-weight:800;letter-spacing:2px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.2)}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    td{padding:6px 10px;font-size:12px}
    .lbl{color:#888;font-size:10px;text-transform:uppercase;font-weight:700}
    .val{font-size:12px;font-weight:600}
    .earn-head{background:#e8f5e9;color:#2e7d32;font-weight:800;padding:8px 10px}
    .ded-head{background:#ffebee;color:#c62828;font-weight:800;padding:8px 10px}
    .earn-row td{border-bottom:1px solid #f0f0f0}
    .total-row td{border-top:2px solid #ddd;font-weight:800;padding-top:10px}
    .net{background:linear-gradient(135deg,#F5A623,#E6940F);border-radius:10px;padding:16px;margin:16px 0;display:flex;justify-content:space-between;align-items:center}
    .net-title{font-size:11px;font-weight:700;color:rgba(0,0,0,0.6)}
    .net-val{font-size:24px;font-weight:900;color:#000;margin-top:4px}
    .foot{font-size:10px;color:#aaa;text-align:center;margin-top:16px}
    @media print{body{padding:10px}}
  </style>
</head>
<body>
<div class="header">
  <div class="co-name">${company?.name || 'Monk Group'}</div>
  <div style="font-size:11px;opacity:0.7">${company?.address?.usa || 'India'}</div>
  <div class="slip-title">SALARY SLIP — ${monthLabel.toUpperCase()} 2025</div>
</div>

<table>
  <tr><td class="lbl">Employee Name</td><td class="val">${(employee as any).name}</td><td class="lbl">Employee ID</td><td class="val">${(employee as any).employeeCode || (employee as any).id}</td></tr>
  <tr><td class="lbl">Designation</td><td class="val">${(employee as any).designation}</td><td class="lbl">Department</td><td class="val">${(employee as any).department}</td></tr>
  <tr><td class="lbl">Date of Joining</td><td class="val">${(employee as any).dateOfJoining || (employee as any).doj}</td><td class="lbl">Pay Period</td><td class="val">1 ${monthLabel} – ${new Date(2025, MONTHS.indexOf(monthLabel) + 1, 0).getDate()} ${monthLabel} 2025</td></tr>
</table>

<table>
  <tr><th class="earn-head" style="text-align:left;width:50%">EARNINGS</th><th class="earn-head" style="text-align:right">AMOUNT</th>
      <th class="ded-head"  style="text-align:left;width:25%">DEDUCTIONS</th><th class="ded-head" style="text-align:right">AMOUNT</th></tr>
  <tr class="earn-row">
    <td>Basic Salary (50%)</td><td style="text-align:right;color:#2e7d32">₹ ${basic.toLocaleString('en-IN')}</td>
    <td>PF (Employee 12%)</td><td style="text-align:right;color:#c62828">₹ ${pf.toLocaleString('en-IN')}</td>
  </tr>
  <tr class="earn-row">
    <td>House Rent Allowance (20%)</td><td style="text-align:right;color:#2e7d32">₹ ${hra.toLocaleString('en-IN')}</td>
    ${esi > 0 ? `<td>ESI (Employee 0.75%)</td><td style="text-align:right;color:#c62828">₹ ${esi.toLocaleString('en-IN')}</td>` : '<td></td><td></td>'}
  </tr>
  <tr class="earn-row">
    <td>Conveyance Allowance (10%)</td><td style="text-align:right;color:#2e7d32">₹ ${conv.toLocaleString('en-IN')}</td>
    ${tds > 0 ? `<td>TDS (Income Tax 10%)</td><td style="text-align:right;color:#c62828">₹ ${tds.toLocaleString('en-IN')}</td>` : '<td></td><td></td>'}
  </tr>
  <tr class="earn-row">
    <td>Special Allowance</td><td style="text-align:right;color:#2e7d32">₹ ${special.toLocaleString('en-IN')}</td>
    <td>Professional Tax</td><td style="text-align:right;color:#c62828">₹ ${pt.toLocaleString('en-IN')}</td>
  </tr>
  <tr class="earn-row">
    <td>Medical Allowance</td><td style="text-align:right;color:#2e7d32">₹ ${medical.toLocaleString('en-IN')}</td>
    <td></td><td></td>
  </tr>
  <tr class="total-row">
    <td>Gross Pay</td><td style="text-align:right;color:#2e7d32;font-size:14px">₹ ${gross.toLocaleString('en-IN')}</td>
    <td>Total Deductions</td><td style="text-align:right;color:#c62828;font-size:14px">₹ ${totalDed.toLocaleString('en-IN')}</td>
  </tr>
</table>

<div class="net">
  <div>
    <div class="net-title">NET TAKE HOME PAY</div>
    <div class="net-val">₹ ${netPay.toLocaleString('en-IN')}</div>
    <div style="font-size:10px;color:rgba(0,0,0,0.6);margin-top:4px">${monthLabel} 2025 · Payable on last working day</div>
  </div>
</div>

<p class="foot">This is a computer-generated payslip and does not require a signature.<br>For any discrepancy, contact HR within 7 days of receipt.</p>
</body>
</html>`;

      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 500);
      }
    } else {
      // Mobile: share as text summary
      Share.share({
        title:   `Salary Slip — ${(employee as any).name} — ${monthLabel} 2025`,
        message: `SALARY SLIP — ${monthLabel} 2025\n\nEmployee: ${(employee as any).name}\nID: ${(employee as any).employeeCode || (employee as any).id}\nDesignation: ${(employee as any).designation}\n\nGross Pay: ₹${gross.toLocaleString('en-IN')}\nTotal Deductions: ₹${totalDed.toLocaleString('en-IN')}\nNet Take Home: ₹${netPay.toLocaleString('en-IN')}\n\nGenerated by Monk Group HRMS`,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <LinearGradient colors={isDark ? ['#0F0F1A', '#141420'] : ['#FFF', '#F0F4FF']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <Text style={{ color: isDark ? '#FFF' : '#1A1A2E', fontSize: 18, fontWeight: '800', marginLeft: 12, flex: 1 }}>Salary Slip</Text>
        <TouchableOpacity onPress={() => setHidden(!hidden)} style={[s.iconBtn, { borderColor: theme.border }]}>
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={16} color="#F5A623" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownload} style={[s.iconBtn, { borderColor: theme.border, marginLeft: 8 }]}>
          <Ionicons name={Platform.OS === 'web' ? 'print-outline' : 'share-outline'} size={16} color="#2196F3" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Month chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
      >
        {slipMonths.map((m, i) => {
          const mIdx = MONTHS.indexOf(m);
          return (
            <TouchableOpacity
              key={m}
              onPress={() => setSelMonth(mIdx)}
              style={[s.monthChip, {
                backgroundColor: selMonth === mIdx ? '#F5A623' : (isDark ? '#1A1A2E' : '#F0F4FF'),
                borderColor:     selMonth === mIdx ? '#F5A623' : (isDark ? '#2A2A40' : '#E0E6FF'),
              }]}
            >
              <Text style={{ color: selMonth === mIdx ? '#000' : (isDark ? '#BBB' : '#666'), fontWeight: '700', fontSize: 12 }}>
                {m.slice(0, 3)} {i === 0 ? '⭐' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          <View style={[s.slipDoc, { backgroundColor: isDark ? '#141420' : '#FFFFFF', borderColor: isDark ? '#2A2A40' : '#E0E6FF' }]}>

            {/* Header */}
            <LinearGradient colors={['#0D47A1', '#1565C0']} style={{ padding: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={s.coLogo}><Text style={{ color: '#000', fontWeight: '900', fontSize: 18 }}>M</Text></View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{company?.name}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{company?.address?.usa || 'India'}</Text>
                </View>
              </View>
              <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ color: '#F5A623', fontSize: 13, fontWeight: '800', letterSpacing: 2 }}>SALARY SLIP</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>{monthLabel} 2025</Text>
              </View>
            </LinearGradient>

            {/* Employee details */}
            <View style={[s.empSection, { borderBottomColor: isDark ? '#2A2A40' : '#E8E8E8' }]}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <SlipRow label="Employee Name" value={(employee as any).name} />
                  <SlipRow label="Employee ID"   value={(employee as any).employeeCode || String((employee as any).id || '')} />
                  <SlipRow label="Designation"   value={(employee as any).designation} />
                  <SlipRow label="Department"    value={(employee as any).department} />
                </View>
                <View style={{ flex: 1 }}>
                  <SlipRow label="Date of Joining" value={(employee as any).dateOfJoining || (employee as any).doj || '—'} />
                  <SlipRow label="Pay Period"      value={`1–${new Date(2025, MONTHS.indexOf(monthLabel) + 1, 0).getDate()} ${monthLabel} 2025`} />
                  <SlipRow label="Bank Account"    value={hidden ? '****' : ((employee as any).bankAccount || 'N/A')} />
                  <SlipRow label="PAN Number"      value={hidden ? '****' : ((employee as any).panCard || 'N/A')} />
                </View>
              </View>
            </View>

            {/* Pay details */}
            <View style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Earnings */}
                <View style={{ flex: 1 }}>
                  <View style={[s.tableHead, { backgroundColor: '#4CAF5020' }]}>
                    <Text style={{ color: '#4CAF50', fontWeight: '800', fontSize: 11 }}>EARNINGS</Text>
                    <Text style={{ color: '#4CAF50', fontWeight: '800', fontSize: 11 }}>AMOUNT</Text>
                  </View>
                  {[
                    { label: 'Basic (50%)',  value: basic   },
                    { label: 'HRA (20%)',    value: hra     },
                    { label: 'Conveyance',   value: conv    },
                    { label: 'Special',      value: special },
                    { label: 'Medical',      value: medical },
                  ].map(e => (
                    <View key={e.label} style={[s.tableRow, { borderBottomColor: isDark ? '#2A2A40' : '#F0F0F0' }]}>
                      <Text style={{ color: isDark ? '#CCC' : '#444', fontSize: 11, flex: 1 }}>{e.label}</Text>
                      <Text style={{ color: '#4CAF50', fontSize: 11, fontWeight: '700' }}>{mask(e.value)}</Text>
                    </View>
                  ))}
                  <View style={[s.tableTotal, { borderTopColor: isDark ? '#3A3A50' : '#DDD' }]}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontWeight: '800', fontSize: 12, flex: 1 }}>Gross Pay</Text>
                    <Text style={{ color: '#4CAF50', fontWeight: '900', fontSize: 13 }}>{mask(gross)}</Text>
                  </View>
                </View>

                {/* Deductions */}
                <View style={{ flex: 1 }}>
                  <View style={[s.tableHead, { backgroundColor: '#F4433620' }]}>
                    <Text style={{ color: '#F44336', fontWeight: '800', fontSize: 11 }}>DEDUCTIONS</Text>
                    <Text style={{ color: '#F44336', fontWeight: '800', fontSize: 11 }}>AMOUNT</Text>
                  </View>
                  {[
                    { label: 'PF (Emp 12%)',   value: pf  },
                    ...(esi > 0 ? [{ label: 'ESI 0.75%', value: esi }] : []),
                    ...(tds > 0 ? [{ label: 'TDS 10%',   value: tds }] : []),
                    { label: 'Prof. Tax',       value: pt  },
                  ].map(d => (
                    <View key={d.label} style={[s.tableRow, { borderBottomColor: isDark ? '#2A2A40' : '#F0F0F0' }]}>
                      <Text style={{ color: isDark ? '#CCC' : '#444', fontSize: 11, flex: 1 }}>{d.label}</Text>
                      <Text style={{ color: '#F44336', fontSize: 11, fontWeight: '700' }}>-{mask(d.value)}</Text>
                    </View>
                  ))}
                  <View style={[s.tableTotal, { borderTopColor: isDark ? '#3A3A50' : '#DDD' }]}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontWeight: '800', fontSize: 12, flex: 1 }}>Total Ded.</Text>
                    <Text style={{ color: '#F44336', fontWeight: '900', fontSize: 13 }}>-{mask(totalDed)}</Text>
                  </View>
                </View>
              </View>

              {/* Net Pay */}
              <LinearGradient colors={['#F5A623', '#E6940F']} style={s.netPayBanner}>
                <View>
                  <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 11, fontWeight: '700' }}>NET TAKE HOME PAY</Text>
                  <Text style={{ color: '#000', fontSize: 28, fontWeight: '900', marginTop: 4 }}>{mask(netPay)}</Text>
                  <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 10, marginTop: 2 }}>
                    {monthLabel} 2025 · Payable on last working day
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={40} color="rgba(0,0,0,0.3)" />
              </LinearGradient>

              {/* Employer contribution */}
              <View style={[s.empContrib, { backgroundColor: isDark ? '#1E1E2E' : '#F8F8FF', borderColor: isDark ? '#2A2A40' : '#E8E8E8' }]}>
                <Text style={{ color: isDark ? '#AAA' : '#666', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
                  EMPLOYER CONTRIBUTIONS (not deducted from salary)
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: isDark ? '#CCC' : '#444', fontSize: 11 }}>Employer PF (12% of basic)</Text>
                  <Text style={{ color: '#2196F3', fontSize: 11, fontWeight: '700' }}>{mask(empPF)}</Text>
                </View>
                {esi > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: isDark ? '#CCC' : '#444', fontSize: 11 }}>Employer ESI (3.25%)</Text>
                    <Text style={{ color: '#2196F3', fontSize: 11, fontWeight: '700' }}>{mask(Math.round(salary * 0.0325))}</Text>
                  </View>
                )}
              </View>

              {/* Download button */}
              <TouchableOpacity onPress={handleDownload}>
                <LinearGradient colors={['#2196F3', '#1565C0']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 13, marginTop: 8 }}>
                  <Ionicons name={Platform.OS === 'web' ? 'print-outline' : 'share-outline'} size={18} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>
                    {Platform.OS === 'web' ? 'Print / Save as PDF' : 'Share Salary Slip'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={{ color: isDark ? '#555' : '#AAA', fontSize: 10, textAlign: 'center', marginTop: 14, lineHeight: 15 }}>
                Computer-generated payslip · No signature required{'\n'}
                For discrepancies contact HR within 7 days
              </Text>
            </View>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SlipRow = ({ label, value }: { label: string; value: string }) => (
  <View style={{ marginBottom: 6 }}>
    <Text style={{ color: '#888', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ color: '#333', fontSize: 11, fontWeight: '600', marginTop: 1 }}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  iconBtn:      { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  monthChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  slipDoc:      { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  coLogo:       { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5A623', justifyContent: 'center', alignItems: 'center' },
  empSection:   { padding: 14, borderBottomWidth: 1 },
  tableHead:    { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderRadius: 6, marginBottom: 4 },
  tableRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  tableTotal:   { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1 },
  netPayBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 12 },
  empContrib:   { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10 },
});