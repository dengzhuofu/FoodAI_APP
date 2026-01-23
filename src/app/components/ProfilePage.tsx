import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import { getMe } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/profile';
import { getUserStats, UserStats } from '../../api/users';

type ProfilePageNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfilePage = () => {
  const navigation = useNavigation<ProfilePageNavigationProp>();
  const { signOut } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({ recipes_count: 0, followers_count: 0, following_count: 0 });

  const fetchUserData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      const profileData = await getProfile();
      setProfile(profileData);
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '确定', 
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // AppNavigator will handle the reset
        }
      }
    ]);
  };

  const statsList = [
    { label: '发布', value: stats.recipes_count.toString() },
    { label: '粉丝', value: stats.followers_count.toString() },
    { label: '关注', value: stats.following_count.toString() },
  ];

  const menuGroups = [
    {
      title: '我的内容',
      items: [
        { name: '我的收藏', route: 'Collections', icon: 'heart', color: '#FF6B6B' },
        { name: '购物清单', route: 'ShoppingList', icon: 'cart', color: '#FFA502' },
        { name: '我的评价', route: 'MyComments', icon: 'chatbox-ellipses', color: '#20C997' },
        { name: '风味画像', route: 'FlavorProfile', icon: 'pie-chart', color: '#3498DB' },
      ]
    },
    {
      title: '更多服务',
      items: [
        { name: 'PRO 会员', route: 'Settings', icon: 'diamond', color: '#9B59B6', badge: '升级' },
        { name: '帮助中心', route: 'Settings', icon: 'help-circle', color: '#2ECC71' },
        { name: '设置', route: 'Settings', icon: 'settings', color: '#95A5A6' },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60' }} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.nickname || '未登录'}</Text>
              <Text style={styles.userBio}>{user?.bio || '热爱美食，热爱生活 🥑'}</Text>
              <View style={styles.tagsRow}>
                 {profile?.preferences?.slice(0, 2).map((pref: string, index: number) => (
                    <View key={index} style={styles.tag}><Text style={styles.tagText}>{pref}</Text></View>
                 ))}
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages')}>
                <Ionicons name="notifications-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsContainer}>
            {statsList.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.proCard}>
          <LinearGradient
            colors={['#333', '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proGradient}
          >
            <View>
              <Text style={styles.proTitle}>解锁 PRO 会员</Text>
              <Text style={styles.proSubtitle}>无限次 AI 生成，专属营养分析</Text>
            </View>
            <TouchableOpacity style={styles.proButton}>
              <Text style={styles.proButtonText}>立即升级</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.menuGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.menuList}>
              {group.items.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.menuItem,
                    index === group.items.length - 1 && styles.menuItemLast
                  ]}
                  onPress={() => navigation.navigate(item.route as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.h2,
    marginBottom: 4,
  },
  userBio: {
    ...theme.typography.caption,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: theme.spacing.sm,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  proCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  proGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  proSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  proButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  menuGroup: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  menuList: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoutText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default ProfilePage;
