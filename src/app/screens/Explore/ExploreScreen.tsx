import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator, Modal, TouchableWithoutFeedback, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { getRecommendations, getPopularTags, getHealthNews, FeedItem, HealthNews } from '../../../api/explore';
import FeedCard from '../../components/FeedCard';
import { useTranslation } from 'react-i18next';

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = 12;
const COLUMN_WIDTH = (width - 30 - SPACING) / 2;

const ExploreScreen = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('AI推荐');
  const [sortBy, setSortBy] = useState<'default' | 'time' | 'likes' | 'views'>('default');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [healthNews, setHealthNews] = useState<HealthNews[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const CATEGORIES = [
    { label: t('explore.tabAI'), value: 'AI推荐' },
    { label: t('explore.tabStore'), value: '探店' },
    { label: t('explore.tabRecipe'), value: '菜谱' },
    { label: t('explore.tabHealth'), value: '健康' },
  ];

  const fetchTags = async () => {
    try {
      const tagsData = await getPopularTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    }
  };

  const fetchData = async (pageNum = 1) => {
    try {
      if (activeTab === '健康') {
        const newsData = await getHealthNews();
        setHealthNews(newsData);
      } else {
        let type: 'recipe' | 'restaurant' | undefined;
        if (activeTab === '探店') type = 'restaurant';
        if (activeTab === '菜谱') type = 'recipe';
        
        const data = await getRecommendations(pageNum, 20, type, sortBy, selectedTag);
        
        let items: FeedItem[] = [];
        let pagination = { page: 1, limit: 20, total: 0 };

        if (Array.isArray(data)) {
          items = data;
          pagination.total = 100;
        } else if (data?.items) {
          items = data.items;
          pagination = data.pagination;
        }

        if (pageNum === 1) {
          setFeedItems(items);
        } else {
          setFeedItems(prev => [...prev, ...items]);
        }
        
        setHasMore(items.length > 0 && pagination.page * pagination.limit < pagination.total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch feed", error);
      // Reset loading states on error
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [activeTab, sortBy, selectedTag]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [activeTab, sortBy, selectedTag]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading || activeTab === '健康') return;
    setLoadingMore(true);
    fetchData(page + 1);
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const renderFilterDropdown = () => {
    if (!isFilterOpen || activeTab === '健康') return null;

    const sorts: { label: string; value: 'default' | 'time' | 'likes' | 'views' }[] = [
      { label: t('explore.sortDefault'), value: 'default' },
      { label: t('explore.sortTime'), value: 'time' },
      { label: t('explore.sortViews'), value: 'views' },
      { label: t('explore.sortLikes'), value: 'likes' },
    ];

    return (
      <Modal
        transparent={true}
        visible={isFilterOpen}
        animationType="fade"
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownMainTitle}>{t('explore.filterTitle')}</Text>
                  <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.dropdownTitle}>{t('explore.sortTitle')}</Text>
                <View style={styles.dropdownSection}>
                  {sorts.map((sort) => (
                    <TouchableOpacity 
                      key={sort.value} 
                      onPress={() => setSortBy(sort.value)}
                      style={[styles.dropdownItem, sortBy === sort.value && styles.activeDropdownItem]}
                    >
                      <Text style={[styles.dropdownItemText, sortBy === sort.value && styles.activeDropdownItemText]}>
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.dropdownTitle}>{t('explore.popularTags')}</Text>
                <View style={styles.dropdownSection}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, selectedTag === tag && styles.activeDropdownItem]}
                      onPress={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                    >
                      <Text style={[styles.dropdownItemText, selectedTag === tag && styles.activeDropdownItemText]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => setIsFilterOpen(false)}
                >
                  <Text style={styles.confirmButtonText}>{t('explore.applyFilter')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.tabItem, activeTab === cat.value && styles.activeTabItem]}
            onPress={() => setActiveTab(cat.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === cat.value && styles.activeTabText]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {activeTab !== '健康' && (
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterOpen(true)}>
          <Ionicons name="options" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHealthNewsList = () => (
    <View style={styles.contentContainer}>
      {healthNews.map((item, index) => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.newsCard} 
          activeOpacity={0.9}
          onPress={() => console.log('Navigate to news', item.id)}
        >
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          <View style={styles.newsContent}>
            <View style={styles.newsHeader}>
              <View style={styles.newsTag}>
                <Text style={styles.newsTagText}>TRENDING</Text>
              </View>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
            <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.readMoreRow}>
               <Text style={styles.readMoreText}>Read Story</Text>
               <Ionicons name="arrow-forward" size={12} color="#1A1A1A" />
            </View>
          </View>
          <View style={styles.newsIndex}>
             <Text style={styles.newsIndexText}>0{index + 1}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWaterfallFlow = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A1A1A" />
        </View>
      );
    }

    return (
      <View style={styles.masonryContainer}>
        <View style={styles.column}>
          {feedItems.filter((_, i) => i % 2 === 0).map((item, index) => (
            <FeedCard
              key={`${item.type}-${item.id}`}
              item={item}
              height={200 + (item.id % 5) * 20}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: `${item.id}` })}
            />
          ))}
        </View>
        <View style={styles.column}>
          {feedItems.filter((_, i) => i % 2 === 1).map((item, index) => (
            <FeedCard
              key={`${item.type}-${item.id}`}
              item={item}
              height={200 + ((item.id + 2) % 5) * 20}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: `${item.id}` })}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>{t('explore.searchPlaceholder')}</Text>
          </View>
        </View>

        {renderTabs()}
        {renderFilterDropdown()}

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
          {activeTab === '健康' ? (
            renderHealthNewsList() 
          ) : (
            <View style={styles.contentContainer}>
              {renderWaterfallFlow()}
              {loadingMore && <ActivityIndicator style={{ padding: 20 }} color="#1A1A1A" />}
            </View>
          )}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  
  // Header & Search
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    height: 50, // Taller for better touch target
    borderRadius: 25, // Full Pill
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  searchPlaceholder: {
    color: theme.colors.textSecondary,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  
  // Tabs
  tabContainer: {
    height: 50,
    backgroundColor: theme.colors.background,
    // paddingBottom: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  tabScrollContent: {
    marginHorizontal: 12,
    paddingRight: 16,
    gap: 12,
  },
  tabItem: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    transform: [{ skewX: '-10deg' }], // Skewed tabs
    marginRight: 0, // Handled by gap
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  activeTabItem: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0,
    paddingBottom: 10,
    transform: [{ skewX: '-10deg' }, { scale: 1.05 }],
    // shadowColor: theme.colors.primary,
    // shadowOpacity: 0.4,
    // shadowRadius: 8,
    // elevation: 6,
  },
  tabText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontStyle: 'italic',
    transform: [{ skewX: '10deg' }], // Counter-skew text
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginLeft: 12,
    transform: [{ skewX: '-5deg' }],
  },
  
  // Content Layout
  scrollContent: {
    paddingBottom: 50,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  
  // News Card
  newsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    height: 140, // Taller
    borderWidth: 0,
  },
  newsImage: {
    width: 130,
    height: '100%',
  },
  newsContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsTag: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    transform: [{ skewX: '-12deg' }],
  },
  newsTagText: {
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: '900',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  newsSummary: {
    display: 'none',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceVariant,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    textDecorationLine: 'none',
    fontStyle: 'italic',
  },
  newsDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '700',
  },
  newsIndex: {
    position: 'absolute',
    bottom: -10,
    right: -5,
    zIndex: 1,
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  newsIndexText: {
    fontSize: 80,
    fontWeight: '900',
    color: theme.colors.primary,
    fontStyle: 'italic',
    letterSpacing: -4,
  },
  
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeDropdownItem: {
    backgroundColor: '#E0F2F1',
    borderColor: '#00C896',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeDropdownItemText: {
    color: '#00C896',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#00C896',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
  },
});

export default ExploreScreen;
