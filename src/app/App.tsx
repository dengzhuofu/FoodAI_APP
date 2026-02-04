import React, { useEffect } from 'react';
import '../i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from '../context/AuthContext';
import { NativeModules, Platform } from 'react-native';
import { CONFIG } from '../config';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const apiKey = Platform.select({
      android: CONFIG.AMAP_NATIVE_KEY_ANDROID,
      ios: CONFIG.AMAP_NATIVE_KEY_IOS,
    });
    if (!apiKey) return;
    try {
      const nativeSdk = (NativeModules as any)?.AMapSdk;
      if (typeof nativeSdk?.initSDK !== 'function') return;
      nativeSdk.initSDK(apiKey);
    } catch (e) {
      return;
    }
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
