import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../styles/theme';
import { uploadFile } from '../../../../api/upload';
import { imageToCalorie, CalorieResult } from '../../../../api/ai';

const ImageToCalorieFeature = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalorieResult | null>(null);

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
    } catch (error) {
      console.error(error);
      Alert.alert('分析失败', '请稍后再试');
    } finally {
      setLoading(false);
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
                    <Ionicons name="camera" size={32} color="#1A1A1A" />
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
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>开始分析</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {renderResult()}
        </ScrollView>
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
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  uploadArea: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EEEEEE',
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
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#4CAF50',
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
    backgroundColor: '#EEEEEE',
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
});

export default ImageToCalorieFeature;
