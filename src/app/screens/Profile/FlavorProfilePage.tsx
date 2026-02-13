import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getProfile, updateProfile } from '../../../api/profile';
import ScreenHeader from '../../components/ScreenHeader';

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
      <ScreenHeader
        title="风味画像"
        right={
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        }
      />

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
    backgroundColor: '#F6F7FB',
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#00C896',
    borderRadius: 999,
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  saveText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardDesc: {
    fontSize: 14,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 0.6,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  tagText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '800',
  },
  tagTextSelected: {
    color: 'white',
    fontWeight: '900',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#8C8C8C',
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default FlavorProfilePage;
