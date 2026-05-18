import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, ScrollView, KeyboardAvoidingView, Platform,
  StatusBar, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError, RootState, AppDispatch } from '../../store';
import { useColors, useTheme } from '../../hooks/useTheme';

const { height } = Dimensions.get('window');

export default function Login() {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isDark, toggleTheme } = useTheme();
  const { bg, card, border, text, sub } = useColors();

  const loading = useSelector((s: RootState) => s.auth.loading);
  const error   = useSelector((s: RootState) => s.auth.error);

  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);

  const fadeA  = useRef(new Animated.Value(0)).current;
  const slideA = useRef(new Animated.Value(40)).current;
  const floatA = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeA, { toValue:1, duration:600, useNativeDriver:true }),
      Animated.spring(slideA,{ toValue:0, useNativeDriver:true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatA,{ toValue:1, duration:2500, useNativeDriver:true }),
        Animated.timing(floatA,{ toValue:0, duration:2500, useNativeDriver:true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [
        { text:'OK', onPress:() => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  const doLogin = async () => {
    const loginEmail = email.trim().toLowerCase();

    if (!loginEmail || !pass) {
      Alert.alert('Missing Fields', 'Enter email & password.');
      return;
    }

    const result = await dispatch(loginThunk({
      email: loginEmail,
      password: pass,
    }));

    if (loginThunk.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  const floatY = floatA.interpolate({
    inputRange:[0,1],
    outputRange:[0,-10]
  });

  const inputBg = isDark ? '#1E1E2E' : '#F0F4FF';

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Background blobs */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.blob,{ top:-60,left:-60 }]} />
        <View style={[styles.blob,{ top:height*0.4,right:-50 }]} />
        <View style={[styles.blob,{ bottom:80,left:-30 }]} />
      </View>

      {/* Theme toggle */}
      <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex:1 }}
      >
        {/* <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',   // ✅ FIX
          }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false} // ✅ FIX
        > */}

<ScrollView
  keyboardShouldPersistTaps="always"
  showsVerticalScrollIndicator={false}
>
          {/* Logo */}
          <Animated.View style={[
            styles.logoWrap,
            { transform:[{ translateY:floatY }], opacity:fadeA }
          ]}>
            <LinearGradient colors={['#F5A623','#E6940F']} style={styles.logoBox}>
              <Text style={styles.logoLetter}>M</Text>
            </LinearGradient>
            <Text style={[styles.appName,{ color:text }]}>Monk Group</Text>
            <Text style={[styles.appSub,{ color:sub }]}>Internal HRMS</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[
            styles.card,
            {
              backgroundColor:card,
              borderColor:border,
              opacity:fadeA,
              transform:[{ translateY:slideA }]
            }
          ]}>
            <Text style={[styles.cardTitle,{ color:text }]}>Welcome Back</Text>
            <Text style={[styles.cardSub,{ color:sub }]}>Sign in</Text>

            <View style={[styles.inputWrap,{ backgroundColor:inputBg, borderColor:border }]}>
              <Ionicons name="mail-outline" size={18} color="#F5A623" />
              <TextInput
                placeholder="Email"
                placeholderTextColor={sub}
                value={email}
                onChangeText={setEmail}
                style={[styles.input,{ color:text }]}
              />
            </View>

            <View style={[styles.inputWrap,{ backgroundColor:inputBg, borderColor:border }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#F5A623" />
              <TextInput
                placeholder="Password"
                placeholderTextColor={sub}
                value={pass}
                onChangeText={setPass}
                secureTextEntry={!showPass}
                style={[styles.input,{ color:text, flex:1 }]}
              />
              <TouchableOpacity onPress={()=>setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={sub} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={doLogin} disabled={loading}>
              <LinearGradient colors={['#F5A623','#E6940F']} style={styles.loginBtn}>
                {loading ? <ActivityIndicator color="#000"/> : (
                  <Text style={styles.loginBtnTxt}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>© 2025 Monk Group</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1 },

  blob:{
    position:'absolute',
    width:200,
    height:200,
    borderRadius:100,
    backgroundColor:'#ccc1'
  },

  themeBtn:{
    position:'absolute',
    top:50,
    right:20,
    zIndex:10
  },

  logoWrap:{
    alignItems:'center',
    marginBottom:20
  },

  logoBox:{
    width:80,
    height:80,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center'
  },

  logoLetter:{
    fontSize:40,
    fontWeight:'bold'
  },

  appName:{
    fontSize:24,
    fontWeight:'bold'
  },

  appSub:{
    fontSize:12
  },

  card:{
    margin:20,
    padding:20,
    borderRadius:20,
    borderWidth:1
  },

  cardTitle:{
    fontSize:20,
    fontWeight:'bold'
  },

  cardSub:{
    marginBottom:15
  },

  inputWrap:{
    flexDirection:'row',
    alignItems:'center',
    padding:12,
    borderRadius:10,
    borderWidth:1,
    marginBottom:10
  },

  input:{
    flex:1
  },

  loginBtn:{
    padding:15,
    borderRadius:10,
    alignItems:'center',
    marginTop:10
  },

  loginBtnTxt:{
    fontWeight:'bold'
  },

  footer:{
    textAlign:'center',
    marginTop:10,   // ✅ FIX (removed big padding)
    fontSize:11
  }
});