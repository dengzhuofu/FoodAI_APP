import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { createRecipe } from '../../../api/content';

const PublishRecipeScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<{name: string, amount: string}[]>([{name: '', amount: ''}]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handlePublish = async () => {
    if (!title || !description) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecipe({
        title,
        description,
        cover_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', // Mock image
        ingredients: ingredients.map(i => `${i.name} ${i.amount}`),
        steps: ['Step 1: Prepare ingredients', 'Step 2: Cook'], // Mock steps
        cooking_time: '30 mins',
        difficulty: 'Medium',
        cuisine: 'Fusion',
        category: 'Main'
      });
      
      Alert.alert('发布成功', '您的菜谱已发布！', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('发布失败', '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>发布菜谱</Text>
        <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
          <Text style={styles.publishButtonText}>发布</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageUpload}>
          <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.uploadText}>上传成品图</Text>
        </View>

        <Text style={styles.label}>菜谱名称</Text>
        <TextInput 
          style={styles.input} 
          placeholder="给你的菜谱起个好听的名字" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>心得描述</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="分享你的烹饪心得..." 
          multiline 
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>食材清单</Text>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
              placeholder="食材名称" 
              value={item.name}
              onChangeText={(text) => handleIngredientChange(index, 'name', text)}
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="用量" 
              value={item.amount}
              onChangeText={(text) => handleIngredientChange(index, 'amount', text)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addMore} onPress={handleAddIngredient}>
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.addMoreText}>添加食材</Text>
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
  publishButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  publishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
  },
  imageUpload: {
    height: 200,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  addMoreText: {
    color: theme.colors.primary,
    marginLeft: 4,
  },
});

export default PublishRecipeScreen;
