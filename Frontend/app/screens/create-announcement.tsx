import React, { useState } from 'react';
import {
  View, Platform, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, createNewsThunk } from '../../store';
import { useTheme } from '../../hooks/useTheme';

const CATEGORIES = ['Policy', 'HR', 'Benefits', 'Announcement', 'Training', 'General'];

export default function CreateAnnouncementScreen() {
  const { isDark, theme } = useTheme();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const [title,      setTitle]      = useState('');
  const [category,   setCategory]   = useState('Announcement');
  const [content,    setContent]    = useState('');
  const [isUrgent,   setIsUrgent]   = useState(false);
  const [isPinned,   setIsPinned]   = useState(false);
  const [tagsInput,  setTagsInput]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bg     = theme.bg;
  const cardBg = theme.bgCard;
  const txt    = theme.text;
  const sub    = theme.textSub;
  const border = theme.border;

  // Only admin/hr can create announcements
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="lock-closed" size={60} color="#F44336" />
        <Text style={{ color: txt, fontSize: 18, fontWeight: '700', marginTop: 16 }}>Access Denied</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12 }}>
          <Text style={{ color: '#F5A623', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (submitting) return;

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the announcement.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please enter the announcement content.');
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const result = await dispatch(createNewsThunk({
        title: title.trim(),
        category,
        content: content.trim(),
        isUrgent,
        isPinned,
        tags,
      }));

      if (createNewsThunk.fulfilled.match(result)) {
        Alert.alert(
          '✅ Published',
          'Announcement has been published and all employees have been notified.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('❌ Error', (result.payload as string) || 'Failed to create announcement.');
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

      <LinearGradient colors={['#E91E63', '#C2185B']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800' }}>Create Announcement</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{currentUser?.name} · {currentUser?.role?.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

        {/* Title */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.label, { color: txt }]}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter announcement title..."
            placeholderTextColor={sub}
            maxLength={100}
            style={[styles.input, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
          />
          <Text style={{ color: sub, fontSize: 11, marginTop: 4 }}>{title.length}/100</Text>
        </View>

        {/* Category */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.label, { color: txt }]}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.catChip, {
                  backgroundColor: category === cat ? '#E91E6320' : (isDark ? '#1E1E2E' : '#F0F4FF'),
                  borderColor: category === cat ? '#E91E63' : border,
                }]}
              >
                <Text style={{ color: category === cat ? '#E91E63' : sub, fontWeight: '700', fontSize: 12 }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.label, { color: txt }]}>Content *</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your announcement here..."
            placeholderTextColor={sub}
            multiline
            numberOfLines={6}
            maxLength={1000}
            style={[styles.textArea, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
          />
          <Text style={{ color: sub, fontSize: 11, marginTop: 4 }}>{content.length}/1000</Text>
        </View>

        {/* Tags */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.label, { color: txt }]}>Tags (comma separated)</Text>
          <TextInput
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="e.g. Policy, HR, Mandatory"
            placeholderTextColor={sub}
            style={[styles.input, { backgroundColor: isDark ? '#1E1E2E' : '#F0F4FF', borderColor: border, color: txt }]}
          />
        </View>

        {/* Flags */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.label, { color: txt }]}>Options</Text>

          <View style={[styles.toggleRow, { borderBottomColor: border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: txt, fontSize: 14, fontWeight: '600' }}>Mark as Urgent</Text>
              <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>Highlights with red urgent badge</Text>
            </View>
            <Switch
              value={isUrgent}
              onValueChange={setIsUrgent}
              trackColor={{ true: '#F44336', false: isDark ? '#333' : '#DDD' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: txt, fontSize: 14, fontWeight: '600' }}>Pin to Top</Text>
              <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>Shows pinned badge, appears first</Text>
            </View>
            <Switch
              value={isPinned}
              onValueChange={setIsPinned}
              trackColor={{ true: '#F5A623', false: isDark ? '#333' : '#DDD' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Preview */}
        {(isUrgent || isPinned) && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.label, { color: txt }]}>Preview Badges</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {isPinned && (
                <View style={{ backgroundColor: '#F5A62320', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#F5A623', fontSize: 11, fontWeight: '800' }}>📌 PINNED</Text>
                </View>
              )}
              {isUrgent && (
                <View style={{ backgroundColor: '#F4433620', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#F44336', fontSize: 11, fontWeight: '800' }}>🚨 URGENT</Text>
                </View>
              )}
              <View style={{ backgroundColor: '#E91E6320', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#E91E63', fontSize: 11, fontWeight: '800' }}>{category.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Publish button */}
        <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          <LinearGradient
            colors={submitting ? ['#888', '#666'] : ['#E91E63', '#C2185B']}
            style={styles.submitBtn}
          >
            <Ionicons name={submitting ? 'hourglass-outline' : 'megaphone-outline'} size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16, marginLeft: 10 }}>
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={{ color: sub, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          All active employees will be notified immediately
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 16 : 52, paddingBottom: 16 },
  card:       { borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1 },
  label:      { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input:      { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  textArea:   { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 120, textAlignVertical: 'top' },
  catChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  toggleRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  submitBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, marginBottom: 8 },
});