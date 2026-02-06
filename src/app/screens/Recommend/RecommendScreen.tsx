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
import { getDailyRecommendation, Recipe } from '../../../api/content';
import { getCheckIns, CheckIn } from '../../../api/health';
import FeedCard from '../../components/FeedCard';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../../store/useUserStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = 12;
const COLUMN_WIDTH = (width - 30 - SPACING) / 2;

const RecommendScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const user = useUserStore(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [recipes, setRecipes] = useState<FeedItem[]>([]);
  const [banners, setBanners] = useState<HealthNews[]>([]);
  const [dailyRecs, setDailyRecs] = useState<Recipe[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = async (pageNum: number = 1, shouldRefresh: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const [recData, newsData] = await Promise.all([
        getRecommendations(pageNum, 10),
        pageNum === 1 ? getHealthNews() : Promise.resolve([])
      ]);
      
      let items: FeedItem[] = [];
      let pagination = { page: 1, limit: 10, total: 0 };

      if (Array.isArray(recData)) {
        // Fallback for old API response (array)
        items = recData;
        pagination.total = 100; // Mock total to allow scrolling if unknown
      } else if (recData?.items) {
        // New API response (object with items & pagination)
        items = recData.items;
        pagination = recData.pagination;
      }

      if (shouldRefresh || pageNum === 1) {
        setRecipes(items);
        if (pageNum === 1) {
          setBanners(newsData);
          getDailyRecommendation().then(setDailyRecs).catch(console.error);
        }
      } else {
        setRecipes(prev => [...prev, ...items]);
      }
      
      setHasMore(items.length > 0 && pagination.page * pagination.limit < pagination.total);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch data", error);
      // Reset loading states on error to prevent UI freeze
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Only fetch if empty (initial load) to avoid resetting scroll position on back nav
      if (recipes.length === 0) {
        fetchData(1);
      }
      getCheckIns().then(setCheckIns).catch(console.error);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRecipes([]);
    setHasMore(true);
    fetchData(1, true).finally(() => setRefreshing(false));
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    fetchData(page + 1);
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>JAN 26</Text>
        </View>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => (navigation as any).navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60' }} 
            style={styles.avatar} 
          />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.greetingText}>{t('home.greeting')} {user?.nickname}</Text>
        <Text style={styles.titleText}>{t('home.readyToCook')}</Text>
      </View>

      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.9}
      >
        <Ionicons name="search" size={20} color="#1A1A1A" />
        <Text style={styles.searchText}>{t('home.searchPlaceholder')}</Text>
        <View style={styles.searchButton}>
           <Ionicons name="arrow-forward" size={16} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderDiscipline = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>今天你自律了吗？</Text>
        <View style={styles.disciplineCard}>
          <View style={styles.calendarRow}>
            {days.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0];
              const checkIn = checkIns.find(c => c.date === dateStr);
              
              let dotColor = '#EEE'; // Default empty
              if (checkIn) {
                if (checkIn.status === 'white') dotColor = '#FFF'; 
                else if (checkIn.status === 'orange') dotColor = '#FFA502';
                else if (checkIn.status === 'red') dotColor = '#FF4757';
              }
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dayItem}
                  onPress={() => navigation.navigate('HealthCheckIn', { date: dateStr })}
                >
                  <Text style={[styles.dayText, { color: '#FFF' }]}>{day.getDate()}</Text>
                  <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity 
            style={styles.checkInButton}
            onPress={() => navigation.navigate('HealthCheckIn', { date: today.toISOString().split('T')[0] })}
          >
            <Text style={styles.checkInButtonText}>立即打卡</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWhatToEat = () => (
    <TouchableOpacity 
      style={styles.whatToEatButtonContainer}
      onPress={() => navigation.navigate('WhatToEat')}
      activeOpacity={0.9}
    >
      <View style={styles.whatToEatCard}>
        {/* Decorative Background */}
        <View style={styles.patternContainer}>
          <Svg height="100%" width="100%" style={{ opacity: 0.1 }}>
             {/* Diagonal Stripes */}
             <Circle cx="0" cy="0" r="80" fill="#000" />
             <Circle cx="100%" cy="100%" r="100" fill="#000" />
          </Svg>
        </View>

        <View style={styles.whatToEatContent}>
          <View style={styles.badgeContainer}>
             <Text style={styles.badgeText}>{t('home.popular')}</Text>
          </View>
          <Text style={styles.whatToEatTitle}>{t('home.dailyRoulette')}</Text>
          <Text style={styles.whatToEatSubtitle}>{t('home.dailyRouletteSubtitle')}</Text>
        </View>
        <View style={styles.rouletteVisual}>
          <Text style={{ fontSize: 48 }}>🎰</Text>
        </View>
        
        <View style={styles.playButton}>
           <Text style={styles.playButtonText}>{t('home.play')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBanner = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.trending')}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.bannerContainer}>
        <View style={styles.banner}>
          <View style={styles.bannerOverlay} />
          <Image 
            source={{ uri: banners.length > 0 ? banners[0].image : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800' }} 
            style={styles.bannerBgImage} 
            resizeMode="cover"
          />
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>{t('home.healthy')}</Text>
            </View>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {banners.length > 0 ? banners[0].title : 'The Art of Balanced Breakfast: A Complete Guide'}
            </Text>
            <TouchableOpacity style={styles.readMoreBtn} onPress={() => console.log('Read')}>
              <Text style={styles.readMoreText}>{t('home.readArticle')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDailyRecommendations = () => {
    if (dailyRecs.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>今日推荐菜谱</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
          {dailyRecs.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.dailyCard}
              onPress={() => navigation.navigate('RecipeDetail', { id: item.id.toString() })}
            >
              <Image source={{ uri: item.cover_image }} style={styles.dailyImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.dailyGradient}
              />
              <View style={styles.dailyContent}>
                <Text style={styles.dailyTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.dailyMeta}>
                   <Ionicons name="heart" size={12} color="#FFF" />
                   <Text style={styles.dailyMetaText}>{item.likes_count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFeedItem = (item: FeedItem, index: number) => {
    const isRestaurant = item.type === 'restaurant';
    const randomHeight = 180 + (item.id % 5) * 30; 
    
    return (
      <FeedCard 
        key={item.id}
        item={item}
        height={randomHeight}
        onPress={() => navigation.navigate(isRestaurant ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
        onPressAuthor={() => {
          if (!item.author_id) return;
          navigation.navigate('UserDetail', { userId: item.author_id });
        }}
      />
    );
  };

  const renderFeed = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('home.recommended')}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 20 }} />
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#1A1A1A']} 
              tintColor="#1A1A1A"
            />
          }
        >
          {renderHeader()}
          {renderDailyRecommendations()}
          {renderDiscipline()}
          {renderWhatToEat()}
          {renderBanner()}
          {renderFeed()}
          {loadingMore && <ActivityIndicator style={{ padding: 20 }} color="#1A1A1A" />}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 26,
    color: '#1A1A1A',
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  avatarContainer: {
    position: 'relative',
    padding: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 18,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4757',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 6,
    paddingLeft: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchText: {
    color: '#999',
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  searchButton: {
    width: 28,
    height: 28,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // What to Eat
  whatToEatButtonContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  whatToEatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    overflow: 'hidden',
    position: 'relative',
    height: 140,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  whatToEatContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
  },
  badgeContainer: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  whatToEatTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  whatToEatSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  rouletteVisual: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
    transform: [{ rotate: '15deg' }],
  },
  playButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    color: '#FF6B6B',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  
  // Section Shared
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  
  // Banner
  bannerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  banner: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  bannerBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  bannerTag: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#1A1A1A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 24,
    maxWidth: '85%',
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    textDecorationLine: 'underline',
  },
  bannerButton: {
    display: 'none',
  },
  bannerButtonText: {
    display: 'none',
  },
  bannerImage: {
    display: 'none',
  },
  
  // Feed
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  
  // Daily Recommendations
  dailyCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  dailyImage: {
    width: '100%',
    height: '100%',
  },
  dailyGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  dailyContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  dailyTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dailyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyMetaText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Discipline
  disciplineCard: {
    backgroundColor: '#2ECC71', // Green
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayItem: {
    alignItems: 'center',
    width: 36,
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkInButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#2ECC71',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RecommendScreen;
