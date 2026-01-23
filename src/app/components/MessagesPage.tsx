import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { getNotifications, Notification } from '../../api/notifications';

const MessagesPage = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'notifications' | 'interactions'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [interactions, setInteractions] = useState<Notification[]>([]);

  const fetchData = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.filter(n => n.type === 'system'));
      setInteractions(data.filter(n => n.type !== 'system'));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
        onPress={() => setActiveTab('notifications')}
      >
        <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>通知</Text>
        {notifications.some(n => !n.read) && <View style={styles.badge} />}
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'interactions' && styles.activeTab]}
        onPress={() => setActiveTab('interactions')}
      >
        <Text style={[styles.tabText, activeTab === 'interactions' && styles.activeTabText]}>互动</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>消息中心</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderTabs()}

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'notifications' ? (
          <View>
            {notifications.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.notificationCard, !item.is_read && styles.unreadCard]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="notifications" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.notificationText} numberOfLines={2}>{item.content}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {interactions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.interactionCard}>
                <Image source={{ uri: item.sender?.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <View style={styles.interactionContent}>
                  <View style={styles.interactionHeader}>
                    <Text style={styles.userName}>{item.sender?.username}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.actionText}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationText} numberOfLines={1}>{item.content}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  badge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
    marginLeft: 4,
    marginBottom: 8,
  },
  content: {
    padding: theme.spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  unreadCard: {
    backgroundColor: '#FFF8E1',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  notificationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  interactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  interactionContent: {
    flex: 1,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  targetText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default MessagesPage;
