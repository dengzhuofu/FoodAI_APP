import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../styles/theme';
import { uploadFile } from '../../../../api/upload';
import { imageToCalorie, CalorieResult, getHistory, AILog } from '../../../../api/ai';
import AIGeneratingModal from '../../../components/AIGeneratingModal';

const ImageToCalorieFeature = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [history, setHistory] = useState<AILog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(5, 0, 'image-to-calorie');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择图片');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
      setResult(null); // Clear previous result
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const imageUrl = await uploadFile(image);
      const data = await imageToCalorie(imageUrl);
      setResult(data);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error(error);
      Alert.alert('分析失败', '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (item: AILog) => {
    // For calorie feature, we just populate the result state
    // We assume the output_result is compatible with CalorieResult
    if (item.output_result) {
        // If the result is a string (legacy), we might need parsing, 
        // but our updated backend returns object/dict.
        // Assuming CalorieResult structure match.
        try {
            const res = typeof item.output_result === 'string' 
                ? JSON.parse(item.output_result) 
                : item.output_result;
            setResult(res);
            // Optionally scroll to result or alert
            Alert.alert('History Loaded', 'Showing historical analysis result.');
        } catch (e) {
            console.error('Failed to parse history result', e);
        }
    }
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>分析报告</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>High Accuracy</Text>
          </View>
        </View>
        
        <View style={styles.mainStat}>
          <Text style={styles.calorieValue}>{result.calories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>蛋白质</Text>
            <Text style={styles.macroValue}>{result.protein}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>脂肪</Text>
            <Text style={styles.macroValue}>{result.fat}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>碳水</Text>
            <Text style={styles.macroValue}>{result.carbs}</Text>
          </View>
        </View>
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
          <Text style={styles.headerTitle}>热量计算</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="camera" size={32} color="#00C896" />
                  </View>
                  <Text style={styles.uploadText}>上传食物照片</Text>
                </View>
              )}
            </TouchableOpacity>

            {image && !result && (
              <TouchableOpacity 
                style={[styles.analyzeButton, loading && styles.buttonDisabled]} 
                onPress={handleAnalyze}
                disabled={loading}
              >
                <Text style={styles.buttonText}>开始分析</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderResult()}

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>分析记录</Text>
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
                      <Ionicons name="flame-outline" size={20} color="#999" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.input_summary || '未命名分析'}
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
              <Text style={styles.emptyHistoryText}>暂无分析记录</Text>
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
  uploadArea: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  analyzeButton: {
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
  buttonDisabled: {
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  tag: {
    backgroundColor: 'rgba(0,200,150,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.3)',
  },
  tagText: {
    color: '#00C896',
    fontSize: 10,
    fontWeight: '700',
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
    marginTop: 10,
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
  },
});

export default ImageToCalorieFeature;
