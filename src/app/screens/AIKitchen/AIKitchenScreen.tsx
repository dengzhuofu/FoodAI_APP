import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { BlurView } from 'expo-blur';

type AIKitchenScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = theme.spacing.md;
const CARD_WIDTH = (width - theme.spacing.lg * 2 - SPACING) / 2;

const features = [
  { 
    name: '拍照识别', 
    desc: '图 → 菜谱', 
    route: 'ImageToRecipe', 
    icon: 'camera', 
    colors: ['#FF9A9E', '#FECFEF'],
    bgPattern: 'rgba(255, 255, 255, 0.15)' 
  },
  { 
    name: '热量计算', 
    desc: '图 → 卡路里', 
    route: 'ImageToCalorie', 
    icon: 'flame', 
    colors: ['#FFECD2', '#FCB69F'],
    bgPattern: 'rgba(255, 255, 255, 0.15)'
  },
  { 
    name: '美食绘图', 
    desc: '文 → 图', 
    route: 'TextToImage', 
    icon: 'brush', 
    colors: ['#A18CD1', '#FBC2EB'],
    bgPattern: 'rgba(255, 255, 255, 0.15)'
  },
  { 
    name: '定制菜谱', 
    desc: '文 → 菜谱', 
    route: 'TextToRecipe', 
    icon: 'document-text', 
    colors: ['#84FAB0', '#8FD3F4'],
    bgPattern: 'rgba(255, 255, 255, 0.15)'
  },
  { 
    name: '冰箱管家', 
    desc: '冰箱 → 菜谱', 
    route: 'FridgeToRecipe', 
    icon: 'ice-cream', 
    colors: ['#E0C3FC', '#8EC5FC'],
    bgPattern: 'rgba(255, 255, 255, 0.15)'
  },
  { 
    name: '语音助手', 
    desc: '实时指导', 
    route: 'VoiceAssistant', 
    icon: 'mic', 
    colors: ['#43E97B', '#38F9D7'],
    bgPattern: 'rgba(255, 255, 255, 0.15)'
  },
] as const;

const AIKitchenScreen = () => {
  const navigation = useNavigation<AIKitchenScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 厨房</Text>
          <Text style={styles.headerSubtitle}>智能烹饪助手，让下厨更简单</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.myKitchenButtonContainer}
          onPress={() => navigation.navigate('MyKitchen')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#30cfd0', '#330867']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.myKitchenButton}
          >
            <View style={styles.myKitchenContent}>
              <View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>智能管理</Text>
                </View>
                <Text style={styles.myKitchenTitle}>我的冰箱</Text>
                <Text style={styles.myKitchenSubtitle}>库存管理 · 智能推荐 · 过期提醒</Text>
              </View>
              <View style={styles.arrowIconContainer}>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </View>
            </View>
            
            {/* Decorative background elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI 功能实验室</Text>
          <View style={styles.labBadge}>
            <Text style={styles.labBadgeText}>Beta</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => navigation.navigate(feature.route as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={feature.colors as any}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={feature.icon as any} size={24} color="white" />
                  </View>
                  <Ionicons name="arrow-forward-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardName}>{feature.name}</Text>
                  <Text style={styles.cardDesc}>{feature.desc}</Text>
                </View>

                {/* Texture overlay */}
                <View style={[styles.textureOverlay, { backgroundColor: feature.bgPattern }]} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  myKitchenButtonContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
    borderRadius: theme.borderRadius.xl,
  },
  myKitchenButton: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  myKitchenContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  myKitchenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  myKitchenSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  arrowIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    marginRight: 8,
  },
  labBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1, // Slightly taller
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    zIndex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  textureOverlay: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.2,
  },
});

export default AIKitchenScreen;
