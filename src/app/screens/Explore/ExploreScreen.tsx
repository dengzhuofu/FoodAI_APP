import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { getRecommendations, getPopularTags, getHealthNews, FeedItem, HealthNews } from '../../../api/explore';

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.md * 1.3) / 2; // Reduced side padding to theme.spacing.md

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
                <Text style={styles.dropdownTitle}>排序方式</Text>
                <View style={styles.dropdownSection}>
                  {sorts.map((sort) => (
                    <TouchableOpacity 
                      key={sort.value} 
                      onPress={() => {
                        setSortBy(sort.value);
                        // Optional: Close on sort change or wait for explicit close?
                        // setIsFilterOpen(false); 
                      }}
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
                      onPress={() => {
                        setSelectedTag(selectedTag === tag ? undefined : tag);
                      }}
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
          <Text style={styles.filterButtonText}>筛选</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHealthNewsList = () => (
    <View style={styles.contentContainer}>
      {healthNews.map(item => (
        <TouchableOpacity key={item.id} style={styles.newsCard}>
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary}>{item.summary}</Text>
            <Text style={styles.newsDate}>{item.date}</Text>
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
          {feedItems.filter((_, i) => i % 2 === 0).map((item) => (
            <TouchableOpacity 
              key={`${item.type}-${item.id}`} 
              style={styles.feedCard}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: `${item.id}` })}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
                // Random height for waterfall effect, using id to keep it consistent
                style={[styles.feedImage, { height: 200 + (item.id % 5) * 20 }]} 
                resizeMode="cover"
              />
              <View style={styles.feedContent}>
                <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.feedFooter}>
                  <View style={styles.authorInfo}>
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                  </View>
                  <View style={styles.likeInfo}>
                    <Ionicons name="heart-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.likeCount}>{item.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.column}>
          {feedItems.filter((_, i) => i % 2 === 1).map((item) => (
            <TouchableOpacity 
              key={`${item.type}-${item.id}`} 
              style={styles.feedCard}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: `${item.id}` })}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
                style={[styles.feedImage, { height: 200 + ((item.id + 2) % 5) * 20 }]} 
                resizeMode="cover"
              />
              <View style={styles.feedContent}>
                <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.feedFooter}>
                  <View style={styles.authorInfo}>
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
                  </View>
                  <View style={styles.likeInfo}>
                    <Ionicons name="heart-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.likeCount}>{item.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>搜索菜品、餐厅、风味...</Text>
        </View>
      </View>

      {renderTabs()}
      {renderFilterDropdown()}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === '健康' ? (
          // Health news list has its own container
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
  tagsContainer: {
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.sm,
  },
  tagsContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  tagChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeTagChip: {
    backgroundColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activeTagText: {
    color: theme.colors.white,
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  sortItem: {
    marginRight: theme.spacing.lg,
  },
  sortText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeSortText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  newsDate: {
    fontSize: 10,
    color: '#999',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: theme.spacing.md,
    height: 40,
    borderRadius: 20,
  },
  searchPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
  },
  tabContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabScrollContent: {
    flexGrow: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120, // Adjust based on header + tabs height
  },
  dropdownContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  activeDropdownItem: {
    backgroundColor: theme.colors.primary,
  },
  dropdownItemText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activeDropdownItemText: {
    color: theme.colors.white,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  activeTabItem: {
    // Add specific styles if needed
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activeTabIndicator: {
    width: 20,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    padding: theme.spacing.sm, // Reduced padding
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
  avatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
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

export default ExploreScreen;
