import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { generateMealPlan, MealPlanResult, getHistory, AILog } from '../../../../api/ai';
import AIGeneratingModal from '../../../components/AIGeneratingModal';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../styles/theme';

const MealPlanFeature = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealPlanResult | null>(null);
  
  // History State
  const [history, setHistory] = useState<AILog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form State
  const [restrictions, setRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');
  const [headcount, setHeadcount] = useState('1');
  const [days, setDays] = useState('7');
  const [goal, setGoal] = useState('健康饮食');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(5, 0, 'meal-plan');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!days || !headcount) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const data = await generateMealPlan({
        dietary_restrictions: restrictions,
        preferences: preferences,
        notes: notes,
        headcount: parseInt(headcount),
        duration_days: parseInt(days),
        goal: goal
      });
      setResult(data);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error(error);
      Alert.alert('生成失败', 'AI服务暂时无法响应，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (item: AILog) => {
    if (item.output_result) {
      setResult(item.output_result);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHero}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultHeroGradient}
          />
          <View style={styles.resultHeroContent}>
            <View style={styles.resultBadge}>
              <Ionicons name="sparkles" size={14} color={theme.colors.text} />
              <Text style={styles.resultBadgeText}>AI PLAN</Text>
            </View>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultOverview}>{result.overview}</Text>
          </View>
        </View>
        
        {result.daily_plans.map((dayPlan, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayHeaderLeft}>
                <View style={styles.dayDecor} />
                <View>
                  <Text style={styles.dayKicker}>DAY {dayPlan.day}</Text>
                  <Text style={styles.dayTitle}>今日菜单</Text>
                </View>
              </View>
              <View style={styles.dayCaloriesPill}>
                <Ionicons name="flash" size={14} color={theme.colors.secondary} />
                <Text style={styles.dayCalories}>{dayPlan.total_calories} kcal</Text>
              </View>
            </View>
            {dayPlan.meals.map((meal, mIndex) => (
              <View key={mIndex} style={styles.mealCard}>
                <View style={styles.mealLeft}>
                  <View style={styles.mealTypeTag}>
                    <Text style={styles.mealTypeText}>{meal.type}</Text>
                  </View>
                  <View style={styles.mealIndexBubble}>
                    <Text style={styles.mealIndexText}>{mIndex + 1}</Text>
                  </View>
                </View>

                <View style={styles.mealMain}>
                  <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>
                  <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                </View>

                <View style={styles.mealRight}>
                  <View style={styles.mealCaloriesChip}>
                    <Text style={styles.mealCalories}>{meal.calories}</Text>
                    <Text style={styles.mealCaloriesUnit}>kcal</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </View>
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity 
          style={styles.closeBtn}
          onPress={() => setResult(null)}
        >
          <Text style={styles.closeBtnText}>返回继续生成</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (result) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setResult(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>您的膳食计划</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {renderResult()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>膳食计划推荐</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>忌口 / 限制</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：不吃香菜、海鲜过敏..."
              placeholderTextColor={theme.colors.textTertiary}
              value={restrictions}
              onChangeText={setRestrictions}
              selectionColor={theme.colors.primary}
            />

            <Text style={styles.label}>口味 / 喜好</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：喜欢川菜、低脂..."
              placeholderTextColor={theme.colors.textTertiary}
              value={preferences}
              onChangeText={setPreferences}
              selectionColor={theme.colors.primary}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>用餐人数</Text>
                <TextInput
                  style={styles.input}
                  value={headcount}
                  onChangeText={setHeadcount}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                  selectionColor={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>周期 (天)</Text>
                <TextInput
                  style={styles.input}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                  selectionColor={theme.colors.primary}
                />
              </View>
            </View>

            <Text style={styles.label}>目标</Text>
            <View style={styles.tagsContainer}>
              {['健康饮食', '减脂', '增肌', '低碳水'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tag, goal === item && styles.tagActive]}
                  onPress={() => setGoal(item)}
                >
                  <Text style={[styles.tagText, goal === item && styles.tagTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>额外备注 (可选)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="例如：周三中午需要在公司吃便当，晚餐想吃鱼..."
              placeholderTextColor={theme.colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              selectionColor={theme.colors.primary}
            />

            <TouchableOpacity 
              style={[styles.generateButton, loading && styles.buttonDisabled]} 
              onPress={handleGenerate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>生成计划</Text>
            </TouchableOpacity>
          </View>

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>历史记录</Text>
            {loadingHistory ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : history.length > 0 ? (
              <View style={styles.historyList}>
                {history.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyItem}
                    onPress={() => handleHistoryPress(item)}
                  >
                    <View style={styles.historyIcon}>
                       <Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.output_result?.title || item.input_summary || '未命名计划'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHistoryText}>暂无历史记录</Text>
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
      <AIGeneratingModal visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screenHorizontal,
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
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  content: {
    padding: theme.spacing.screenHorizontal,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 16,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 0,
  },
  tag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagActive: {
    backgroundColor: 'rgba(0,200,150,0.12)',
    borderColor: theme.colors.primary,
  },
  tagText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  tagTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...theme.shadows.primaryGlow,
  },
  buttonText: {
    color: theme.colors.textInvert,
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Result Styles
  resultContainer: {
    paddingBottom: 40,
  },
  resultHero: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.22)',
    ...theme.shadows.primaryGlow,
    marginBottom: 16,
  },
  resultHeroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  resultHeroContent: {
    padding: 18,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  resultBadgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textInvert,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  resultOverview: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 0,
    lineHeight: 22,
  },
  dayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayDecor: {
    width: 5,
    height: 28,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    transform: [{ skewX: '-10deg' }],
  },
  dayKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.primary,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  dayCaloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(235,255,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  dayCalories: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textInvert,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  mealLeft: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mealIndexBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  mealMain: {
    flex: 1,
    justifyContent: 'center',
  },
  mealRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mealCaloriesChip: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
    lineHeight: 16,
  },
  mealCaloriesUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textTertiary,
  },
  mealTypeTag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18,18,18,0.14)',
  },
  closeBtn: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  closeBtnText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  // History Styles
  historySection: {
    marginTop: 32,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
  },
});

export default MealPlanFeature;
