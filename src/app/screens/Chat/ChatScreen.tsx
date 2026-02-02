import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GiftedChat, Bubble, InputToolbar, Composer, Actions, Send } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { ensureConversation, listMessages, markConversationRead, sendDirectMessage, DirectMessage } from '../../../api/chats';
import { uploadFile } from '../../../api/upload';
import { connectChatSocket } from '../../../utils/chatSocket';
import { useUserStore } from '../../../store/useUserStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const EMOJIS = ['😀', '😄', '😊', '🥹', '😍', '😘', '😎', '🤤', '🤔', '🙃', '😴', '😤', '😭', '😡', '👍', '👏', '🙏', '🔥', '✨', '🍜', '🍰', '🥗'];

const toGiftedMessage = (m: DirectMessage, meId: number) => {
  const base: any = {
    _id: m.id,
    createdAt: new Date(m.created_at),
    user: { _id: m.sender_id },
    is_read: m.is_read,
    message_type: m.message_type,
    extra: m.extra || {},
    sender_id: m.sender_id,
    receiver_id: m.receiver_id,
    conversation_id: m.conversation_id,
  };

  if (m.message_type === 'image' || m.message_type === 'sticker') {
    return { ...base, text: '', image: m.media_url || undefined };
  }

  if (m.message_type === 'voice') {
    return { ...base, text: '', audio: m.media_url || undefined };
  }

  return { ...base, text: m.text || '' };
};

