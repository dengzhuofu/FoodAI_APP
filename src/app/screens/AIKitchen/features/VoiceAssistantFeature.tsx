import { chatWithKitchenAgent, getChatSessions, createChatSession, getSessionMessages, deleteChatSession, ChatSession, getAgentPresets, AgentPreset } from '../../../../api/ai';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import CreateAgentScreen from './CreateAgentScreen';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

// ... (ThinkingBubble component remains same)
const ThinkingBubble = ({ thoughts }: { thoughts: any[] }) => {
  // ... (keep existing implementation)
  const [expanded, setExpanded] = useState(false);
  
  if (!thoughts || thoughts.length === 0) return null;

  return (
    <View style={styles.thinkingContainer}>
      <TouchableOpacity 
        style={[styles.thinkingHeader, expanded && styles.thinkingHeaderExpanded]} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.thinkingHeaderLeft}>
          <View style={styles.sparkleIcon}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.thinkingTitle}>
            AI 思考过程 ({thoughts.length} 步)
          </Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#999" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.thinkingContent}>
          {thoughts.map((thought, index) => (
            <View key={index} style={styles.thoughtItem}>
              <View style={styles.thoughtTimeline}>
                <View style={[styles.thoughtDot, { backgroundColor: index === thoughts.length - 1 ? '#4CAF50' : '#DDD' }]} />
                {index !== thoughts.length - 1 && <View style={styles.thoughtLine} />}
              </View>
              <View style={styles.thoughtTextContainer}>
                <Text style={styles.thoughtText}>{thought.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const VoiceAssistantFeature = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Session Management
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>(undefined);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  
  // Agent Presets
  const [presets, setPresets] = useState<AgentPreset[]>([]);
  const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("kitchen_agent");
  const [isCreateAgentVisible, setIsCreateAgentVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState<AgentPreset | undefined>(undefined);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await getAgentPresets();
      setPresets(data);
    } catch (error) {
      console.error("Failed to load presets", error);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await getChatSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        // Auto load most recent
        selectSession(data[0].id);
      } else if (data.length === 0) {
        // Create new if none
        // Don't auto create here, let user choose or default
        // But for UX, maybe auto create default?
        // Let's create default
        createNewSession("kitchen_agent");
      }
    } catch (error) {
      console.error("Failed to load sessions", error);
    }
  };

  const createNewSession = async (agentId: string) => {
    try {
      const newSession = await createChatSession("新对话", agentId);
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      
      // Customize welcome message based on agent?
      // For now, keep generic
      setMessages([
        {
          _id: 1,
          text: '你好！我是你的智能厨房管家。我可以帮你查看冰箱库存，或者管理购物清单。你可以直接告诉我你的需求。',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'AI Chef',
            avatar: 'https://img.icons8.com/color/96/000000/chef-hat.png',
          },
        },
      ]);
      setIsSidebarVisible(false);
      setIsNewChatModalVisible(false);
    } catch (error) {
      console.error("Failed to create session", error);
    }
  };

  const handleCreateNewChat = () => {
    // Open preset selection modal
    setIsNewChatModalVisible(true);
  };
  
  const handleCreateAgentSuccess = () => {
    setIsCreateAgentVisible(false);
    setEditingPreset(undefined);
    loadPresets(); // Refresh list
  };

  const handleEditPreset = (preset: AgentPreset) => {
    setEditingPreset(preset);
    setIsNewChatModalVisible(false); // Close selection modal
    setIsCreateAgentVisible(true); // Open edit modal
  };

  const selectSession = async (sessionId: number) => {
    // ... (existing implementation)
    try {
      setCurrentSessionId(sessionId);
      setIsSidebarVisible(false);
      const msgs = await getSessionMessages(sessionId);
      
      // Convert backend messages to GiftedChat format
      const giftedMessages: IMessage[] = msgs.map(m => ({
        _id: m.id,
        text: m.content,
        createdAt: new Date(m.created_at),
        user: {
          _id: m.role === 'user' ? 1 : 2,
          name: m.role === 'user' ? 'Me' : 'AI Chef',
          avatar: m.role === 'assistant' ? 'https://img.icons8.com/color/96/000000/chef-hat.png' : undefined,
        },
        // @ts-ignore
        thoughts: m.thoughts
      })).reverse(); // GiftedChat expects newest first
      
      if (giftedMessages.length === 0) {
         // Add welcome message if empty
         setMessages([
          {
            _id: 1,
            text: '你好！我是你的智能厨房管家。我可以帮你查看冰箱库存，或者管理购物清单。你可以直接告诉我你的需求。',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'AI Chef',
              avatar: 'https://img.icons8.com/color/96/000000/chef-hat.png',
            },
          },
        ]);
      } else {
        setMessages(giftedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    Alert.alert(
      "删除会话",
      "确定要删除这个会话吗？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "删除", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChatSession(sessionId);
              const newSessions = sessions.filter(s => s.id !== sessionId);
              setSessions(newSessions);
              if (currentSessionId === sessionId) {
                if (newSessions.length > 0) {
                  selectSession(newSessions[0].id);
                } else {
                  createNewSession("kitchen_agent");
                }
              }
            } catch (error) {
              console.error("Failed to delete session", error);
            }
          }
        }
      ]
    );
  };

  const onSend = async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);

    try {
      const aiResponse = await chatWithKitchenAgent(userMessage.text, [], currentSessionId);
      
      const botMessage: IMessage = {
        _id: Math.random().toString(),
        text: aiResponse.response.answer,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Chef',
          avatar: 'https://img.icons8.com/color/96/000000/chef-hat.png',
        },
        // @ts-ignore
        thoughts: aiResponse.response.thoughts
      };

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
      
      loadSessions();
      
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const thoughts = currentMessage.thoughts;
    const isAi = currentMessage.user._id !== 1;

    const renderCustomAvatar = () => {
      if (isAi && currentMessage.user.avatar) {
        return (
          <Image 
            source={{ uri: currentMessage.user.avatar }} 
            style={styles.customAvatar}
          />
        );
      }
      return null;
    };

    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        {isAi && renderCustomAvatar()}
        <View style={{ flexDirection: 'column', flex: 1, alignItems: isAi ? 'flex-start' : 'flex-end' }}>
          {thoughts && thoughts.length > 0 && (
             <ThinkingBubble thoughts={thoughts} />
          )}
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: 'white',
                borderRadius: 18,
                borderTopLeftRadius: 2,
                padding: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                maxWidth:width * 0.75,
                marginLeft: 0,
              },
              right: {
                backgroundColor: '#1A1A1A',
                borderRadius: 18,
                borderTopRightRadius: 2,
                padding: 2,
                maxWidth: width * 0.75, 
              },
            }}
            textStyle={{
              left: { 
                color: '#333',
                fontSize: 15,
                lineHeight: 22,
                marginTop: 6,
                marginBottom: 6,
                marginLeft: 8,
                marginRight: 8,
              },
              right: { 
                color: 'white',
                fontSize: 15,
                lineHeight: 22,
                marginTop: 6,
                marginBottom: 6,
                marginLeft: 8,
                marginRight: 8,
              },
            }}
          />
        </View>
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="arrow-up" size={20} color="white" />
        </View>
      </Send>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>厨房管家</Text>
          <TouchableOpacity onPress={() => setIsSidebarVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            user={{
              _id: 1,
            }}
            renderBubble={renderBubble}
            renderSend={renderSend}
            renderAvatar={() => null}
            showAvatarForEveryMessage={true}
            isTyping={isTyping}
            placeholder="输入消息..."
            timeTextStyle={{ left: { color: '#999', fontSize: 10 }, right: { color: '#ccc', fontSize: 10 } }}
            renderInputToolbar={(props) => (
              <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={{ alignItems: 'center' }}
              />
            )}
            textInputStyle={styles.textInput}
            minInputToolbarHeight={60}
          />
        </View>
      </SafeAreaView>

      {/* Sidebar Modal */}
      <Modal
        visible={isSidebarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSidebarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setIsSidebarVisible(false)}
          />
          <View style={styles.sidebar}>
            <SafeAreaView style={{flex: 1}}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>历史会话</Text>
                <TouchableOpacity onPress={handleCreateNewChat} style={styles.newChatBtn}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.newChatText}>新对话</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.sessionItem, item.id === currentSessionId && styles.sessionItemActive]}
                    onPress={() => selectSession(item.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={item.id === currentSessionId ? "#1A1A1A" : "#666"} />
                    <Text style={[styles.sessionTitle, item.id === currentSessionId && styles.sessionTitleActive]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.id === currentSessionId && (
                       <TouchableOpacity onPress={() => handleDeleteSession(item.id)} style={{padding: 4}}>
                          <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                       </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={{padding: 16}}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
      
      {/* New Chat Preset Selection Modal */}
      <Modal
        visible={isNewChatModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNewChatModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.presetModalContent}>
            <View style={styles.presetModalHeader}>
              <Text style={styles.presetModalTitle}>选择智能体</Text>
              <TouchableOpacity onPress={() => setIsNewChatModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={{maxHeight: 400}}>
              <FlatList
                data={[
                  {id: "kitchen_agent", name: "默认厨房管家", description: "全能型厨房助手，可以查看库存、管理清单、推荐菜谱。", is_system: true, allowed_tools: [], system_prompt: ""},
                  ...presets
                ] as any[]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.presetItem, 
                      selectedPresetId === item.id.toString() && styles.presetItemActive
                    ]}
                    onPress={() => setSelectedPresetId(item.id.toString())}
                  >
                    <View style={styles.presetIcon}>
                       <Ionicons name="person" size={20} color={selectedPresetId === item.id.toString() ? "white" : "#666"} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.presetName, selectedPresetId === item.id.toString() && styles.presetNameActive]}>
                        {item.name}
                      </Text>
                      {item.description ? (
                        <Text style={styles.presetDesc} numberOfLines={2}>{item.description}</Text>
                      ) : null}
                    </View>
                    
                    {/* Action Buttons */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {!item.is_system && (
                        <TouchableOpacity 
                          style={{padding: 8}}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEditPreset(item);
                          }}
                        >
                          <Ionicons name="pencil" size={18} color="#666" />
                        </TouchableOpacity>
                      )}
                      
                      {selectedPresetId === item.id.toString() && (
                        <Ionicons name="checkmark-circle" size={24} color="#1A1A1A" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{padding: 16}}
                ListFooterComponent={
                  <TouchableOpacity 
                    style={styles.createNewAgentBtn}
                    onPress={() => {
                      setEditingPreset(undefined); // Clear editing state for new creation
                      setIsNewChatModalVisible(false);
                      setIsCreateAgentVisible(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#666" />
                    <Text style={styles.createNewAgentText}>创建新智能体</Text>
                  </TouchableOpacity>
                }
              />
            </View>
            
            <TouchableOpacity 
              style={styles.startChatBtn}
              onPress={() => createNewSession(selectedPresetId)}
            >
              <Text style={styles.startChatText}>开始对话</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Agent Modal */}
      <Modal
        visible={isCreateAgentVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCreateAgentVisible(false)}
      >
        <CreateAgentScreen 
          onClose={() => setIsCreateAgentVisible(false)}
          onSuccess={handleCreateAgentSuccess}
          initialData={editingPreset}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (keep existing styles)
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  inputToolbar: {
    backgroundColor: 'white',
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 10,
    fontSize: 15,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 6,
  },
  customAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginTop: 0, 
  },
  thinkingContainer: {
    marginVertical: 4,
    marginBottom: 8,
    marginLeft: 0, 
    width: '100%', 
    maxWidth: width * 0.7, 
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  thinkingHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  thinkingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  thinkingTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  thinkingContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#EFEFEF',
  },
  thoughtItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 24,
  },
  thoughtTimeline: {
    width: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  thoughtDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    zIndex: 1,
  },
  thoughtLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#F0F0F0',
    marginTop: -2,
  },
  thoughtTextContainer: {
    flex: 1,
    paddingBottom: 12,
  },
  thoughtText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebar: {
    width: '80%',
    backgroundColor: 'white',
    height: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 16,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newChatText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  sessionItemActive: {
    backgroundColor: '#F5F5F5',
  },
  sessionTitle: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  sessionTitleActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  // Preset Modal Styles
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  presetModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  presetModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  presetModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 12,
    backgroundColor: 'white',
  },
  presetItemActive: {
    borderColor: '#1A1A1A',
    backgroundColor: '#F9F9F9',
  },
  presetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  presetNameActive: {
    color: '#1A1A1A',
  },
  presetDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  startChatBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  startChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createNewAgentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  createNewAgentText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  }
});

export default VoiceAssistantFeature;