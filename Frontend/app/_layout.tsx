import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, restoreSessionThunk, RootState, AppDispatch } from '../store';
import { ThemeProvider } from '../hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

function AuthGate() {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const segments = useSegments();
  const { isAuthenticated, restored } = useSelector((s: RootState) => s.auth);

  useEffect(() => { dispatch(restoreSessionThunk()); }, []);

  useEffect(() => {
    if (!restored) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/login');
    if (isAuthenticated && inAuth)  router.replace('/(tabs)');
  }, [isAuthenticated, restored, segments]);

  if (!restored) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0A0A0F' }}>
        <ActivityIndicator size="large" color="#F5A623" />
      </View>
    );
  }
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AuthGate />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="screens/employee-detail" />
            <Stack.Screen name="screens/all-employees" />
            <Stack.Screen name="screens/apply-leave" />
            <Stack.Screen name="screens/salary-slip" />
            <Stack.Screen name="screens/org-chart" />
            <Stack.Screen name="screens/attendance-detail" />
            <Stack.Screen name="screens/news-detail" />
            <Stack.Screen name="screens/policies" />
            <Stack.Screen name="screens/policy-detail" />
            <Stack.Screen name="screens/events" />
            <Stack.Screen name="screens/admin-panel" />
            <Stack.Screen name="screens/add-edit-employee" />
            <Stack.Screen name="screens/notifications" />
          </Stack>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
