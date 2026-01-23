import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../styles/theme';
import { uploadFile } from '../../../../api/upload';
import { imageToRecipe } from '../../../../api/ai';

const ImageToRecipeFeature = () => {
  const navigation = useNavigation<any>();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // 1. Upload image
      const imageUrl = await uploadFile(image);
      
      // 2. Call AI
      const result = await imageToRecipe(imageUrl);
      
      // 3. Navigate to result
      navigation.navigate('GeneratedRecipeResult', { recipe: result });
    } catch (error) {
      console.error(error);
      Alert.alert('生成失败', '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>图 → 菜谱</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          拍摄或上传食物图片，AI将自动识别并为您生成详细的烹饪菜谱。
        </Text>

        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.uploadText}>点击上传/拍摄图片</Text>
            </View>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.buttonDisabled]} 
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>生成菜谱</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 识别小贴士</Text>
          <Text style={styles.tipsText}>• 保持光线充足，食物主体清晰</Text>
          <Text style={styles.tipsText}>• 尽量拍摄完整的食物外观</Text>
          <Text style={styles.tipsText}>• 支持识别成品菜肴和原材料</Text>
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
  generateButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: theme.spacing.sm,
  },
  tipsText: {
    fontSize: 14,
    color: '#F57C00',
    marginBottom: 4,
  },
});

export default ImageToRecipeFeature;
