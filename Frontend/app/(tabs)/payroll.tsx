import React, { useState } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [hidden, setHidden] = useState(true);

  const salary = currentUser?.salary || 0;
  const basic = Math.round(salary * 0.5);
  const hra = Math.round(salary * 0.2);
  const conv = Math.round(salary * 0.1);
  const special = salary - basic - hra - conv;
  const pf = Math.round(basic * 0.12);
  const esi = salary <= 21000 ? Math.round(salary * 0.0075) : 0;
  const tds = salary > 50000 ? Math.round(salary * 0.1) : 0;
  const netPay = salary - pf - esi - tds;

  const slipMonths = MONTHS.slice(0, new Date().getMonth() + 1).reverse().slice(0, 6);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  const mask = (val: number) => hidden ? '₹ •••••' : `₹ ${val.toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFFFFF','#F0F4FF']} style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: txt }]}>Payroll</Text>
          <Text style={[styles.headerSub, { color: sub }]}>Your salary & slips</Text>
        </View>
        <TouchableOpacity onPress={() => setHidden(!hidden)} style={[styles.eyeBtn, { backgroundColor: cardBg, borderColor: border }]}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color="#F5A623" />
          <Text style={{ color:'#F5A623', fontSize:11, fontWeight:'700', marginLeft:4 }}>{hidden ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* CTC Card */}
        <View style={{ padding:16 }}>
          <LinearGradient colors={['#0D47A1','#1565C0','#1976D2']} style={styles.ctcCard}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <View>
                <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:'600' }}>Monthly CTC</Text>
                <Text style={{ color:'#FFF', fontSize:32, fontWeight:'900', marginTop:4 }}>{mask(salary)}</Text>
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>Annual CTC</Text>
                <Text style={{ color:'#F5A623', fontSize:16, fontWeight:'800', marginTop:2 }}>{hidden ? '₹ ••L' : `₹ ${(salary * 12 / 100000).toFixed(2)}L`}</Text>
              </View>
            </View>

            {/* Net Pay Highlight */}
            <View style={{ backgroundColor:'rgba(255,255,255,0.1)', borderRadius:14, padding:14, marginBottom:16 }}>
              <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Net Take Home (Monthly)</Text>
              <Text style={{ color:'#4CAF50', fontSize:26, fontWeight:'900', marginTop:4 }}>{mask(netPay)}</Text>
              <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginTop:2 }}>After PF{esi > 0 ? ', ESI' : ''}{tds > 0 ? ', TDS' : ''} deductions</Text>
            </View>

            {/* Mini breakdown */}
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>Gross</Text>
                <Text style={{ color:'#FFF', fontSize:14, fontWeight:'800', marginTop:2 }}>{mask(salary)}</Text>
              </View>
              <Ionicons name="remove-outline" size={14} color="rgba(255,255,255,0.4)" />
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>Deductions</Text>
                <Text style={{ color:'#F44336', fontSize:14, fontWeight:'800', marginTop:2 }}>{mask(pf + esi + tds)}</Text>
              </View>
              <Ionicons name="remove-outline" size={14} color="rgba(255,255,255,0.4)" />
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>Net Pay</Text>
                <Text style={{ color:'#4CAF50', fontSize:14, fontWeight:'800', marginTop:2 }}>{mask(netPay)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Earnings & Deductions */}
        <View style={{ paddingHorizontal:16 }}>
          <View style={{ flexDirection:'row', gap:12 }}>
            {/* Earnings */}
            <View style={[styles.breakdownCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={{ color:'#4CAF50', fontWeight:'800', fontSize:13 }}>Earnings</Text>
              </View>
              {[
                { label:'Basic', value: basic, pct:'50%' },
                { label:'HRA', value: hra, pct:'20%' },
                { label:'Conveyance', value: conv, pct:'10%' },
                { label:'Special Allow.', value: special, pct:'20%' },
              ].map(item => (
                <View key={item.label} style={styles.breakRow}>
                  <View style={{ flex:1 }}>
                    <Text style={{ color: txt, fontSize:12, fontWeight:'600' }}>{item.label}</Text>
                    <Text style={{ color: sub, fontSize:10 }}>{item.pct}</Text>
                  </View>
                  <Text style={{ color:'#4CAF50', fontSize:12, fontWeight:'700' }}>{mask(item.value)}</Text>
                </View>
              ))}
              <View style={[styles.breakTotal, { borderTopColor: border }]}>
                <Text style={{ color: txt, fontWeight:'800', fontSize:12 }}>Gross</Text>
                <Text style={{ color:'#4CAF50', fontWeight:'900', fontSize:13 }}>{mask(salary)}</Text>
              </View>
            </View>

            {/* Deductions */}
            <View style={[styles.breakdownCard, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
                <Ionicons name="remove-circle-outline" size={16} color="#F44336" />
                <Text style={{ color:'#F44336', fontWeight:'800', fontSize:13 }}>Deductions</Text>
              </View>
              {[
                { label:"PF (Emp)", value: pf, note:"12% of basic" },
                ...(esi > 0 ? [{ label:"ESI", value: esi, note:"0.75%" }] : []),
                ...(tds > 0 ? [{ label:"TDS", value: tds, note:"10%" }] : []),
              ].map(item => (
                <View key={item.label} style={styles.breakRow}>
                  <View style={{ flex:1 }}>
                    <Text style={{ color: txt, fontSize:12, fontWeight:'600' }}>{item.label}</Text>
                    <Text style={{ color: sub, fontSize:10 }}>{item.note}</Text>
                  </View>
                  <Text style={{ color:'#F44336', fontSize:12, fontWeight:'700' }}>-{mask(item.value)}</Text>
                </View>
              ))}
              <View style={[styles.breakTotal, { borderTopColor: border }]}>
                <Text style={{ color: txt, fontWeight:'800', fontSize:12 }}>Total</Text>
                <Text style={{ color:'#F44336', fontWeight:'900', fontSize:13 }}>-{mask(pf + esi + tds)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Salary Slips */}
        <View style={{ padding:16, marginTop:8 }}>
          <Text style={[styles.sectionTitle, { color: txt }]}>Salary Slips</Text>
          {slipMonths.map((month, i) => (
            <TouchableOpacity key={month} style={[styles.slipRow, { backgroundColor: cardBg, borderColor: border }]} onPress={() => router.push('/screens/salary-slip?month=' + (MONTHS.indexOf(month) + 1))}>
              <View style={[styles.slipIcon, { backgroundColor: i === 0 ? '#F5A62320' : '#2196F320' }]}>
                <Ionicons name="document-text-outline" size={20} color={i === 0 ? '#F5A623' : '#2196F3'} />
              </View>
              <View style={{ flex:1, marginLeft:12 }}>
                <Text style={{ color: txt, fontSize:14, fontWeight:'700' }}>{month} 2025</Text>
                <Text style={{ color: sub, fontSize:12, marginTop:2 }}>Net: {mask(netPay)}</Text>
              </View>
              {i === 0 && <View style={{ backgroundColor:'#F5A62320', paddingHorizontal:8, paddingVertical:4, borderRadius:8, marginRight:8 }}>
                <Text style={{ color:'#F5A623', fontSize:10, fontWeight:'800' }}>LATEST</Text>
              </View>}
              <Ionicons name="download-outline" size={18} color={sub} />
              <Ionicons name="chevron-forward" size={16} color={sub} style={{ marginLeft:6 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* PF Employer Contribution */}
        <View style={{ paddingHorizontal:16, marginBottom:16 }}>
          <View style={[styles.pfCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2196F3" />
            <View style={{ marginLeft:12, flex:1 }}>
              <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>Employer PF Contribution</Text>
              <Text style={{ color: sub, fontSize:11, marginTop:2 }}>12% of Basic — Company's contribution to your PF</Text>
            </View>
            <Text style={{ color:'#2196F3', fontWeight:'800', fontSize:14 }}>{mask(pf)}</Text>
          </View>
        </View>

        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:22, fontWeight:'800' },
  headerSub: { fontSize:13, marginTop:2 },
  eyeBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:8, borderRadius:12, borderWidth:1 },
  ctcCard: { borderRadius:22, padding:22 },
  breakdownCard: { flex:1, borderRadius:16, padding:14, borderWidth:1 },
  breakRow: { flexDirection:'row', alignItems:'center', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  breakTotal: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:10, marginTop:6, borderTopWidth:1 },
  sectionTitle: { fontSize:17, fontWeight:'800', marginBottom:12 },
  slipRow: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:14, marginBottom:10, borderWidth:1 },
  slipIcon: { width:44, height:44, borderRadius:14, justifyContent:'center', alignItems:'center' },
  pfCard: { flexDirection:'row', alignItems:'center', borderRadius:14, padding:14, borderWidth:1 },
});
