import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { textToImage, getHistory, AILog } from '../../../../api/ai';
import AIGeneratingModal from '../../../components/AIGeneratingModal';

const TextToImageFeature = () => {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AILog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(5, 0, 'text-to-image');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('请输入描述', '请先输入您想要生成的美食描述');
      return;
    }
    
    setLoading(true);
    try {
      const url = await textToImage(prompt);
      setGeneratedImage(url);
      fetchHistory();
    } catch (error) {
      Alert.alert('生成失败', '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (item: AILog) => {
    if (item.output_result && item.output_result.url) {
      setGeneratedImage(item.output_result.url);
      setPrompt(item.input_summary); // Restore prompt
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>美食绘图</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>创意描述</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="例如：一份淋着蜂蜜的松软舒芙蕾，配上新鲜草莓..."
                placeholderTextColor="#999"
                multiline
                value={prompt}
                onChangeText={setPrompt}
                textAlignVertical="top"
              />
              {prompt.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setPrompt('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tagsRow}>
              {['日式拉面', '法式甜点', '麻辣火锅'].map((tag, index) => (
                <TouchableOpacity key={index} style={styles.tag} onPress={() => setPrompt(tag)}>
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.generateButton, loading && styles.buttonDisabled]} 
              onPress={handleGenerate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>开始绘制</Text>
              <Ionicons name="brush" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {generatedImage && (
            <View style={styles.resultCard}>
              <Image source={{ uri: generatedImage }} style={styles.resultImage} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={20} color="#1A1A1A" />
                  <Text style={styles.actionText}>保存</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={20} color="#1A1A1A" />
                  <Text style={styles.actionText}>分享</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>绘图记录</Text>
            {loadingHistory ? (
              <ActivityIndicator color="#00C896" style={{ marginTop: 20 }} />
            ) : history.length > 0 ? (
              <View style={styles.historyList}>
                {history.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyItem}
                    onPress={() => handleHistoryPress(item)}
                  >
                    <View style={styles.historyIcon}>
                      <Ionicons name="image-outline" size={20} color="#999" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.input_summary || '未命名图片'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHistoryText}>暂无绘图记录</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <AIGeneratingModal visible={loading} />
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  clearButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#00C896',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default TextToImageFeature;
