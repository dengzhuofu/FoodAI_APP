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
          <Ionicons name="nutrition" size={24} color={theme.colors.secondary} />
          <Text style={styles.resultTitle}>分析结果</Text>
        </View>
        
        <View style={styles.calorieContainer}>
          <Text style={styles.calorieValue}>{result.calories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>

        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{result.protein}</Text>
            <Text style={styles.macroLabel}>蛋白质</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{result.fat}</Text>
            <Text style={styles.macroLabel}>脂肪</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{result.carbs}</Text>
            <Text style={styles.macroLabel}>碳水</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>图 → 卡路里</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          拍照识别食物，AI帮您精准计算卡路里和营养成分，管理健康饮食。
        </Text>

        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="scan-circle-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.uploadText}>点击拍摄食物</Text>
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
              <>
                <Ionicons name="analytics" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>开始分析</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {renderResult()}

        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          <View style={styles.historyItem}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' }} style={styles.historyImage} />
            <View style={styles.historyInfo}>
              <Text style={styles.historyName}>蔬菜沙拉</Text>
              <Text style={styles.historyDate}>今天 12:30</Text>
            </View>
            <Text style={styles.historyCal}>320 kcal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  uploadArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  calorieUnit: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  historyContainer: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  historyImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyCal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default ImageToCalorieFeature;
