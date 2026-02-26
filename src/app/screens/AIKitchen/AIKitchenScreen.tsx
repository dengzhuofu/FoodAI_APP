import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

type AIKitchenScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = 16;

const AIKitchenScreen = () => {
  const navigation = useNavigation<AIKitchenScreenNavigationProp>();
  const { t } = useTranslation();

  // Helper to render a feature card
  const renderCard = (
    title: string, 
    desc: string, 
    icon: string, 
    route: keyof RootStackParamList, 
    style: any = {}, 
    iconColor: string = '#1A1A1A'
  ) => (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={() => navigation.navigate(route as any)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
        <Ionicons name="arrow-forward" size={18} color="#E0E0E0" />
      </View>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );

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
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => navigation.navigate('AIGenerationHistory')}
            >
               <Ionicons name="time-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
          
          {/* Hero Section: My Kitchen */}
          <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => navigation.navigate('MyKitchen')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#00C896', '#00A880']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{t('kitchen.running')}</Text>
                </View>
                <Text style={styles.heroTitle}>{t('kitchen.myFridge')}</Text>
                <Text style={styles.heroDesc}>{t('kitchen.myFridgeDesc')}</Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
            <View style={styles.heroFooter}>
              <Text style={styles.heroLink}>{t('kitchen.manage')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Voice Assistant - Full Width Banner */}
          <TouchableOpacity 
            style={styles.voiceBanner}
            onPress={() => navigation.navigate('VoiceAssistant')}
            activeOpacity={0.9}
          >
            <View style={styles.voiceContent}>
              <View style={styles.voiceIconContainer}>
                <Ionicons name="mic" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceTitle}>{t('kitchen.featureVoiceAssistant')}</Text>
                <Text style={styles.voiceDesc}>{t('kitchen.featureVoiceAssistantDesc')}</Text>
              </View>
              <View style={styles.voiceAction}>
                <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Bento Grid Layout */}
          <Text style={styles.sectionTitle}>VISUAL INTELLIGENCE</Text>
          <View style={styles.bentoRow}>
            {/* Left: Large Vertical Card */}
            <TouchableOpacity 
              style={[styles.card, styles.largeCard]}
              onPress={() => navigation.navigate('ImageToRecipe')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                  <Ionicons name="camera" size={28} color="#00C896" />
                </View>
                <View style={styles.badgeHot}>
                  <Text style={styles.badgeText}>HOT</Text>
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={styles.largeCardTitle}>{t('kitchen.featureImageToRecipe')}</Text>
                <Text style={styles.cardDesc}>{t('kitchen.featureImageToRecipeDesc')}</Text>
              </View>
              <Ionicons name="scan-outline" size={80} color="#F5F5F5" style={styles.bgIcon} />
            </TouchableOpacity>

            {/* Right: Stack of 2 smaller cards */}
            <View style={styles.columnStack}>
              {renderCard(
                t('kitchen.featureImageToCalorie'), 
                t('kitchen.featureImageToCalorieDesc'), 
                'flame', 
                'ImageToCalorie',
                { flex: 1, marginBottom: SPACING },
                '#FF6B6B'
              )}
              {renderCard(
                t('kitchen.featureTextToImage'), 
                t('kitchen.featureTextToImageDesc'), 
                'brush', 
                'TextToImage',
                { flex: 1 },
                '#4D96FF'
              )}
            </View>
          </View>

          {/* Creation & Planning Section - Redesigned to be asymmetric */}
          <Text style={styles.sectionTitle}>CREATION & PLANNING</Text>
          <View style={styles.bentoRow}>
             {/* Left: Stack of 2 smaller cards */}
             <View style={[styles.columnStack, { marginLeft: 0, marginRight: SPACING }]}>
              {renderCard(
                t('kitchen.featureFridgeToRecipe'), 
                t('kitchen.featureFridgeToRecipeDesc'), 
                'ice-cream', 
                'FridgeToRecipe',
                { flex: 1, marginBottom: SPACING },
                '#54A0FF'
              )}
              {renderCard(
                '膳食计划', 
                '定制专属膳食计划', 
                'calendar', 
                'MealPlan',
                { flex: 1 },
                '#1DD1A1'
              )}
            </View>

            {/* Right: Large Vertical Card */}
            <TouchableOpacity 
              style={[styles.card, styles.largeCard]}
              onPress={() => navigation.navigate('TextToRecipe')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFF0E0' }]}>
                  <Ionicons name="restaurant" size={28} color="#FF9F43" />
                </View>
                <View style={[styles.badgeHot, { backgroundColor: '#FF9F43' }]}>
                  <Text style={styles.badgeText}>PRO</Text>
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={styles.largeCardTitle}>{t('kitchen.featureTextToRecipe')}</Text>
                <Text style={styles.cardDesc}>{t('kitchen.featureTextToRecipeDesc')}</Text>
              </View>
              <Ionicons name="book-outline" size={80} color="#FFF0E0" style={styles.bgIcon} />
            </TouchableOpacity>
          </View>

          {/* 3D Fridge */}
          <TouchableOpacity 
             style={[styles.card, styles.wideCard]}
             onPress={() => navigation.navigate('Fridge3D')}
             activeOpacity={0.8}
          >
             <View style={styles.wideCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#E0F7F1' }]}>
                  <Ionicons name="cube" size={24} color="#00C896" />
                </View>
                <View style={styles.wideCardText}>
                  <Text style={styles.cardTitle}>3D 冰箱</Text>
                  <Text style={styles.cardDesc}>旋转/缩放/开门/点选食材</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#E0E0E0" />
             </View>
          </TouchableOpacity>

          {/* Bottom Full Width Card */}
          <TouchableOpacity 
             style={[styles.card, styles.wideCard]}
             onPress={() => navigation.navigate('McDonaldsAssistant')}
             activeOpacity={0.8}
          >
             <View style={styles.wideCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFF9C4' }]}>
                  <Ionicons name="fast-food" size={24} color="#FFC312" />
                </View>
                <View style={styles.wideCardText}>
                  <Text style={styles.cardTitle}>麦当劳助手</Text>
                  <Text style={styles.cardDesc}>活动、优惠券查询</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#E0E0E0" />
             </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C896',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Hero Card
  heroCard: {
    borderRadius: 24,
    minHeight: 150,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 24,
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBFF00',
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  heroIcon: {
    opacity: 0.9,
    transform: [{ rotate: '-10deg' }]
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  // Voice Banner
  voiceBanner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  voiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  voiceDesc: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  voiceAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00C896', // Accent Color
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  badgeHot: {
    backgroundColor: '#EBFF00', // Neon Yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ skewX: '-10deg' }],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  // Bento Layout
  bentoRow: {
    flexDirection: 'row',
    height: 220,
    marginBottom: 20,
  },
  columnStack: {
    flex: 1,
    marginLeft: SPACING,
  },
  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'space-between',
  },
  largeCard: {
    flex: 1,
    overflow: 'hidden',
  },
  wideCard: {
    width: '100%',
    padding: 16,
    height: 80,
    justifyContent: 'center',
    marginTop: 12,
  },
  wideCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wideCardText: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  largeCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cardDesc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
  },
  bgIcon: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    opacity: 0.15,
    zIndex: -1,
  },
});

export default AIKitchenScreen;
