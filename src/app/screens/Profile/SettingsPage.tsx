import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { logout } from '../../../api/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import ScreenHeader from '../../components/ScreenHeader';

const SettingsPage = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();
  
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    location: true,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCacheClear = () => {
    Alert.alert('清除缓存', '确定要清除所有应用缓存吗？', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => Alert.alert('成功', '缓存已清除') }
    ]);
  };

  const changeLanguage = () => {
    const currentLng = i18n.language;
    // Simple toggle logic: if currently zh, switch to en, otherwise switch to zh
    const nextLng = currentLng === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(nextLng);
  };

  const handleLogout = async () => {
    Alert.alert(t('auth.logout'), '确定要退出登录吗？', [
      { text: t('common.cancel'), style: 'cancel' },
      { 
        text: t('common.confirm'), 
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    ]);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderSwitchItem = (title: string, icon: any, value: boolean, onValueChange: () => void) => (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <Switch
        trackColor={{ false: '#e0e0e0', true: theme.colors.primary }}
        thumbColor={'white'}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  const renderActionItem = (title: string, icon: any, onPress: () => void, value?: string) => (
    <TouchableOpacity style={styles.itemRow} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t('common.settings')} />

      <ScrollView contentContainerStyle={styles.content}>
        {renderSection('通用', (
          <>
            {renderSwitchItem('推送通知', 'notifications-outline', settings.notifications, () => toggleSwitch('notifications'))}
            <View style={styles.divider} />
            {renderSwitchItem('提示音效', 'musical-note-outline', settings.sound, () => toggleSwitch('sound'))}
            <View style={styles.divider} />
            {renderActionItem(t('common.language'), 'language-outline', changeLanguage, i18n.language === 'zh' ? '简体中文' : 'English')}
          </>
        ))}

        {renderSection('外观与显示', (
          <>
            {renderSwitchItem('深色模式', 'moon-outline', settings.darkMode, () => toggleSwitch('darkMode'))}
          </>
        ))}

        {renderSection('隐私与安全', (
          <>
            {renderSwitchItem('位置信息', 'location-outline', settings.location, () => toggleSwitch('location'))}
            <View style={styles.divider} />
            {renderActionItem('隐私政策', 'shield-checkmark-outline', () => {})}
            <View style={styles.divider} />
            {renderActionItem('用户协议', 'document-text-outline', () => {})}
          </>
        ))}

        {renderSection('存储', (
          <>
            {renderActionItem('清除缓存', 'trash-outline', handleCacheClear, '23.5 MB')}
          </>
        ))}

        {renderSection('关于', (
          <>
            {renderActionItem('关于我们', 'information-circle-outline', () => {})}
            <View style={styles.divider} />
            {renderActionItem('当前版本', 'git-branch-outline', () => {}, 'v1.0.0')}
          </>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.copyright}>© 2024 FoodAI App. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8C8C8C',
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '900',
    letterSpacing: 0.6,
    fontStyle: 'italic',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 3,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F6F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    color: '#00C896',
    marginRight: 8,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F3F3',
    marginLeft: 66,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  copyright: {
    textAlign: 'center',
    color: '#9A9A9A',
    fontSize: 12,
  },
});

export default SettingsPage;
