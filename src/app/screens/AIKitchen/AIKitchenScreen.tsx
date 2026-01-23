import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type AIKitchenScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const features = [
  { name: '拍照识别', desc: '图 → 菜谱', route: 'ImageToRecipe', icon: 'camera', color: ['#FF9A9E', '#FECFEF'] },
  { name: '热量计算', desc: '图 → 卡路里', route: 'ImageToCalorie', icon: 'flame', color: ['#FFECD2', '#FCB69F'] },
  { name: '美食绘图', desc: '文 → 图', route: 'TextToImage', icon: 'brush', color: ['#A18CD1', '#FBC2EB'] },
  { name: '定制菜谱', desc: '文 → 菜谱', route: 'TextToRecipe', icon: 'document-text', color: ['#84FAB0', '#8FD3F4'] },
  { name: '冰箱管家', desc: '冰箱 → 菜谱', route: 'FridgeToRecipe', icon: 'ice-cream', color: ['#E0C3FC', '#8EC5FC'] },
  { name: '语音助手', desc: '实时指导', route: 'VoiceAssistant', icon: 'mic', color: ['#43E97B', '#38F9D7'] },
] as const;

const AIKitchenScreen = () => {
  const navigation = useNavigation<AIKitchenScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={theme.typography.h1}>AI 厨房</Text>
          <Text style={theme.typography.body}>智能烹饪助手，让下厨更简单</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.myKitchenButtonContainer}
          onPress={() => navigation.navigate('MyKitchen')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.myKitchenButton}
          >
            <View style={styles.myKitchenContent}>
              <View>
                <Text style={styles.myKitchenTitle}>我的冰箱</Text>
                <Text style={styles.myKitchenSubtitle}>管理库存，智能推荐</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[theme.typography.h3, styles.sectionTitle]}>AI 功能实验室</Text>

        <View style={styles.grid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => navigation.navigate(feature.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.color as any}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={feature.icon as any} size={28} color="white" />
                </View>
                <Text style={styles.cardName}>{feature.name}</Text>
                <Text style={styles.cardDesc}>{feature.desc}</Text>
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
  myKitchenButtonContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
    borderRadius: theme.borderRadius.lg,
  },
  myKitchenButton: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  myKitchenContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myKitchenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  myKitchenSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    aspectRatio: 1,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  cardGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
});

export default AIKitchenScreen;
