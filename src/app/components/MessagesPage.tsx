import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { getNotifications, markAsRead, Notification } from '../../api/notifications';
import { listConversations, DirectConversation } from '../../api/chats';
import { connectChatSocket } from '../../utils/chatSocket';
import { useUserStore } from '../../store/useUserStore';

const MessagesPage = () => {
  const navigation = useNavigation();
  const me = useUserStore(s => s.user);
  const meId = me?.id || 0;
  const [activeTab, setActiveTab] = useState<'notifications' | 'chats'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.filter(n => n.type === 'system'));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const fetchChats = async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchChats();
    }, [])
  );

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!meId) return;
      const ws = await connectChatSocket({
        onEvent: (event) => {
          if (disposed) return;
          if (event?.type === 'new_message' || event?.type === 'read') {
            fetchChats();
          }
        },
      });
      wsRef.current = ws;
    })();

    return () => {
      disposed = true;
      try {
        wsRef.current?.close();
      } catch {
        return;
      }
    };
  }, [meId]);

  const hasUnreadSystem = useMemo(() => notifications.some(n => !n.is_read), [notifications]);
  const hasUnreadChat = useMemo(() => conversations.some(c => c.unread_count > 0), [conversations]);

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
        onPress={() => setActiveTab('notifications')}
        activeOpacity={0.9}
      >
        <View style={styles.tabRow}>
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>通知</Text>
          {hasUnreadSystem && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
        onPress={() => setActiveTab('chats')}
        activeOpacity={0.9}
      >
        <View style={styles.tabRow}>
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>聊天</Text>
          {hasUnreadChat && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  const openSystemNotification = async (item: Notification) => {
    try {
      if (!item.is_read) {
        await markAsRead(item.id);
        setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n)));
      }
    } catch {
      return;
    }
  };

  const openChat = async (conv: DirectConversation) => {
    try {
      if (conv.unread_count > 0) {
        setConversations(prev => prev.map(c => (c.id === conv.id ? { ...c, unread_count: 0 } : c)));
      }
      // @ts-ignore
      navigation.navigate('Chat', {
        peerUserId: conv.peer.id,
        conversationId: conv.id,
        peerNickname: conv.peer.nickname,
        peerAvatar: conv.peer.avatar,
      });
    } catch {
      return;
    }
  };

  const formatLastChatText = (conv: DirectConversation) => {
    const m = conv.last_message;
    if (!m) return '开始聊天吧';
    if (m.message_type === 'image') return '[图片]';
    if (m.message_type === 'voice') return '[语音]';
    if (m.message_type === 'sticker') return '[表情包]';
    return m.text || '';
  };

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
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="notifications-off" size={44} color="rgba(17,17,17,0.18)" />
                <Text style={styles.emptyTitle}>暂无通知</Text>
                <Text style={styles.emptySub}>系统消息会在这里展示</Text>
              </View>
            ) : null}
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
                activeOpacity={0.85}
                onPress={() => openSystemNotification(item)}
              >
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
            {conversations.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={44} color="rgba(17,17,17,0.18)" />
                <Text style={styles.emptyTitle}>暂无聊天</Text>
                <Text style={styles.emptySub}>在用户详情页点“发私信”开始聊天</Text>
              </View>
            ) : null}
            {conversations.map((conv) => (
              <TouchableOpacity key={conv.id} style={styles.interactionCard} activeOpacity={0.85} onPress={() => openChat(conv)}>
                <Image source={{ uri: conv.peer.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <View style={styles.interactionContent}>
                  <View style={styles.interactionHeader}>
                    <Text style={styles.userName} numberOfLines={1}>{conv.peer.nickname}</Text>
                    <Text style={styles.timeText}>
                      {conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <Text style={styles.notificationText} numberOfLines={1}>{formatLastChatText(conv)}</Text>
                </View>
                {conv.unread_count > 0 ? (
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>{conv.unread_count > 99 ? '99+' : conv.unread_count}</Text>
                  </View>
                ) : null}
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
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: 16,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '900',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary, // Neon
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
    fontWeight: '800',
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '600',
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
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chatBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  chatBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '800',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.surfaceVariant,
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
    fontWeight: '900',
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  targetText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 10, fontSize: 14, fontWeight: '900', color: '#111' },
  emptySub: { marginTop: 6, fontSize: 12, color: 'rgba(17,17,17,0.55)', fontWeight: '700' },
});

export default MessagesPage;
