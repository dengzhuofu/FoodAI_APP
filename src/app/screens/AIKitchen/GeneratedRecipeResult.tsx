import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { RootStackParamList } from '../../navigation/types';

type GeneratedRecipeResultRouteProp = RouteProp<RootStackParamList, 'GeneratedRecipeResult'>;

const { width } = Dimensions.get('window');

const GeneratedRecipeResult = () => {
  const navigation = useNavigation();
  const route = useRoute<GeneratedRecipeResultRouteProp>();
  const { recipe } = route.params;
  
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');

  const renderHeader = () => (
    <View style={styles.imageContainer}>
      {/* Use a placeholder image or generated image if available */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} 
        style={styles.heroImage} 
        resizeMode="cover" 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <TouchableOpacity 
        style={styles.backButtonAbsolute} 
        onPress={() => navigation.goBack()}
      >
        <View style={styles.blurButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <View style={styles.tagContainer}>
          {recipe.difficulty && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{recipe.difficulty}</Text>
            </View>
          )}
          {recipe.cooking_time && (
            <View style={[styles.tag, styles.timeTag]}>
              <Ionicons name="time-outline" size={12} color="#FFF" />
              <Text style={styles.tagText}>{recipe.cooking_time}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.authorRow}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#FFF" />
            <Text style={styles.aiBadgeText}>AI生成</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNutrition = () => {
    if (!recipe.nutrition) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>营养成分</Text>
        <View style={styles.nutritionGrid}>
          <View style={[styles.nutritionItem, { backgroundColor: '#FFF5E6' }]}>
            <Text style={[styles.nutritionValue, { color: '#FF9F43' }]}>{recipe.nutrition.calories || '-'}</Text>
            <Text style={styles.nutritionLabel}>热量(卡)</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.nutritionValue, { color: '#2ECC71' }]}>{recipe.nutrition.protein || '-'}</Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.nutritionValue, { color: '#3498DB' }]}>{recipe.nutrition.fat || '-'}</Text>
            <Text style={styles.nutritionLabel}>脂肪</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.nutritionValue, { color: '#9B59B6' }]}>{recipe.nutrition.carbs || '-'}</Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
        onPress={() => setActiveTab('ingredients')}
      >
        <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>所需食材</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
        onPress={() => setActiveTab('steps')}
      >
        <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>制作步骤</Text>
      </TouchableOpacity>
    </View>
  );

  const renderIngredients = () => (
    <View style={styles.listContainer}>
      {recipe.ingredients.map((item, index) => (
        <View key={index} style={styles.ingredientItem}>
          <Text style={styles.ingredientText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderSteps = () => (
    <View style={styles.listContainer}>
      {recipe.steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={styles.content}>
          <Text style={styles.description}>{recipe.description}</Text>
          {renderNutrition()}
          <View style={styles.section}>
            {renderTabs()}
            {activeTab === 'ingredients' ? renderIngredients() : renderSteps()}
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert('提示', '保存功能开发中')}>
             <Text style={styles.saveButtonText}>保存菜谱</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  timeTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
    marginTop: -20,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  nutritionItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 12,
  },
  ingredientItem: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ingredientText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    ...theme.shadows.sm,
  },
  stepText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GeneratedRecipeResult;
