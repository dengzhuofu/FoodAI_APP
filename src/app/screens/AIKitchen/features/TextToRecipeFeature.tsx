import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { textToRecipe } from '../../../../api/ai';

const TextToRecipeFeature = () => {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState('');
  const [preference, setPreference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      Alert.alert('请输入食材', '请先输入您想使用的食材');
      return;
    }
    
    setLoading(true);
    try {
      const result = await textToRecipe(ingredients, preference);
      // Navigate to result screen with the generated recipe
      // Assuming we have a GeneratedRecipeResult screen configured in navigation
      // @ts-ignore
      navigation.navigate('GeneratedRecipeResult', { recipe: result });
    } catch (error) {
      console.error(error);
      Alert.alert('生成失败', 'AI服务暂时无法响应，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const preferences = ['清淡', '香辣', '酸甜', '低脂', '快手'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>文 → 菜谱</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          输入您手头的食材，选择口味偏好，AI为您生成创意菜谱。
        </Text>

        <Text style={styles.label}>主要食材</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="例如：鸡胸肉、西兰花、鸡蛋..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            value={ingredients}
            onChangeText={setIngredients}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.label}>口味偏好</Text>
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
          {loading ? (
            <ActivityIndicator color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="restaurant" size={20} color="white" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>{loading ? '生成中...' : '生成菜谱'}</Text>
        </TouchableOpacity>

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
  label: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    minHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xl,
  },
  tag: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  tagTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#84FAB0',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
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
});

export default TextToRecipeFeature;
