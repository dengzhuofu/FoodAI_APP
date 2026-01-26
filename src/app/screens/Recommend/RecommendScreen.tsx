import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecommendations, getHealthNews, HealthNews, FeedItem } from '../../../api/explore';
import { BlurView } from 'expo-blur';
import FeedCard from '../../components/FeedCard';


type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
// 计算列宽，考虑间距
const SPACING = theme.spacing.sm;
const COLUMN_WIDTH = (width - theme.spacing.screenHorizontal * 2 - SPACING) / 2;

const RecommendScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [recipes, setRecipes] = useState<FeedItem[]>([]);
  const [banners, setBanners] = useState<HealthNews[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [recData, newsData] = await Promise.all([
        getRecommendations(),
        getHealthNews()
      ]);
      setRecipes(recData);
      setBanners(newsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greetingText}>早安，美食家 ☀️</Text>
          <Text style={styles.titleText}>今天想探索什么美味？</Text>
        </View>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60' }} 
            style={styles.avatar} 
          />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.9}
      >
        <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.searchText}>搜索菜谱、食材或餐厅...</Text>
        <View style={styles.searchIconContainer}>
          <Ionicons name="options-outline" size={16} color={theme.colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderWhatToEat = () => (
    <TouchableOpacity 
      style={styles.whatToEatButtonContainer}
      onPress={() => navigation.navigate('WhatToEat')}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.colors.primary, '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.whatToEatGradient}
      >
        <View style={styles.whatToEatContent}>
          <View style={styles.whatToEatBadge}>
            <Text style={styles.whatToEatBadgeText}>✨ 拯救选择困难</Text>
          </View>
          <Text style={styles.whatToEatTitle}>今天吃什么？</Text>
          <Text style={styles.whatToEatSubtitle}>转动幸运轮盘，发现今日灵感</Text>
        </View>
        <View style={styles.rouletteIconContainer}>
          <Text style={{ fontSize: 40 }}>🎡</Text>
        </View>
        
        {/* 装饰性圆圈 */}
        <View style={[styles.decorativeCircle, { top: -20, right: -20, width: 80, height: 80 }]} />
        <View style={[styles.decorativeCircle, { bottom: -30, left: 40, width: 60, height: 60, opacity: 0.1 }]} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBanner = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>健康趋势</Text>
        <TouchableOpacity>
          <Text style={styles.seeMoreText}>查看全部</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#FFF0F0', '#FFE4E4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>本周热门</Text>
            </View>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {banners.length > 0 ? banners[0].title : '轻食主义：如何搭配营养均衡的早餐'}
            </Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => {
              // Placeholder for banner navigation
              console.log('Navigate to banner details');
            }}>
              <Text style={styles.bannerButtonText}>阅读文章</Text>
              <Ionicons name="arrow-forward" size={12} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: banners.length > 0 ? banners[0].image : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500' }} 
            style={styles.bannerImage} 
          />
        </LinearGradient>
      </View>
    </View>
  );

  const renderFeedItem = (item: FeedItem, index: number) => {
    // 随机高度，模拟真实瀑布流效果 (在实际项目中应由后端返回宽高比)
    // 这里简单根据 ID 或 index 决定一些变化
    const isRestaurant = item.type === 'restaurant';
    const randomHeight = 180 + (item.id % 5) * 30; // 180, 210, 240, 270, 300
    
    return (
      <FeedCard 
        key={item.id}
        item={item}
        height={randomHeight}
        onPress={() => navigation.navigate(isRestaurant ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
      />
    );
  };

  const renderFeed = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>为你推荐</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {recipes.filter((_, i) => i % 2 === 0).map((item, index) => renderFeedItem(item, index))}
            </View>
            <View style={styles.column}>
              {recipes.filter((_, i) => i % 2 === 1).map((item, index) => renderFeedItem(item, index))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]} 
              tintColor={theme.colors.primary}
            />
          }
        >
          {renderHeader()}
          {renderWhatToEat()}
          {renderBanner()}
          {renderFeed()}
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
    paddingBottom: 100,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greetingText: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  titleText: {
    ...theme.typography.h1,
    fontSize: 26,
    color: theme.colors.text,
  },
  avatarContainer: {
    position: 'relative',
    ...theme.shadows.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  searchText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  searchIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // What to Eat
  whatToEatButtonContainer: {
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.primaryGlow,
    borderRadius: theme.borderRadius.lg,
  },
  whatToEatGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  whatToEatContent: {
    flex: 1,
    zIndex: 1,
  },
  whatToEatBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  whatToEatBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  whatToEatTitle: {
    ...theme.typography.h2,
    color: '#FFF',
    marginBottom: 4,
    fontSize: 22,
  },
  whatToEatSubtitle: {
    ...theme.typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
  },
  rouletteIconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    marginLeft: 16,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  // Section Shared
  sectionContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  seeMoreText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Banner
  bannerContainer: {
    ...theme.shadows.md,
    borderRadius: theme.borderRadius.lg,
  },
  banner: {
    height: 150,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#FFF0F0',
  },
  bannerContent: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  bannerImage: {
    width: '45%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  
  // Feed
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
});

export default RecommendScreen;
