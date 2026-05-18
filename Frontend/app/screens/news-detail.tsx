import React from 'react';
import { View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, incViews, fetchNewsThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { useEffect } from 'react';

export default function NewsDetailScreen() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useLocalSearchParams<{ id: string }>();
  const newsItems = useSelector((s: RootState) => s.news.list);
  const item = newsItems.find((n: any) => String(n.id) === String(id)) as any;

  useEffect(() => {
    if (newsItems.length === 0) dispatch(fetchNewsThunk());
    if (id) dispatch(incViews(Number(id)));
  }, []);

  const bg = theme.bg;
  const cardBg = theme.bgCard;
  const txt = theme.text;
  const sub = theme.textSub;
  const border = theme.border;

  if (!item) return null;

  const getCategoryColor = (cat: string) => ({ Policy:'#F5A623', HR:'#E91E63', Benefits:'#4CAF50', Announcement:'#2196F3' }[cat] || '#9C27B0');
  const catColor = getCategoryColor(item.category);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={isDark ? ['#0F0F1A','#141420'] : ['#FFF','#F0F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
          {item.views && <View style={styles.viewCount}><Ionicons name="eye-outline" size={12} color={sub} /><Text style={{ color: sub, fontSize:11, marginLeft:4 }}>{item.views||0}</Text></View>}
        </View>
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding:16 }}>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={{ color: catColor, fontSize:11, fontWeight:'800' }}>{item.category}</Text>
            </View>
            {(item.isUrgent||item.urgent) && <View style={[styles.catBadge, { backgroundColor:'#F4433620' }]}><Text style={{ color:'#F44336', fontSize:11, fontWeight:'800' }}>⚠️ URGENT</Text></View>}
            {(item.isPinned||item.pinned) && <View style={[styles.catBadge, { backgroundColor:'#F5A62320' }]}><Text style={{ color:'#F5A623', fontSize:11, fontWeight:'800' }}>📌 PINNED</Text></View>}
          </View>
          <Text style={{ color: txt, fontSize:22, fontWeight:'900', lineHeight:30, marginBottom:14 }}>{item.title}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:20, paddingBottom:16, borderBottomWidth:1, borderBottomColor: border }}>
            <View style={styles.authorAvatar}>
              <Text style={{ color:'#FFF', fontWeight:'900', fontSize:16 }}>{item.author?.[0]}</Text>
            </View>
            <View>
              <Text style={{ color: txt, fontSize:13, fontWeight:'700' }}>{item.authorName||item.author}</Text>
              <Text style={{ color: sub, fontSize:11, marginTop:2 }}>{item.publishedAt||item.date}</Text>
            </View>
          </View>
          <Text style={{ color: isDark ? '#DDD' : '#333', fontSize:15, lineHeight:26 }}>{item.content}</Text>
          {item.tags?.length > 0 && (
            <View style={{ flexDirection:'row', gap:8, marginTop:20, flexWrap:'wrap' }}>
              {item.tags.map((tag: string) => (
                <View key={tag} style={[styles.tag, { backgroundColor: isDark ? '#2A2A40' : '#F0F4FF', borderColor: border }]}>
                  <Text style={{ color: sub, fontSize:12 }}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ height:40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS === "web" ? 16 : 52, paddingBottom:16 },
  backBtn: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center' },
  viewCount: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:5, borderRadius:10 },
  catBadge: { paddingHorizontal:10, paddingVertical:5, borderRadius:8 },
  authorAvatar: { width:40, height:40, borderRadius:20, backgroundColor:'#F5A623', justifyContent:'center', alignItems:'center' },
  tag: { paddingHorizontal:12, paddingVertical:5, borderRadius:8, borderWidth:1 },
});
