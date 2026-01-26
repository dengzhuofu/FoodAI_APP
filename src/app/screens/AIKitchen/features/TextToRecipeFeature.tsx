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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>定制菜谱</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>核心食材</Text>
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
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>生成创意菜谱</Text>
              )}
            </TouchableOpacity>
          </View>
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#EEEEEE',
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
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  tagActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
  },
  tagTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
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
});

export default TextToRecipeFeature;
