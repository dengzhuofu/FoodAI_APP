import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { useTranslation } from 'react-i18next';

type AIKitchenScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = 16;
// 2 columns
const CARD_WIDTH = (width - SPACING * 3) / 2;

const AIKitchenScreen = () => {
  const navigation = useNavigation<AIKitchenScreenNavigationProp>();
  const { t } = useTranslation();

  const FEATURES = [
    { 
      name: t('kitchen.featureImageToRecipe'), 
      desc: t('kitchen.featureImageToRecipeDesc'), 
      route: 'ImageToRecipe', 
      icon: 'camera', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: t('kitchen.featureImageToCalorie'), 
      desc: t('kitchen.featureImageToCalorieDesc'), 
      route: 'ImageToCalorie', 
      icon: 'flame', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: t('kitchen.featureTextToImage'), 
      desc: t('kitchen.featureTextToImageDesc'), 
      route: 'TextToImage', 
      icon: 'brush', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: t('kitchen.featureTextToRecipe'), 
      desc: t('kitchen.featureTextToRecipeDesc'), 
      route: 'TextToRecipe', 
      icon: 'restaurant', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: t('kitchen.featureFridgeToRecipe'), 
      desc: t('kitchen.featureFridgeToRecipeDesc'), 
      route: 'FridgeToRecipe', 
      icon: 'ice-cream', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: '膳食计划', 
      desc: '定制专属膳食计划', 
      route: 'MealPlan', 
      icon: 'calendar', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: t('kitchen.featureVoiceAssistant'), 
      desc: t('kitchen.featureVoiceAssistantDesc'), 
      route: 'VoiceAssistant', 
      icon: 'mic', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
    { 
      name: '麦当劳助手', 
      desc: '活动、优惠券查询', 
      route: 'McDonaldsAssistant', 
      icon: 'fast-food', 
      color: '#1A1A1A',
      bg: '#FFFFFF',
      border: '#E0E0E0'
    },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>{t('kitchen.subtitle')}</Text>
              <Text style={styles.headerTitle}>{t('kitchen.title')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={styles.avatar}
                onPress={() => navigation.navigate('AIGenerationHistory')}
              >
                 <Ionicons name="time-outline" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatar}>
                 <Ionicons name="person" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Hero Card - My Kitchen (Black Card) */}
          <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => navigation.navigate('MyKitchen')}
            activeOpacity={0.9}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroIconBox}>
                <Ionicons name="cube" size={24} color="white" />
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{t('kitchen.running')}</Text>
              </View>
            </View>
            
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{t('kitchen.myFridge')}</Text>
              <Text style={styles.heroDesc}>
                {t('kitchen.myFridgeDesc')}
              </Text>
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroLink}>{t('kitchen.manage')}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </View>

            {/* Geometric Decoration */}
            <View style={styles.geoCircle} />
            <View style={styles.geoLine} />
          </TouchableOpacity>

          {/* Section Divider */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('kitchen.features')}</Text>
            <View style={styles.sectionLine} />
          </View>

          {/* Bento Grid */}
          <View style={styles.grid}>
            {FEATURES.map((feature, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.gridCard}
                onPress={() => navigation.navigate(feature.route as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name={feature.icon as any} size={24} color="#1A1A1A" />
                  </View>
                  <Ionicons name="arrow-forward-circle-outline" size={24} color="#E0E0E0" />
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTitle}>{feature.name}</Text>
                  <Text style={styles.cardDesc}>{feature.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  heroCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    minHeight: 160,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
  heroContent: {
    zIndex: 2,
    marginTop: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    zIndex: 2,
  },
  heroLink: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginRight: 6,
  },
  geoCircle: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 24,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  geoLine: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 32,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: SPACING,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    minHeight: 130,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});

export default AIKitchenScreen;
