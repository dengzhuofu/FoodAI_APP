import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { getHealthProfile, createOrUpdateHealthProfile, HealthProfile } from '../../../api/health';
import ScreenHeader from '../../components/ScreenHeader';

const HealthProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<HealthProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getHealthProfile();
    if (data) {
      setProfile(data);
      setHeight(data.height.toString());
      setWeight(data.weight.toString());
    }
  };

  const handleSubmit = async () => {
    if (!height || !weight) {
      Alert.alert('提示', '请输入身高和体重');
      return;
    }
    setLoading(true);
    try {
      const data = await createOrUpdateHealthProfile(parseFloat(height), parseFloat(weight));
      setProfile(data);
      Alert.alert('成功', '健康档案已更新');
    } catch (error) {
      Alert.alert('错误', '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="个人健康档案" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.label}>身高 (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="例如: 175"
            placeholderTextColor="#A0A0A0"
          />
          
          <Text style={styles.label}>体重 (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="例如: 65"
            placeholderTextColor="#A0A0A0"
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>生成/更新健康计划</Text>}
          </TouchableOpacity>
        </View>

        {profile && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>您的健康报告</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.daily_calorie_target}</Text>
                <Text style={styles.statLabel}>每日推荐热量 (kcal)</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>饮食建议</Text>
            <Text style={styles.adviceText}>{profile.dietary_advice}</Text>
            
            <Text style={styles.sectionTitle}>运动建议</Text>
            <Text style={styles.adviceText}>{profile.exercise_advice}</Text>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('MealPlan')}
            >
              <Text style={styles.linkButtonText}>前往膳食计划</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 16 },
  formCard: {
    backgroundColor: '#FFF',
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
  label: { fontSize: 12, color: '#8C8C8C', marginBottom: 8, fontWeight: '800', letterSpacing: 0.4 },
  input: {
    backgroundColor: '#F6F7FB',
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  button: {
    backgroundColor: '#00C896',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  buttonText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.2 },
  resultCard: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  resultTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16, textAlign: 'center', fontStyle: 'italic', color: '#1A1A1A' },
  statRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 34, fontWeight: '900', color: '#00C896', fontStyle: 'italic' },
  statLabel: { fontSize: 12, color: '#9A9A9A', fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', marginTop: 14, marginBottom: 8, letterSpacing: 0.6, fontStyle: 'italic', color: '#1A1A1A' },
  adviceText: { fontSize: 14, color: '#3A3A3A', lineHeight: 22, fontWeight: '600' },
  linkButton: {
    marginTop: 18,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButtonText: { color: '#FFF', fontWeight: '900', marginRight: 8, letterSpacing: 0.2 },
});

export default HealthProfileScreen;
