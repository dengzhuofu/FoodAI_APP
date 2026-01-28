import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import { getMe } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useUserStore } from '../../store/useUserStore';
import { getProfile } from '../../api/profile';
import { getUserStats, UserStats, updateProfile } from '../../api/users';
import { uploadFile } from '../../api/upload';

type ProfilePageNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfilePage = () => {
  const navigation = useNavigation<ProfilePageNavigationProp>();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({ recipes_count: 0, followers_count: 0, following_count: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit Profile State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchUserData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      setEditNickname(userData.nickname || '');
      setEditBio(userData.bio || '');
      
      const profileData = await getProfile();
      setProfile(profileData);
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleEditAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(t('common.needPermission'), t('profile.permissionAvatar'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        try {
          // 1. Upload image
          const imageUrl = await uploadFile(result.assets[0].uri);
          
          // 2. Update user profile
          const updatedUser = await updateProfile({ avatar: imageUrl });
          
          // 3. Update local state
          setUser(updatedUser);
          Alert.alert(t('common.success'), t('profile.avatarSuccess'));
        } catch (error) {
          console.error("Failed to update avatar", error);
          Alert.alert(t('common.error'), t('profile.avatarFail'));
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Image picker error", error);
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      Alert.alert(t('common.tip'), t('profile.nicknameEmpty'));
      return;
    }

    setSavingProfile(true);
    try {
      const updatedUser = await updateProfile({
        nickname: editNickname,
        bio: editBio
      });
      setUser(updatedUser);
      setEditModalVisible(false);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (error) {
      console.error("Failed to update profile", error);
      Alert.alert(t('common.error'), t('profile.updateFail'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { 
        text: t('common.confirm'), 
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // AppNavigator will handle the reset
        }
      }
    ]);
  };

  const statsList = [
    { label: t('profile.statsPost'), value: stats.recipes_count.toString() },
    { label: t('profile.statsFollowers'), value: stats.followers_count.toString() },
    { label: t('profile.statsFollowing'), value: stats.following_count.toString() },
  ];

  const menuGroups = [
    {
      title: t('profile.groupMyContent'),
      items: [
        { name: t('profile.myCollections'), route: 'Collections', icon: 'heart', color: '#FF6B6B' },
        { name: t('profile.shoppingList'), route: 'ShoppingList', icon: 'cart', color: '#FFA502' },
        { name: t('profile.myComments'), route: 'MyComments', icon: 'chatbox-ellipses', color: '#20C997' },
        { name: t('profile.flavorProfile'), route: 'FlavorProfile', icon: 'pie-chart', color: '#3498DB' },
      ]
    },
    {
      title: t('profile.groupMoreServices'),
      items: [
        { name: t('profile.proMember'), route: 'Settings', icon: 'diamond', color: '#9B59B6', badge: t('profile.badgeUpgrade') },
        { name: t('profile.helpCenter'), route: 'Settings', icon: 'help-circle', color: '#2ECC71' },
        { name: t('profile.settings'), route: 'Settings', icon: 'settings', color: '#95A5A6' },
      ]
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages')}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60' }} 
                style={styles.avatar as any} 
              />
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditAvatar} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="camera" size={14} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{user?.nickname || t('auth.notLoggedIn')}</Text>
              <TouchableOpacity 
                style={styles.editProfileIcon}
                onPress={() => setEditModalVisible(true)}
              >
                <Ionicons name="pencil" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userBio}>{user?.bio || t('profile.defaultBio')}</Text>
            
            <View style={styles.tagsRow}>
               {profile?.preferences?.slice(0, 3).map((pref: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{pref}</Text>
                  </View>
               ))}
               <TouchableOpacity style={[styles.tag, styles.addTag]}>
                 <Ionicons name="add" size={12} color={theme.colors.textSecondary} />
               </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              {statsList.map((stat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.statItem} 
                  activeOpacity={0.7}
                  onPress={stat.onPress}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.proCardContainer}>
            <LinearGradient
              colors={['#2c3e50', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.proGradient}
            >
              <View style={styles.proContent}>
                <View style={styles.proIconContainer}>
                  <Ionicons name="sparkles" size={24} color="#FFD700" />
                </View>
                <View style={styles.proTexts}>
                  <Text style={styles.proTitle}>{t('profile.unlockPro')}</Text>
                  <Text style={styles.proSubtitle}>{t('profile.proSubtitle')}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.proButton}>
                <Text style={styles.proButtonText}>{t('profile.upgradeNow')}</Text>
                <Ionicons name="chevron-forward" size={12} color="#333" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {menuGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.menuGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.menuCard}>
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
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <View style={styles.menuRight}>
                      {item.badge && (
                        <LinearGradient
                          colors={[theme.colors.primary, theme.colors.primaryDark]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.badge}
                        >
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </LinearGradient>
                      )}
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.border} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
          
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>FoodAI v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.editProfileTitle')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.labelNickname')}</Text>
              <TextInput
                style={styles.input}
                value={editNickname}
                onChangeText={setEditNickname}
                placeholder={t('profile.placeholderNickname')}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.labelBio')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder={t('profile.placeholderBio')}
                multiline
                numberOfLines={3}
                maxLength={100}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>{t('common.saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: '#F7F8FA',
  },
  profileHeader: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    ...theme.shadows.sm,
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFF',
    ...theme.shadows.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  editProfileIcon: {
    padding: 4,
  },
  userBio: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  addTag: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  proCardContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: 20,
    ...theme.shadows.md,
    marginTop: -20, // Overlap slightly with header if desired, but sticking to flow for now
  },
  proGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
  },
  proContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proTexts: {
    flex: 1,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  proSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  proButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  menuGroup: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 8,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  menuItemLast: {
    marginBottom: 0,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: theme.spacing.lg,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;