// import React from 'react';
// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { Platform, View } from 'react-native';
// import { useColors } from '../../hooks/useTheme';

// export default function TabsLayout() {
//   const { isDark } = useColors();
//   return (
//     <Tabs screenOptions={{
//       headerShown: false,
//       tabBarStyle: { backgroundColor:isDark?'#0F0F1A':'#FFFFFF', borderTopColor:isDark?'#2A2A40':'#E0E6FF', borderTopWidth:1, height:Platform.OS==='ios'?88:68, paddingBottom:Platform.OS==='ios'?28:10, paddingTop:8 },
//       tabBarActiveTintColor: '#F5A623',
//       tabBarInactiveTintColor: isDark ? '#5A5A78' : '#AAAAC8',
//       tabBarLabelStyle: { fontSize:10, fontWeight:'600', marginTop:2 },
//     }}>
//       <Tabs.Screen name="index" options={{ title:'Home', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'home':'home-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
//       <Tabs.Screen name="attendance" options={{ title:'Attendance', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name="finger-print" size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
//       <Tabs.Screen name="leave" options={{ title:'Leave', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'calendar':'calendar-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
//       <Tabs.Screen name="payroll" options={{ title:'Payroll', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'wallet':'wallet-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
//       <Tabs.Screen name="more" options={{ title:'More', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'grid':'grid-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
//     </Tabs>
//   );
// }

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useTheme';

export default function TabsLayout() {
  const { isDark } = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor:isDark?'#0F0F1A':'#FFFFFF', borderTopColor:isDark?'#2A2A40':'#E0E6FF', borderTopWidth:1, height:Platform.OS==='ios'?60+insets.bottom:60+insets.bottom, paddingBottom:insets.bottom>0?insets.bottom:10, paddingTop:8 },
      tabBarActiveTintColor: '#F5A623',
      tabBarInactiveTintColor: isDark ? '#5A5A78' : '#AAAAC8',
      tabBarLabelStyle: { fontSize:10, fontWeight:'600', marginTop:2 },
    }}>
      <Tabs.Screen name="index" options={{ title:'Home', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'home':'home-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
      <Tabs.Screen name="attendance" options={{ title:'Attendance', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name="finger-print" size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
      <Tabs.Screen name="leave" options={{ title:'Leave', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'calendar':'calendar-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
      <Tabs.Screen name="payroll" options={{ title:'Payroll', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'wallet':'wallet-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
      <Tabs.Screen name="more" options={{ title:'More', tabBarIcon:({color,focused})=>(<View style={{alignItems:'center'}}><Ionicons name={focused?'grid':'grid-outline'} size={22} color={color} />{focused&&<View style={{width:4,height:4,borderRadius:2,backgroundColor:'#F5A623',marginTop:2}}/>}</View>) }} />
    </Tabs>
  );
}