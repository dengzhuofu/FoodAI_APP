import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { getHistory, AILog, chatWithKitchenAgent } from '../../../../api/ai';
import { GiftedChat, IMessage, Bubble, InputToolbar } from 'react-native-gifted-chat';

const ThinkingBubble = ({ thoughts }: { thoughts: any[] }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!thoughts || thoughts.length === 0) return null;

  return (
    <View style={styles.thinkingContainer}>
      <TouchableOpacity 
        style={styles.thinkingHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={14} color="#666" />
        <Text style={styles.thinkingTitle}>
          AI 思考过程 ({thoughts.length} 步)
        </Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={14} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.thinkingContent}>
          {thoughts.map((thought, index) => (
            <View key={index} style={styles.thoughtItem}>
              <View style={styles.thoughtLine} />
              <View style={styles.thoughtDot} />
              <Text style={styles.thoughtText}>{thought.description}</Text>
              {/* <Text style={styles.thoughtArgs}>{JSON.stringify(thought.args)}</Text> */}
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
          avatar: 'https://img.icons8.com/color/48/000000/chef-hat.png',
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
          avatar: 'https://img.icons8.com/color/48/000000/chef-hat.png',
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

    return (
      <View>
        {thoughts && thoughts.length > 0 && (
           <ThinkingBubble thoughts={thoughts} />
        )}
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: 'white',
              borderRadius: 16,
              borderTopLeftRadius: 4,
              padding: 4,
            },
            right: {
              backgroundColor: '#1A1A1A',
              borderRadius: 16,
              borderTopRightRadius: 4,
              padding: 4,
            },
          }}
          textStyle={{
            left: { color: '#333' },
            right: { color: 'white' },
          }}
        />
      </View>
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
            isTyping={isTyping}
            placeholder="输入消息..."
            timeTextStyle={{ left: { color: '#999' }, right: { color: '#ccc' } }}
            renderInputToolbar={(props) => (
              <InputToolbar
                {...props}
                containerStyle={{
                  backgroundColor: 'white',
                  borderTopColor: '#eee',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              />
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  thinkingContainer: {
    marginVertical: 4,
    marginLeft: 8,
    maxWidth: '80%',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  thinkingTitle: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
    fontWeight: '600',
  },
  thinkingContent: {
    marginTop: 4,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  thoughtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  thoughtLine: {
    position: 'absolute',
    left: 3,
    top: 10,
    bottom: -10,
    width: 1,
    backgroundColor: '#DDD',
    zIndex: -1,
  },
  thoughtDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  thoughtText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
});

export default VoiceAssistantFeature;