const formatPreview = (m?: { message_type: string; text?: string | null }) => {
  if (!m) return '';
  if (m.message_type === 'image') return '[图片]';
  if (m.message_type === 'voice') return '[语音]';
  if (m.message_type === 'sticker') return '[表情包]';
  return m.text || '';
};

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const me = useUserStore(s => s.user);
  const meId = me?.id || 0;
  const GiftedChatAny = GiftedChat as any;

  const peerUserId: number = route.params?.peerUserId;
  const initialConversationId: number | undefined = route.params?.conversationId;
  const peerNickname: string = route.params?.peerNickname || '私信';
  const peerAvatar: string | undefined = route.params?.peerAvatar;

  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId);
  const [messages, setMessages] = useState<any[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingMs, setRecordingMs] = useState(0);
  const recordingTimer = useRef<any>(null);
  const playingSound = useRef<Audio.Sound | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const title = useMemo(() => peerNickname, [peerNickname]);

  const loadInitial = useCallback(
    async (cid: number) => {
      const data = await listMessages(cid, { limit: 30 });
      setMessages(data.items.map(m => toGiftedMessage(m, meId)).reverse());
    },
    [meId]
  );

  const doMarkRead = useCallback(
    async (cid: number) => {
      try {
        await markConversationRead(cid);
        setMessages(prev =>
          prev.map(msg => {
            if (msg.receiver_id === meId) return { ...msg, is_read: true };
            return msg;
          })
        );
      } catch {
        return;
      }
    },
    [meId]
  );

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!peerUserId || !meId) return;
      const conv = conversationId ? null : await ensureConversation(peerUserId);
      const cid = conversationId || conv?.id;
      if (!mounted || !cid) return;
      setConversationId(cid);
      await loadInitial(cid);
      await doMarkRead(cid);
    })();
    return () => {
      mounted = false;
    };
  }, [peerUserId, meId, conversationId, loadInitial, doMarkRead]);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!meId) return;
      const ws = await connectChatSocket({
        onEvent: (event) => {
          if (disposed) return;
          if (event?.type === 'new_message') {
            const m: DirectMessage = event.data;
            if (conversationId && m.conversation_id === conversationId) {
              setMessages(prev => GiftedChat.append(prev, [toGiftedMessage(m, meId)]));
              if (m.receiver_id === meId) doMarkRead(conversationId);
            }
          }
          if (event?.type === 'read') {
            const data = event.data;
            if (!conversationId || data?.conversation_id !== conversationId) return;
            setMessages(prev =>
              prev.map(msg => {
                if (msg.user?._id === meId) return { ...msg, is_read: true };
                return msg;
              })
            );
          }
        },
      });
      socketRef.current = ws;
    })();
    return () => {
      disposed = true;
      try {
        socketRef.current?.close();
      } catch {
        return;
      }
    };
  }, [conversationId, meId, doMarkRead]);

  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (playingSound.current) {
        playingSound.current.unloadAsync();
        playingSound.current = null;
      }
    };
  }, []);

  const onSend = useCallback(
    async (newMessages: any[] = []) => {
      const text = String(newMessages?.[0]?.text || '').trim();
      if (!text) return;
      const msg = await sendDirectMessage({ peer_user_id: peerUserId, message_type: 'text', text });
      setMessages(prev => GiftedChat.append(prev, [toGiftedMessage(msg, meId)]));
    },
    [peerUserId, meId]
  );

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: false,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;
    const uri = res.assets[0].uri;
    const url = await uploadFile(uri, { mimeType: 'image/jpeg', filename: 'chat.jpg' });
    const msg = await sendDirectMessage({ peer_user_id: peerUserId, message_type: 'image', media_url: url });
    setMessages(prev => GiftedChat.append(prev, [toGiftedMessage(msg, meId)]));
  }, [peerUserId, meId]);

  const sendEmoji = useCallback(
    async (emoji: string) => {
      setEmojiOpen(false);
      const msg = await sendDirectMessage({ peer_user_id: peerUserId, message_type: 'emoji', text: emoji });
      setMessages(prev => GiftedChat.append(prev, [toGiftedMessage(msg, meId)]));
    },
    [peerUserId, meId]
  );

  const startRecording = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
    setRecordingMs(0);
    if (recordingTimer.current) clearInterval(recordingTimer.current);
    recordingTimer.current = setInterval(() => setRecordingMs(ms => ms + 500), 500);
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) return;
      const url = await uploadFile(uri, { mimeType: Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a', filename: 'voice.m4a' });
      const msg = await sendDirectMessage({
        peer_user_id: peerUserId,
        message_type: 'voice',
        media_url: url,
        extra: { durationMs: recordingMs },
      });
      setMessages(prev => GiftedChat.append(prev, [toGiftedMessage(msg, meId)]));
    } catch {
      setRecording(null);
    }
  }, [recording, peerUserId, meId, recordingMs]);

  const toggleRecording = useCallback(() => {
    if (recording) stopRecording();
    else startRecording();
  }, [recording, startRecording, stopRecording]);

  const playAudio = useCallback(async (url: string) => {
    try {
      if (playingSound.current) {
        await playingSound.current.unloadAsync();
        playingSound.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      playingSound.current = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status?.didJustFinish) {
          sound.unloadAsync();
          if (playingSound.current === sound) playingSound.current = null;
        }
      });
    } catch {
      return;
    }
  }, []);

  const renderCustomView = useCallback(
    (props: any) => {
      const msg = props?.currentMessage;
      if (!msg) return null;
      if (msg.audio) {
        const duration = Math.max(1, Math.round(((msg.extra?.durationMs || 0) as number) / 1000));
        const isMine = msg.user?._id === meId;
        return (
          <TouchableOpacity
            onPress={() => playAudio(msg.audio)}
            activeOpacity={0.85}
            style={[styles.voiceChip, isMine ? styles.voiceChipMine : styles.voiceChipOther]}
          >
            <Ionicons name="volume-medium" size={18} color={isMine ? '#111' : '#111'} />
            <Text style={styles.voiceText}>{duration}s 语音</Text>
          </TouchableOpacity>
        );
      }
      return null;
    },
    [meId, playAudio]
  );

  const renderTicks = useCallback((message: any) => {
    if (message?.user?._id !== meId) return null;
    return (
      <Text style={[styles.tickText, message.is_read ? styles.tickRead : styles.tickUnread]}>
        {message.is_read ? '已读' : '未读'}
      </Text>
    );
  }, [meId]);

  const renderBubble = useCallback((props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.bubbleLeft,
        right: styles.bubbleRight,
      }}
      textStyle={{
        left: styles.bubbleTextLeft,
        right: styles.bubbleTextRight,
      }}
    />
  ), []);

  const renderInputToolbar = useCallback((props: any) => (
    <InputToolbar {...props} containerStyle={styles.toolbar} primaryStyle={{ alignItems: 'center' }} />
  ), []);

  const renderComposer = useCallback((props: any) => (
    <Composer
      {...props}
      textInputStyle={styles.composer}
      placeholder="发消息…"
      placeholderTextColor="#9A9A9A"
    />
  ), []);

  const renderSend = useCallback((props: any) => (
    <Send {...props} containerStyle={styles.sendWrap}>
      <View style={styles.sendBtn}>
        <Ionicons name="arrow-up" size={18} color="#FFF" />
      </View>
    </Send>
  ), []);

  const renderActions = useCallback((props: any) => (
    <Actions
      {...props}
      containerStyle={styles.actionsWrap}
      icon={() => (
        <View style={styles.actionIcon}>
          <Ionicons name="add" size={20} color="#111" />
        </View>
      )}
      options={{
        图片: pickImage,
        表情: () => setEmojiOpen(true),
        语音: toggleRecording,
      }}
      optionTintColor="#111"
    />
  ), [pickImage, toggleRecording]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: peerAvatar || 'https://via.placeholder.com/80' }} style={styles.headerAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{formatPreview(messages[0])}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <GiftedChatAny
        messages={messages}
        onSend={onSend}
        user={{ _id: meId }}
        renderBubble={renderBubble}
        renderCustomView={renderCustomView}
        renderTicks={renderTicks}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        renderActions={renderActions}
        timeTextStyle={{ left: styles.timeText, right: styles.timeText }}
        bottomOffset={Platform.OS === 'ios' ? 10 : 0}
      />

      <Modal transparent visible={emojiOpen} animationType="fade" onRequestClose={() => setEmojiOpen(false)}>
        <Pressable style={styles.emojiBackdrop} onPress={() => setEmojiOpen(false)}>
          <Pressable style={styles.emojiSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.emojiHeader}>
              <Text style={styles.emojiTitle}>选择表情</Text>
              <TouchableOpacity onPress={() => setEmojiOpen(false)} style={styles.emojiClose} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color="#111" />
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => sendEmoji(e)} style={styles.emojiItem} activeOpacity={0.8}>
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {recording ? (
              <View style={styles.recordingBar}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>录音中 {Math.round(recordingMs / 1000)}s</Text>
                <TouchableOpacity onPress={stopRecording} style={styles.recordingStop} activeOpacity={0.85}>
                  <Text style={styles.recordingStopText}>停止并发送</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F2',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  headerAvatar: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EEE' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 11, color: '#8A8A8A', marginTop: 2 },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FFF',
    paddingTop: 6,
    paddingBottom: 6,
  },
  composer: {
    backgroundColor: '#F6F6F3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
    marginLeft: 0,
    marginRight: 0,
    color: '#111',
    fontSize: 15,
    lineHeight: 20,
  },
  actionsWrap: { marginLeft: 6, marginBottom: 4 },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F6F6F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  sendWrap: { justifyContent: 'center', alignItems: 'center', marginRight: 6, marginBottom: 4 },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  bubbleLeft: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  bubbleRight: {
    backgroundColor: '#111',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  bubbleTextLeft: { color: '#111', fontSize: 15, lineHeight: 20 },
  bubbleTextRight: { color: '#FFF', fontSize: 15, lineHeight: 20 },
  timeText: { fontSize: 10, color: '#9A9A9A' },
  tickText: { fontSize: 10, marginRight: 6, marginBottom: 2 },
  tickUnread: { color: '#9A9A9A' },
  tickRead: { color: theme.colors.primary },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
  },
  voiceChipMine: { backgroundColor: '#F2E9FF' },
  voiceChipOther: { backgroundColor: '#F6F6F3' },
  voiceText: { fontSize: 13, fontWeight: '700', color: '#111' },
  emojiBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  emojiSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 18,
  },
  emojiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  emojiTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  emojiClose: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F6F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  emojiItem: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  emojiText: { fontSize: 22 },
  recordingBar: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#111',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4F' },
  recordingText: { flex: 1, color: '#FFF', fontSize: 12, fontWeight: '700' },
  recordingStop: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF' },
  recordingStopText: { fontSize: 12, fontWeight: '800', color: '#111' },
});

export default ChatScreen;
