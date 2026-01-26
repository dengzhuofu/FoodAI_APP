import React from 'react';
import '../i18n'; // Initialize i18n
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from '../context/AuthContext';

const App = () => {
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
