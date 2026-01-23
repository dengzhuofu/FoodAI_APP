import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getProfile, updateProfile } from '../../../api/profile';

const FlavorProfilePage = () => {
  const navigation = useNavigation();

  const [preferences, setPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setPreferences(data.preferences || []);
      setAllergies(data.allergies || []);
      setGoals(data.health_goals || []);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        preferences,
        allergies,
        health_goals: goals
      });
      Alert.alert('成功', '风味画像已保存');
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const renderTagSection = (title: string, items: string[], currentList: string[], setList: (l: string[]) => void, color: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.tagsContainer}>
        {items.map((item, index) => {
          const isSelected = currentList.includes(item);
          return (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.tag, 
                isSelected && { backgroundColor: color, borderColor: color }
              ]}
              onPress={() => toggleSelection(currentList, setList, item)}
            >
              <Text style={[
                styles.tagText,
                isSelected && styles.tagTextSelected
              ]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>风味画像</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>我的口味偏好</Text>
          <Text style={styles.cardDesc}>AI将根据您的偏好推荐更合口味的菜谱</Text>
        </View>

        {renderTagSection(
          '口味倾向', 
          ['清淡', '重口', '微辣', '特辣', '酸甜', '咸鲜', '原味'], 
          preferences, 
          setPreferences, 
          theme.colors.primary
        )}

        {renderTagSection(
          '饮食禁忌 & 过敏源', 
          ['花生', '海鲜', '牛奶', '鸡蛋', '坚果', '香菜', '葱姜蒜'], 
          allergies, 
          setAllergies, 
          theme.colors.error
        )}

        {renderTagSection(
          '健康目标', 
          ['减脂', '增肌', '低碳水', '高蛋白', '控糖', '素食'], 
          goals, 
          setGoals, 
          theme.colors.success
        )}
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>您的风味画像仅用于为您提供个性化推荐，不会用于其他用途。</Text>
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
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  tagTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default FlavorProfilePage;
