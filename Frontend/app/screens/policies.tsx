import React from 'react';
import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { POLICIES } from '../../data/company';

export default function PoliciesScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFF','#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A2E'} /></TouchableOpacity>
        <View style={{ marginLeft:12 }}>
          <Text style={[styles.headerTitle, { color: txt }]}>Company Policies</Text>
          <Text style={[styles.headerSub, { color: sub }]}>{POLICIES.length} policies</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }} showsVerticalScrollIndicator={false}>
        {POLICIES.map(p => (
          <TouchableOpacity key={p.id} onPress={() => router.push('/screens/policy-detail?id='+p.id)} activeOpacity={0.8}>
            <LinearGradient colors={isDark ? [theme.bgCard, theme.bgCard2] : ['#FFF','#EEF2FF']} style={[styles.policyCard, { borderColor: border }]}>
              <View style={[styles.policyIcon, { backgroundColor: p.color + '25' }]}>
                <Ionicons name={p.icon as any} size={26} color={p.color} />
              </View>
              <View style={{ flex:1, marginLeft:14 }}>
                <Text style={{ color: txt, fontSize:15, fontWeight:'800' }}>{p.title}</Text>
                <Text style={{ color: sub, fontSize:12, marginTop:4 }}>{p.sections.length} sections · Tap to read</Text>
                <View style={{ flexDirection:'row', gap:6, marginTop:8 }}>
                  {p.sections.slice(0,2).map(s => (
                    <View key={s.heading} style={[styles.sectionTag, { backgroundColor: p.color+'15', borderColor: p.color+'30' }]}>
                      <Text style={{ color: p.color, fontSize:10, fontWeight:'700' }}>{s.heading.split(' ')[0]}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={sub} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  headerTitle: { fontSize:20, fontWeight:'800' },
  headerSub: { fontSize:12, marginTop:2 },
  policyCard: { flexDirection:'row', alignItems:'center', borderRadius:18, padding:16, borderWidth:1 },
  policyIcon: { width:56, height:56, borderRadius:18, justifyContent:'center', alignItems:'center' },
  sectionTag: { paddingHorizontal:8, paddingVertical:3, borderRadius:8, borderWidth:1 },
});
