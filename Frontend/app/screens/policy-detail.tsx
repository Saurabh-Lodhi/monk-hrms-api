import React from 'react';
import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { POLICIES } from '../../data/company';

export default function PolicyDetailScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const policy = POLICIES.find(p => p.id === id);
  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  if (!policy) return null;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={[policy.color, policy.color + 'BB']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={{ color:'#FFF', fontSize:20, fontWeight:'900' }}>{policy.title}</Text>
          <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12, marginTop:2 }}>{policy.sections.length} sections · Company Policy</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor:'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={policy.icon as any} size={24} color="#FFF" />
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding:16, gap:14 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.notice, { backgroundColor: policy.color + '15', borderColor: policy.color + '40' }]}>
          <Ionicons name="information-circle-outline" size={18} color={policy.color} />
          <Text style={{ color: policy.color, fontSize:12, fontWeight:'600', marginLeft:8, flex:1 }}>
            This policy is effective and binding for all Monk Group employees. Last updated: March 2025.
          </Text>
        </View>
        {policy.sections.map((section, i) => (
          <View key={i} style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: border, borderLeftColor: policy.color }]}>
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:10 }}>
              <View style={[styles.sectionNum, { backgroundColor: policy.color + '20' }]}>
                <Text style={{ color: policy.color, fontWeight:'900', fontSize:12 }}>{i+1}</Text>
              </View>
              <Text style={{ color: txt, fontSize:15, fontWeight:'800', marginLeft:10 }}>{section.heading}</Text>
            </View>
            <Text style={{ color: sub, fontSize:13, lineHeight:21 }}>{section.content}</Text>
          </View>
        ))}
        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:20 },
  backBtn: { width:38, height:38, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:12, justifyContent:'center', alignItems:'center' },
  headerIcon: { width:48, height:48, borderRadius:16, justifyContent:'center', alignItems:'center' },
  notice: { flexDirection:'row', alignItems:'flex-start', padding:14, borderRadius:12, borderWidth:1 },
  sectionCard: { borderRadius:14, padding:16, borderWidth:1, borderLeftWidth:4 },
  sectionNum: { width:28, height:28, borderRadius:10, justifyContent:'center', alignItems:'center' },
});
