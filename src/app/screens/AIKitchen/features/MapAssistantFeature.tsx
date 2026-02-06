import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, MessageText } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { chatWithMapAgent } from '../../../../api/maps';

const { width } = Dimensions.get('window');

const MapAssistantFeature = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { destination } = (route.params as any) || {};
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    // Initial greeting
    let greeting = '你好！我是你的地图小助手。';
    if (destination) {
      greeting += `我看你正在关注“${destination.name || destination.address}”，有什么我可以帮你的吗？我可以帮你规划路线，或者查找周边的信息。`;
    } else {
      greeting += '我可以帮你查询地点、规划路线或探索周边。';
    }

    setMessages([
      {
        _id: 1,
        text: greeting,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Map Assistant',
          avatar: 'https://img.icons8.com/color/96/map-pin.png',
        },
      },
    ]);
  }, [destination]);

  const onSend = async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);

    try {
      // Prepare history for context
      const history = messages
        .filter(m => m.user._id !== 1 || m.text !== userMessage.text) // Exclude current message and system messages if any
        .map(m => ({
            role: m.user._id === 1 ? 'user' : 'assistant',
            content: m.text
        }))
        .reverse()
        .slice(0, 10); // Keep last 10 messages

      // Add context about the destination if available
      let messageToSend = userMessage.text;
      if (destination && messages.length === 1) { // First user message
         messageToSend = `[Context: User is looking at ${destination.name}, Address: ${destination.address}, Location: ${destination.longitude},${destination.latitude}] ${userMessage.text}`;
      }

      const response = await chatWithMapAgent(messageToSend, history);
      
      const botMessage: IMessage = {
        _id: Math.random().toString(),
        text: response.answer || response.response?.answer || "抱歉，我没有理解。",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Map Assistant',
          avatar: 'https://img.icons8.com/color/96/map-pin.png',
        },
        // @ts-ignore
        toolResults: response.tool_results // Pass structured results to message
      };

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
      
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: IMessage = {
        _id: Math.random().toString(),
        text: "抱歉，服务暂时不可用，请稍后再试。",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Map Assistant',
          avatar: 'https://img.icons8.com/color/96/map-pin.png',
        },
      };
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [errorMessage]));
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    const isAi = currentMessage.user._id !== 1;

    if (isAi) {
      if (!currentMessage.text) return null;

      return (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <Markdown
            style={{
              body: { color: '#333', fontSize: 15, lineHeight: 24 },
              heading1: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 20, marginBottom: 8, marginTop: 8 },
              heading2: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 18, marginBottom: 8, marginTop: 8 },
              paragraph: { marginTop: 0, marginBottom: 8, flexWrap: 'wrap', flexDirection: 'row' },
            }}
          >
            {currentMessage.text}
          </Markdown>
        </View>
      );
    }
    
    return (
      <MessageText 
        {...props}
        textStyle={{
          left: { color: '#333', fontSize: 15, lineHeight: 22 },
          right: { color: 'white', fontSize: 15, lineHeight: 22 },
        }}
      />
    );
  };

  const renderBubble = (props: any) => {
    return (
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
            maxWidth: width * 0.75,
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
      />
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

  const quickActions = [
    { id: 'route', label: '🚗 怎么去?', icon: 'navigate', prompt: '请帮我规划从我当前位置到这里的路线。优先推荐驾车路线。' },
    { id: 'nearby', label: '🏞️ 周边景点', icon: 'map', prompt: '这里附近有什么好玩的景点推荐吗？请列出3个。' },
    { id: 'food', label: '🍽️ 附近美食', icon: 'restaurant', prompt: '这附近有什么好吃的餐厅推荐？' },
    { id: 'weather', label: '🌤️ 当地天气', icon: 'partly-sunny', prompt: '这里的实时天气怎么样？' },
  ];

  const handleQuickAction = (action: any) => {
    const message: IMessage = {
      _id: Math.random().toString(),
      text: action.prompt,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };
    onSend([message]);
  };

  const renderCustomView = (props: any) => {
    const { currentMessage } = props;
    if (currentMessage.toolResults && currentMessage.toolResults.length > 0) {
      return (
        <View style={styles.toolResultContainer}>
           {currentMessage.toolResults.map((res: any, index: number) => {
             // Simple rendering for now. Can be expanded to render Maps/Lists based on tool name
             if (res.tool === 'maps_around_search' || res.tool === 'maps_text_search') {
               const pois = res.data?.pois || [];
               if (pois.length === 0) return null;
               return (
                 <View key={index} style={styles.poiList}>
                   <Text style={styles.resultTitle}>📍 推荐地点</Text>
                   {pois.slice(0, 3).map((poi: any, i: number) => (
                     <View key={i} style={styles.poiItem}>
                        <Text style={styles.poiName}>{poi.name}</Text>
                        <Text style={styles.poiAddress}>{poi.address || poi.location}</Text>
                     </View>
                   ))}
                 </View>
               );
             }
             if (res.tool === 'maps_weather') {
                const lives = res.data?.lives?.[0];
                if (!lives) return null;
                return (
                  <View key={index} style={styles.weatherCard}>
                     <Text style={styles.resultTitle}>🌤️ {lives.city}天气</Text>
                     <View style={styles.weatherRow}>
                        <Text style={styles.weatherTemp}>{lives.temperature}°C</Text>
                        <View>
                           <Text style={styles.weatherText}>{lives.weather}</Text>
                           <Text style={styles.weatherText}>{lives.winddirection}风 {lives.windpower}级</Text>
                        </View>
                     </View>
                     <Text style={styles.weatherTime}>更新于: {lives.reporttime}</Text>
                  </View>
                );
             }
             return null;
           })}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>地图小助手</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.content}>
          <GiftedChat
            messages={messages}
            onSend={(messages: IMessage[]) => onSend(messages)}
            user={{
              _id: 1,
            }}
            renderBubble={renderBubble}
            renderMessageText={renderMessageText}
            renderSend={renderSend}
            renderAvatar={() => null}
            isTyping={isTyping}
            placeholder="输入消息..."
            timeTextStyle={{ left: { color: '#999', fontSize: 10 }, right: { color: '#ccc', fontSize: 10 } }}
            textInputStyle={styles.textInput}
            minInputToolbarHeight={60}
            renderCustomView={renderCustomView}
            renderChatFooter={() => (
              <View style={styles.quickActionsContainer}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction(action)}
                  >
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  toolResultContainer: {
    padding: 10,
    width: '100%',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  poiList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  poiItem: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  poiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  poiAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  weatherCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  weatherText: {
    fontSize: 14,
    color: '#1565C0',
  },
  weatherTime: {
    fontSize: 10,
    color: '#90CAF9',
  },
});

export default MapAssistantFeature;
