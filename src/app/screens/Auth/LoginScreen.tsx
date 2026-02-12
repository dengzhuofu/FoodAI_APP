import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t('common.tip'), t('auth.alertInputUserPass'));
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
    } catch (error: any) {
      const msg = error.response?.data?.detail || t('auth.loginFail');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Image 
                source={require('../../../../assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.title}>{t('auth.loginTitle')}</Text>
              
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.usernamePlaceholder')}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={theme.colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>{t('auth.nextStep')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>{t('auth.registerLink')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: theme.colors.primary, // Tint logo if possible or leave natural
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 32,
    textAlign: 'left',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 0,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 8,
    borderWidth: 0,
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 28, // Pill
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    // Deprecated in this style
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    marginRight: 4,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
  },
});

export default LoginScreen;
