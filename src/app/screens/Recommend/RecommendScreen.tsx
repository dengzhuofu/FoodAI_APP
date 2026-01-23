import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecommendations, getHealthNews, HealthNews, FeedItem } from '../../../api/explore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.md * 1.3) / 2; // Reduced side padding to theme.spacing.md


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
          <Text style={theme.typography.caption}>👋 早上好</Text>
          <Text style={theme.typography.h2}>今天想吃点什么？</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Explore')}
      >
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.searchText}>搜索食谱、食材或餐厅...</Text>
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
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.whatToEatGradient}
      >
        <View>
          <Text style={styles.whatToEatTitle}>今天吃什么？</Text>
          <Text style={styles.whatToEatSubtitle}>转动轮盘，拯救选择困难症</Text>
        </View>
        <View style={styles.rouletteIcon}>
          <Text style={{ fontSize: 32 }}>🎡</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={['#FF9A9E', '#FECFEF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>
            {banners.length > 0 ? banners[0].title : '健康饮食新趋势'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {banners.length > 0 ? banners[0].summary : '探索更多营养搭配'}
          </Text>
          <TouchableOpacity style={styles.bannerButton} onPress={() => {
            // Optional: navigate to details
          }}>
            <Text style={styles.bannerButtonText}>查看详情</Text>
          </TouchableOpacity>
        </View>
        <Image 
          source={{ uri: banners.length > 0 ? banners[0].image : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500' }} 
          style={styles.bannerImage} 
        />
      </LinearGradient>
    </View>
  );

  const renderFeed = () => {
    // Merge recipes and restaurants for the feed, or display them separately
    // For now, let's display recipes in a masonry layout
    // We can simply alternate columns
    
    return (
      <View style={styles.feedContainer}>
        <Text style={[theme.typography.h3, styles.sectionTitle]}>为你精选</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {recipes.filter((_, i) => i % 2 === 0).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.feedCard}
                  onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={[styles.feedImage, { height: 200 }]} // Fixed height for now, or dynamic if available
                    resizeMode="cover"
                  />
                  <View style={styles.feedContent}>
                    <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.feedFooter}>
                      <View style={styles.authorInfo}>
                        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.smallAvatar} />
                        <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                      </View>
                      <View style={styles.likeInfo}>
                        <Ionicons name="heart-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.likeCount}>{item.likes}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.column}>
              {recipes.filter((_, i) => i % 2 === 1).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.feedCard}
                  onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={[styles.feedImage, { height: 220 }]} 
                    resizeMode="cover"
                  />
                  <View style={styles.feedContent}>
                    <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.feedFooter}>
                      <View style={styles.authorInfo}>
                        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.smallAvatar} />
                        <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                      </View>
                      <View style={styles.likeInfo}>
                        <Ionicons name="heart-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.likeCount}>{item.likes}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {renderHeader()}
        {renderWhatToEat()}
        {renderBanner()}
        {renderFeed()}
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
    paddingHorizontal: theme.spacing.p10,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    ...theme.shadows.sm,
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.p10,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
  },
  whatToEatButtonContainer: {
    marginHorizontal: theme.spacing.p10,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
    borderRadius: theme.borderRadius.lg,
  },
  whatToEatGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  whatToEatTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: 4,
  },
  whatToEatSubtitle: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  rouletteIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  bannerContainer: {
    paddingHorizontal: theme.spacing.p10,
    marginBottom: theme.spacing.lg,
  },
  banner: {
    height: 140,
    backgroundColor: '#FFEAA7',
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  bannerContent: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.p10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  bannerTagText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bannerButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.p10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bannerButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  feedContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    fontSize: 18,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  feedCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 5,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  feedImage: {
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  feedContent: {
    padding: 8,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  authorName: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
});


export default RecommendScreen;
