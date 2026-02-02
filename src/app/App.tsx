import React, { useEffect } from 'react';
import '../i18n'; // Initialize i18n
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from '../context/AuthContext';
import { Platform } from 'react-native';
import { CONFIG } from '../config';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const { AMapSdk } = require('react-native-amap3d');
    AMapSdk.init(
      Platform.select({
        android: CONFIG.AMAP_NATIVE_KEY_ANDROID,
        ios: CONFIG.AMAP_NATIVE_KEY_IOS,
      })
    );
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
};

export default App;
