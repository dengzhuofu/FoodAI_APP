import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { createRestaurant } from '../../../api/content';

const PublishStoreScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!title || !content) {
      Alert.alert('提示', '请填写标题和正文');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRestaurant({
        name: title, // Use title as name for now
        title,
        content,
        address: address || '未知地点',
        rating: parseFloat(rating) || 5,
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'], // Mock image
        cuisine: '其他',
        hours: '10:00 - 22:00',
        phone: '123-456-7890'
      });
      
      Alert.alert('发布成功', '您的探店笔记已发布！', [
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
        <Text style={theme.typography.h2}>发布探店</Text>
        <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
          <Text style={styles.publishButtonText}>发布</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageUpload}>
          <Ionicons name="images-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.uploadText}>上传探店照片</Text>
        </View>

        <Text style={styles.label}>标题</Text>
        <TextInput 
          style={styles.input} 
          placeholder="例如：这家店真的绝绝子！" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>正文</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="分享你的探店体验，推荐菜品、环境、服务等..." 
          multiline 
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        <View style={styles.optionRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.text} />
          <TextInput 
             style={[styles.optionInput, { flex: 1 }]} 
             placeholder="添加地点" 
             value={address} 
             onChangeText={setAddress}
          />
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>

        <View style={styles.optionRow}>
          <Ionicons name="star-outline" size={20} color={theme.colors.text} />
          <TextInput 
             style={[styles.optionInput, { flex: 1 }]} 
             placeholder="评分 (0-5)" 
             value={rating} 
             onChangeText={setRating}
             keyboardType="numeric"
          />
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
    height: 150,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  optionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  optionInput: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
});

export default PublishStoreScreen;
