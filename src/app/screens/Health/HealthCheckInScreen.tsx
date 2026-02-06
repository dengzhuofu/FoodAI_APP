import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { createCheckIn, calculateCalories } from '../../../api/health';

const HealthCheckInScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const date = route.params?.date || new Date().toISOString().split('T')[0];

  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [exercise, setExercise] = useState('');
  
  const [caloriesIn, setCaloriesIn] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleAICalculate = async () => {
    if (!breakfast && !lunch && !dinner && !exercise) {
      Alert.alert('提示', '请至少填写一项饮食或运动信息');
      return;
    }
    setCalculating(true);
    try {
      const result = await calculateCalories({
        breakfast_content: breakfast,
        lunch_content: lunch,
        dinner_content: dinner,
        exercise_content: exercise
      });
      setCaloriesIn(result.total_calories_in.toString());
      setCaloriesBurned(result.total_calories_burned.toString());
      Alert.alert('AI计算完成', result.breakdown);
    } catch (error) {
      Alert.alert('错误', 'AI计算失败');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCheckIn({
        date,
        breakfast_content: breakfast,
        lunch_content: lunch,
        dinner_content: dinner,
        exercise_content: exercise,
        total_calories_in: parseInt(caloriesIn) || 0,
        total_calories_burned: parseInt(caloriesBurned) || 0
      });
      Alert.alert('成功', '打卡成功');
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '打卡失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{date} 打卡</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={styles.saveText}>保存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>饮食记录</Text>
            <TextInput style={styles.input} placeholder="早餐吃了什么？" value={breakfast} onChangeText={setBreakfast} multiline />
            <TextInput style={styles.input} placeholder="午餐吃了什么？" value={lunch} onChangeText={setLunch} multiline />
            <TextInput style={styles.input} placeholder="晚餐吃了什么？" value={dinner} onChangeText={setDinner} multiline />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>运动记录</Text>
            <TextInput style={styles.input} placeholder="做了什么运动？多久？" value={exercise} onChangeText={setExercise} multiline />
          </View>

          <View style={styles.aiSection}>
            <TouchableOpacity style={styles.aiButton} onPress={handleAICalculate} disabled={calculating}>
              <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.aiButtonText}>{calculating ? 'AI计算中...' : '不知道热量？点我AI计算'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>摄入热量 (kcal)</Text>
              <TextInput style={styles.numberInput} value={caloriesIn} onChangeText={setCaloriesIn} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>消耗热量 (kcal)</Text>
              <TextInput style={styles.numberInput} value={caloriesBurned} onChangeText={setCaloriesBurned} keyboardType="numeric" placeholder="0" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  title: { fontSize: 18, fontWeight: 'bold' },
  saveText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { backgroundColor: '#F7F8FA', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14, minHeight: 40 },
  aiSection: { marginBottom: 24 },
  aiButton: { backgroundColor: theme.colors.secondary, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  aiButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  numberInput: { backgroundColor: '#F7F8FA', padding: 12, borderRadius: 8, fontSize: 16, textAlign: 'center', fontWeight: 'bold' }
});

export default HealthCheckInScreen;
