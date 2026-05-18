import React from 'react';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Index() {
  const auth = useSelector((s: RootState) => s.auth.isAuthenticated);
  return <Redirect href={auth ? '/(tabs)' : '/(auth)/login'} />;
}
