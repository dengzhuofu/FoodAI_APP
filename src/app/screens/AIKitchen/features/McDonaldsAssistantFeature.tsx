import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { saveToken, getTokenStatus, listTools, callTool, chatWithMCP, MCPTool } from '../../../../api/mcdonalds';
import Markdown, { ASTNode } from 'react-native-markdown-display';
import AIGeneratingModal from '../../../components/AIGeneratingModal';

// ...

const MarkdownImage = ({ src }: { src: string }) => {
  const [aspectRatio, setAspectRatio] = useState(16/9);

  useEffect(() => {
    if (src) {
      Image.getSize(src, (width, height) => {
        if (width && height) {
          setAspectRatio(width / height);
        }
      }, (error) => {
        console.error('Failed to get image size:', error);
      });
    }
  }, [src]);

  return (
    <View style={{
        width: '100%',
        marginVertical: 10,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
    }}>
      <Image
        source={{ uri: src }}
        style={{
            width: '100%',
            aspectRatio: aspectRatio,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const rules = {
  image: (node: ASTNode, children: any, parent: any, styles: any) => {
    return <MarkdownImage key={node.key} src={node.attributes.src} />;
  }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

const McDonaldsAssistantFeature = () => {
  const navigation = useNavigation<any>();
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [activeTab, setActiveTab] = useState<'tools' | 'chat'>('tools');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      setLoading(true);
      const status = await getTokenStatus();
      setHasToken(status.has_token);
      if (status.has_token) {
        fetchTools();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      const data = await listTools();
      // @ts-ignore
      setTools(data.tools || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch tools');
    }
  };

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    try {
      setLoading(true);
      await saveToken(token);
      setHasToken(true);
      Alert.alert('Success', 'Token saved successfully');
      fetchTools();
    } catch (error) {
      Alert.alert('Error', 'Failed to save token');
    } finally {
      setLoading(false);
    }
  };

  const handleCallTool = async (tool: MCPTool) => {
    try {
      setLoading(true);
      // For simplicity, we assume tools don't need complex args or we prompt for them
      // In this demo, we'll just call with empty args or handle specific ones
      let args = {};
      if (tool.name === 'claim_coupon') {
        // Simple prompt simulation
        Alert.prompt('Claim Coupon', 'Enter Coupon ID', async (text) => {
             if (text) {
                 await executeToolCall(tool.name, { coupon_id: text });
             }
        });
        return;
      }
      
      await executeToolCall(tool.name, args);
    } catch (error) {
      Alert.alert('Error', 'Failed to call tool');
    } finally {
      setLoading(false);
    }
  };

  const executeToolCall = async (name: string, args: any) => {
      try {
        setLoading(true);
        const result = await callTool(name, args);
        
        // Use result.result directly as string, or handle object
        const content = typeof result.result === 'string' 
          ? result.result 
          : JSON.stringify(result.result, null, 2);

        navigation.navigate('ToolResult', {
          title: name,
          content: content
        });
      } catch (e) {
          Alert.alert('Error', 'Tool execution failed');
      } finally {
          setLoading(false);
      }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatMessage };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const response = await chatWithMCP(userMsg.content);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        toolCalls: response.tool_calls
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      Alert.alert('Error', 'Chat failed');
    } finally {
      setChatLoading(false);
    }
  };

  const renderMessageContent = (content: string, role: 'user' | 'assistant') => {
    if (!content) return null;
    
    // For user messages, keep simple text
    if (role === 'user') {
      return (
        <Text style={styles.userText}>{content}</Text>
      );
    }
    
    // Pre-process content to fix potential image syntax issues if needed
    // But standard markdown renderer should handle ![alt](url) fine.
    // Sometimes URLs might have spaces or weird chars, but let's trust the renderer first.

    // For assistant messages, use Markdown renderer
    return (
      <Markdown
        rules={rules}
        style={{
          body: { color: '#1A1A1A', fontSize: 15, lineHeight: 22 },
          // image style is now handled by custom rule
          link: { color: '#00C896' },
          paragraph: { marginVertical: 8 }, // Increased spacing
          list_item: { marginBottom: 10 }, // Increased list item spacing
          heading1: { color: '#00C896', fontWeight: 'bold' },
          heading2: { color: '#00C896', fontWeight: 'bold' },
          strong: { color: '#000000', fontWeight: 'bold' },
        }}
      >
        {content}
      </Markdown>
    );
  };

  if (!hasToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>麦当劳助手</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>请输入您的 MCP Token。申请地址：<Text style={styles.link} onPress={() => Linking.openURL('https://open.mcd.cn/mcp')}>https://open.mcd.cn/mcp</Text></Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Enter token..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveToken} disabled={loading}>
            <Text style={styles.buttonText}>保存 Token</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Token 将安全保存在您的账户中。</Text>
        </View>
        <AIGeneratingModal visible={loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>麦当劳助手</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'tools' && styles.activeTab]} 
            onPress={() => setActiveTab('tools')}
        >
            <Text style={[styles.tabText, activeTab === 'tools' && styles.activeTabText]}>工具箱</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'chat' && styles.activeTab]} 
            onPress={() => setActiveTab('chat')}
        >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>智能助手</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tools' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>可用工具</Text>
          {tools.map((tool, index) => (
            <TouchableOpacity key={index} style={styles.toolCard} onPress={() => handleCallTool(tool)}>
              <View style={styles.toolIcon}>
                <Ionicons name="construct-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView style={styles.chatContainer} contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                {renderMessageContent(msg.content, msg.role)}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <View style={styles.toolCallsContainer}>
                        <Text style={styles.toolCallsTitle}>调用工具:</Text>
                        {msg.toolCalls.map((tc, idx) => (
                            <View key={idx} style={styles.toolCallItem}>
                                <Text style={styles.toolCallName}>{tc.tool}</Text>
                                {/* <Text style={styles.toolCallResult}>{JSON.stringify(tc.result)}</Text> */}
                            </View>
                        ))}
                    </View>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              value={chatMessage}
              onChangeText={setChatMessage}
              placeholder="我想吃麦当劳..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
      
      <AIGeneratingModal visible={loading || chatLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  link: {
      color: '#00C896',
      textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#00C896',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  hint: {
    marginTop: 10,
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00C896',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#00C896',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00C896', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 12,
    color: '#999',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#E0F2F1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#004D40',
    fontWeight: '600',
  },
  assistantText: {
    color: '#1A1A1A',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00C896',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toolCallsContainer: {
      marginTop: 8,
      padding: 8,
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
  },
  toolCallsTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#666',
  },
  toolCallItem: {
      marginBottom: 4,
  },
  toolCallName: {
      fontSize: 12,
      color: '#333',
      fontWeight: '600',
  },
  toolCallResult: {
      fontSize: 10,
      color: '#666',
      fontFamily: 'monospace',
  },
  imageContainer: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  messageImage: {
    width: '100%',
    aspectRatio: 16/9, // Set a default aspect ratio or adjust based on image dimensions if known
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  }
});

export default McDonaldsAssistantFeature;
