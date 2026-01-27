import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { getHistory, AILog, chatWithKitchenAgent } from '../../../../api/ai';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';

const { width } = Dimensions.get('window');

const ThinkingBubble = ({ thoughts }: { thoughts: any[] }) => {
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

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: '你好！我是你的智能厨房管家。我可以帮你查看冰箱库存，或者管理购物清单。你可以直接告诉我你的需求，比如"看看冰箱里有什么？"或"把牛奶加入购物清单"。',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Chef',
          avatar: 'https://img.icons8.com/color/96/000000/chef-hat.png',
        },
      },
    ]);
  }, []);

  const onSend = async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);

    try {
      const history = messages.map(msg => ({
        role: msg.user._id === 1 ? 'user' : 'assistant',
        content: msg.text
      })).reverse();

      const aiResponse = await chatWithKitchenAgent(userMessage.text, history);
      // aiResponse is now { answer: string, thoughts: Array }
      
      const botMessage: IMessage = {
        _id: Math.random().toString(),
        text: aiResponse.answer,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Chef',
          avatar: 'https://img.icons8.com/color/96/000000/chef-hat.png',
        },
        // Store thoughts in custom property
        // @ts-ignore
        thoughts: aiResponse.thoughts
      };

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
    } catch (error) {
      console.error('Chat Error:', error);
      // ... error handling
    } finally {
      setIsTyping(false);
    }
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const thoughts = currentMessage.thoughts;
    const isAi = currentMessage.user._id !== 1;

    // Custom Avatar rendering inside renderBubble for precise alignment
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
                // Remove marginLeft since we are handling avatar spacing manually
                marginLeft: 0,
              },
              right: {
                backgroundColor: '#1A1A1A',
                borderRadius: 18,
                borderTopRightRadius: 2,
                padding: 2,
                // maxWidth is handled by flex container, but we can keep a max width constraint
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
          <View style={{ width: 40 }} />
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
            // Hide default avatar rendering since we handle it in renderBubble
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
    </View>
  );
};

const styles = StyleSheet.create({
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
  // Custom Avatar Styles
  customAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginTop: 0, // Top aligned
  },
  // Thinking Bubble Styles
  thinkingContainer: {
    marginVertical: 4,
    marginBottom: 8,
    marginLeft: 0, 
    width: '100%', // Take full width of the text column
    maxWidth: width * 0.7, // Limit width
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
    backgroundColor: '#FFD700', // Gold/Yellow for thinking
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
});

export default VoiceAssistantFeature;
