import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';

const TextToImageFeature = () => {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('请输入描述', '请先输入您想要生成的美食描述');
      return;
    }
    Alert.alert('AI绘画中', '正在根据您的描述生成美食图片...', [
      { 
        text: '确定', 
        onPress: () => {
          setGeneratedImage('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=60');
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>文 → 图</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          输入一段文字描述，AI将为您绘制出令人垂涎欲滴的美食图片。
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="例如：一份淋着蜂蜜的松软舒芙蕾，配上新鲜草莓，阳光明媚的早晨..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            value={prompt}
            onChangeText={setPrompt}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.clearButton} onPress={() => setPrompt('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Ionicons name="brush" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>开始绘制</Text>
        </TouchableOpacity>

        {generatedImage && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>生成结果</Text>
            <Image source={{ uri: generatedImage }} style={styles.resultImage} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.examplesContainer}>
          <Text style={styles.sectionTitle}>灵感示例</Text>
          <View style={styles.tagsContainer}>
            {['日式拉面', '法式甜点', '麻辣火锅', '海鲜大餐', '精致下午茶'].map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag} onPress={() => setPrompt(tag)}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
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
  inputContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
    minHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  clearButton: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: 4,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#A18CD1',
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
  resultContainer: {
    marginBottom: theme.spacing.xl,
  },
  resultTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.text,
  },
  examplesContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default TextToImageFeature;
