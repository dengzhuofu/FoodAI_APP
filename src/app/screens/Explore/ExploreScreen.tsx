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

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const SPACING = 12;
const COLUMN_WIDTH = (width - 30 - SPACING) / 2;

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
                  <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#1A1A1A" />
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
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
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
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPlaceholder: {
    color: '#999',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Tabs
  tabContainer: {
    backgroundColor: theme.colors.background,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  tabScrollContent: {
    paddingRight: 16,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  activeTabItem: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1.02 }],
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginLeft: 10,
  },
  
  // Content Layout
  scrollContent: {
    paddingBottom: 100,
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    height: 120,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  newsImage: {
    width: 110,
    height: '100%',
  },
  newsContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  newsTag: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newsTagText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsSummary: {
    display: 'none',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
  },
  newsDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  newsIndex: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 12,
  },
  newsIndexText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E0E0E0',
  },
  
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
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
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    marginTop: 8,
  },
  dropdownSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  activeDropdownItem: {
    backgroundColor: '#1A1A1A',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeDropdownItemText: {
    color: '#FFF',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ExploreScreen;
