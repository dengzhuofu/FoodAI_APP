import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator, StatusBar, Platform, Modal, Pressable } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [carouselWidth, setCarouselWidth] = useState(0);

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
        items = recData;
        pagination.total = 100;
      } else if (recData?.items) {
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

  const renderHeroSection = () => {
    return (
      <View style={styles.heroContainer}>
        {/* Left: Recommended Recipes Carousel */}
        <View style={styles.leftColumn}>
          <Text style={styles.heroTitle}>今日推荐</Text>
          <View 
            style={styles.carouselContainer}
            onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
          >
            {dailyRecs.length > 0 ? (
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {dailyRecs.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('RecipeDetail', { id: item.id.toString() })}
                    style={[styles.carouselItem, { width: carouselWidth }]}
                  >
                    <Image source={{ uri: item.cover_image }} style={styles.carouselImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.carouselGradient}
                    />
                    <View style={styles.carouselContent}>
                      <Text style={styles.carouselTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.carouselMeta}>
                        <Ionicons name="heart" size={12} color="#FFF" />
                        <Text style={styles.carouselMetaText}>{item.likes_count}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={[styles.carouselItem, { backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center', width: '100%' }]}>
                 <Text style={{ color: '#999' }}>暂无推荐</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Check-in Entry */}
        <TouchableOpacity 
          style={styles.rightColumn}
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={['#2ECC71', '#27AE60']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkInCard}
          >
            <View style={styles.checkInIconBg}>
               <Ionicons name="calendar-outline" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.checkInTitle}>今天你自律了吗?</Text>
            <Text style={styles.checkInSubtitle}>点击打卡</Text>
            
            <View style={styles.miniProgressRow}>
               {/* Show simplified dots for last 3 days */}
               {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.miniDot, { opacity: 0.6 + (i * 0.2) }]} />
               ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCheckInModal = () => {
    const today = new Date();
    // Generate current week dates
    const days = [];
    const currentDay = today.getDay(); // 0-6
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust to Monday start or as needed

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>每日自律打卡</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <Ionicons name="close" size={24} color="#333" />
               </TouchableOpacity>
             </View>

             <View style={styles.calendarContainer}>
               <View style={styles.weekHeader}>
                 {weekDays.map((day, index) => (
                   <Text key={index} style={styles.weekDayText}>{day}</Text>
                 ))}
               </View>
               <View style={styles.daysRow}>
                 {days.map((day, index) => {
                   const dateStr = day.toISOString().split('T')[0];
                   const checkIn = checkIns.find(c => c.date === dateStr);
                   const isToday = dateStr === today.toISOString().split('T')[0];
                   
                   let bgColor = '#F5F5F5';
                   let textColor = '#333';
                   
                   if (checkIn) {
                     if (checkIn.status === 'white') { bgColor = '#E8F5E9'; textColor = '#2ECC71'; } // Healthy
                     else if (checkIn.status === 'orange') { bgColor = '#FFF3E0'; textColor = '#FFA502'; } // Warning
                     else if (checkIn.status === 'red') { bgColor = '#FFEBEE'; textColor = '#FF4757'; } // Bad
                   }
                   
                   if (isToday) {
                     // Highlight today border
                   }

                   return (
                     <View key={index} style={[styles.modalDayItem, { backgroundColor: bgColor, borderWidth: isToday ? 1 : 0, borderColor: '#2ECC71' }]}>
                       <Text style={[styles.modalDayText, { color: textColor }]}>{day.getDate()}</Text>
                       {checkIn && <View style={[styles.modalStatusDot, { backgroundColor: textColor }]} />}
                     </View>
                   );
                 })}
               </View>
             </View>

             <TouchableOpacity 
               style={styles.modalCheckInButton}
               onPress={() => {
                 setModalVisible(false);
                 navigation.navigate('HealthCheckIn', { date: today.toISOString().split('T')[0] });
               }}
             >
               <View style={styles.checkButtonCircle}>
                 <Ionicons name="checkmark" size={24} color="#2ECC71" />
               </View>
               <Text style={styles.modalCheckInText}>立即打卡</Text>
             </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderWhatToEat = () => (
    <TouchableOpacity 
      style={styles.whatToEatButtonContainer}
      onPress={() => navigation.navigate('WhatToEat')}
      activeOpacity={0.9}
    >
      <View style={styles.whatToEatCard}>
        <View style={styles.patternContainer}>
          <Svg height="100%" width="100%" style={{ opacity: 0.1 }}>
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
          {renderHeroSection()}
          {renderWhatToEat()}
          {renderBanner()}
          {renderFeed()}
          {loadingMore && <ActivityIndicator style={{ padding: 20 }} color="#1A1A1A" />}
        </ScrollView>
      </SafeAreaView>
      
      {renderCheckInModal()}
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 0,
    transform: [{ skewX: '-10deg' }],
  },
  dateText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 28,
    color: theme.colors.text,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 34,
    fontStyle: 'italic',
  },
  avatarContainer: {
    position: 'relative',
    padding: 2,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingLeft: 16,
    borderRadius: 30, // Full Pill
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  searchText: {
    color: theme.colors.textTertiary,
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Hero Section (Recipes + Check-in)
  heroContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 200, // Taller for impact
  },
  leftColumn: {
    flex: 3, // 60%
    marginRight: 16,
  },
  rightColumn: {
    flex: 2, // 40%
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  carouselContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  carouselItem: {
    height: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  carouselTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  carouselMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselMetaText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Check In Card
  checkInCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36, // Align with carousel top (approx)
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkInIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    transform: [{ scale: 1.1 }],
  },
  checkInTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkInSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginBottom: 12,
    fontWeight: '600',
  },
  miniProgressRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.8)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  calendarContainer: {
    marginBottom: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalDayItem: {
    width: 40,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: theme.colors.surfaceVariant,
  },
  modalDayText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 6,
  },
  modalCheckInButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  checkButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalCheckInText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
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
    padding: 20,
    borderRadius: 24,
    backgroundColor: theme.colors.primary, // Changed to Teal
    overflow: 'hidden',
    position: 'relative',
    height: 150,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  whatToEatContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
  },
  badgeContainer: {
    backgroundColor: theme.colors.secondary, // Neon Yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    transform: [{ skewX: '-10deg' }],
  },
  badgeText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  whatToEatTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 28,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  whatToEatSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  rouletteVisual: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
    transform: [{ rotate: '15deg' }],
  },
  playButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Pill
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playButtonText: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    fontStyle: 'italic',
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
});

export default RecommendScreen;
