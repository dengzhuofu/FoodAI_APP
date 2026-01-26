import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { getRecommendations, getPopularTags, getHealthNews, FeedItem, HealthNews } from '../../../api/explore';
import FeedCard from '../../components/FeedCard';

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = theme.spacing.sm;
const COLUMN_WIDTH = (width - theme.spacing.screenHorizontal * 2 - SPACING) / 2;

const CATEGORIES = ['AI推荐', '探店', '菜谱', '健康'];

const ExploreScreen = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('AI推荐');
  const [sortBy, setSortBy] = useState<'default' | 'time' | 'likes' | 'views'>('default');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [healthNews, setHealthNews] = useState<HealthNews[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTags = async () => {
    try {
      const tagsData = await getPopularTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === '健康') {
        const newsData = await getHealthNews();
        setHealthNews(newsData);
      } else {
        let type: 'recipe' | 'restaurant' | undefined;
        if (activeTab === '探店') type = 'restaurant';
        if (activeTab === '菜谱') type = 'recipe';
        
        const data = await getRecommendations(1, 20, type, sortBy, selectedTag);
        setFeedItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch feed", error);
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

  const renderFilterDropdown = () => {
    if (!isFilterOpen || activeTab === '健康') return null;

    const sorts: { label: string; value: 'default' | 'time' | 'likes' | 'views' }[] = [
      { label: '综合排序', value: 'default' },
      { label: '最新发布', value: 'time' },
      { label: '最多浏览', value: 'views' },
      { label: '最多点赞', value: 'likes' },
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
                  <Text style={styles.dropdownMainTitle}>筛选与排序</Text>
                  <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.dropdownTitle}>排序方式</Text>
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

                <Text style={styles.dropdownTitle}>热门标签</Text>
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
                  <Text style={styles.confirmButtonText}>完成筛选</Text>
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
            style={[styles.tabItem, activeTab === cat && styles.activeTabItem]}
            onPress={() => setActiveTab(cat)}
          >
            <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
            {activeTab === cat && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {activeTab !== '健康' && (
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterOpen(true)}>
          <Ionicons name="options-outline" size={20} color={theme.colors.textSecondary} />
          {/* <Text style={styles.filterButtonText}>筛选</Text> */}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHealthNewsList = () => (
    <View style={styles.contentContainer}>
      {healthNews.map(item => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.newsCard} 
          activeOpacity={0.8}
          // Currently we don't have a dedicated news detail page, so we can mock navigation or alert
          // In a real app, this would navigate to a WebView or NewsDetail screen
          onPress={() => console.log('Navigate to news', item.id)}
        >
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          <View style={styles.newsContent}>
            <View style={styles.newsHeader}>
              <View style={styles.newsTag}>
                <Text style={styles.newsTagText}>健康</Text>
              </View>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
            <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWaterfallFlow = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>搜索菜品、餐厅、风味...</Text>
        </View>
      </View>

      {renderTabs()}
      {renderFilterDropdown()}

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
        {activeTab === '健康' ? (
          renderHealthNewsList() 
        ) : (
          <View style={styles.contentContainer}>
            {renderWaterfallFlow()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  
  // Header & Search
  header: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  searchPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
  },
  
  // Tabs
  tabContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screenHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabScrollContent: {
    flexGrow: 1,
  },
  tabItem: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginRight: theme.spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabItem: {
    // Add specific styles if needed
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  filterButton: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  
  // Content Layout
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing.sm,
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
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
    height: 110,
  },
  newsImage: {
    width: 110,
    height: '100%',
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  newsTag: {
    backgroundColor: 'rgba(11, 232, 129, 0.1)', // accent color with opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newsTagText: {
    fontSize: 10,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  newsDate: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Bottom sheet style
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dropdownMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  dropdownSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: 10,
    marginBottom: 10,
  },
  activeDropdownItem: {
    backgroundColor: theme.colors.primary,
  },
  dropdownItemText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  activeDropdownItemText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.primaryGlow,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExploreScreen;
