import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
    } catch (error: any) {
      const msg = error.response?.data?.detail || '登录失败，请检查网络或账号密码';
      Alert.alert('错误', msg);
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
              <Text style={styles.title}>登录 FoodAI</Text>
              
              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="用户名"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="密码"
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
                    <Text style={styles.loginButtonText}>下一步</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>忘记密码？</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>还没有账号？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>注册</Text>
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
    backgroundColor: '#FFFFFF',
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
    width: 40,
    height: 40,
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F1419',
    marginBottom: 32,
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CFD9DE',
    height: 56,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#0F1419',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#CFD9DE',
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#0F1419',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#0F1419',
    borderRadius: 9999,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientButton: {
    // Deprecated in this style
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#536471',
    fontSize: 15,
    marginRight: 4,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
