import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { getHealthProfile, createOrUpdateHealthProfile, HealthProfile } from '../../../api/health';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>个人健康档案</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.label}>身高 (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="例如: 175"
          />
          
          <Text style={styles.label}>体重 (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="例如: 65"
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
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: '#FFF' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: 12, color: '#999' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  adviceText: { fontSize: 14, color: '#444', lineHeight: 22 },
  linkButton: { marginTop: 24, backgroundColor: '#20C997', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkButtonText: { color: '#FFF', fontWeight: 'bold', marginRight: 8 }
});

export default HealthProfileScreen;
