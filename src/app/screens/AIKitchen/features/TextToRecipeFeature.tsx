import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../styles/theme';
import { textToRecipe, getHistory, AILog } from '../../../../api/ai';
import AIGeneratingModal from '../../../components/AIGeneratingModal';

const TextToRecipeFeature = () => {
  const navigation = useNavigation<any>();
  const [ingredients, setIngredients] = useState('');
  const [preference, setPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AILog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(5, 0, 'text-to-recipe');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      Alert.alert('请输入食材', '请先输入您想使用的食材');
      return;
    }
    
    setLoading(true);
    try {
      const data = await textToRecipe(ingredients, preference);
      // @ts-ignore
      navigation.navigate('GeneratedRecipeResult', { recipe: data.result, logId: data.log_id });
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error(error);
      Alert.alert('生成失败', 'AI服务暂时无法响应，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (item: AILog) => {
    if (item.output_result) {
      navigation.navigate('GeneratedRecipeResult', { recipe: item.output_result, logId: item.id });
    }
  };

  const preferences = ['清淡', '香辣', '酸甜', '低脂', '快手'];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>定制菜谱</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.label}>核心食材</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="例如：鸡胸肉、西兰花、鸡蛋..."
                  placeholderTextColor="#999"
                  multiline
                  value={ingredients}
                  onChangeText={setIngredients}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.label}>口味偏好</Text>
              </View>
              <View style={styles.tagsContainer}>
                {preferences.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.tag, 
                      preference === item && styles.tagActive
                    ]} 
                    onPress={() => setPreference(item)}
                  >
                    <Text style={[
                      styles.tagText,
                      preference === item && styles.tagTextActive
                    ]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.generateButton, loading && styles.buttonDisabled]} 
                onPress={handleGenerate}
                disabled={loading}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>生成创意菜谱</Text>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </View>

            {/* History Section */}
            <View style={styles.historySection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.historySectionTitle}>生成记录</Text>
              </View>
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
                        {item.output_result?.image_url ? (
                          <Image source={{ uri: item.output_result.image_url }} style={styles.historyImage} />
                        ) : (
                          <Ionicons name="restaurant-outline" size={20} color="#999" />
                        )}
                      </View>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {item.output_result?.title || item.input_summary || '未命名菜谱'}
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
                <Text style={styles.emptyHistoryText}>暂无生成记录</Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionDecor: {
    width: 4,
    height: 16,
    backgroundColor: '#00C896',
    marginRight: 8,
    transform: [{ skewX: '-12deg' }],
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagActive: {
    backgroundColor: 'rgba(0,200,150,0.1)',
    borderColor: '#00C896',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
  },
  tagTextActive: {
    color: '#00C896',
    fontWeight: 'bold',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#00C896',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  historySection: {
    padding: 0,
    marginTop: 24,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  historyList: {
    gap: 12,
    marginTop: 16,
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
    overflow: 'hidden',
  },
  historyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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

export default TextToRecipeFeature;
