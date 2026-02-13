import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { getUserPosts } from '../../../api/users';
import ScreenHeader from '../../components/ScreenHeader';

const UserPostsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, initialTab = 'recipe', title } = route.params;

  const [activeTab, setActiveTab] = useState<'recipe' | 'restaurant'>(initialTab);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getUserPosts(userId, activeTab, pageNum);
      if (shouldRefresh) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      setHasMore(data.length >= 20);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset and fetch when tab changes
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [activeTab]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.postCard}
      activeOpacity={0.8}
      onPress={() => {
        if (activeTab === 'recipe') {
          navigation.navigate('RecipeDetail', { id: item.id });
        } else {
          navigation.navigate('RestaurantDetail', { id: item.id });
        }
      }}
    >
      <Image 
        source={{ uri: activeTab === 'recipe' ? (item.cover_image || item.images?.[0]) : (item.images?.[0] || 'https://via.placeholder.com/150') }} 
        style={styles.postImage} 
        resizeMode="cover"
      />
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>{item.title || item.name}</Text>
        <View style={styles.postMeta}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.author?.avatar || 'https://via.placeholder.com/30' }} style={styles.userAvatar} />
            <Text style={styles.userName} numberOfLines={1}>{item.author?.username}</Text>
          </View>
          <View style={styles.likesInfo}>
            <Ionicons name="heart-outline" size={12} color="#999" />
            <Text style={styles.likesCount}>{item.likes_count || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={title || '我的发布'} />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'recipe' && styles.activeTabItem]}
            onPress={() => setActiveTab('recipe')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'recipe' && styles.activeTabText]}>
              菜谱
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'restaurant' && styles.activeTabItem]}
            onPress={() => setActiveTab('restaurant')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'restaurant' && styles.activeTabText]}>
              探店
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 20 }} color={theme.colors.primary} /> : null}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name={activeTab === 'recipe' ? 'restaurant-outline' : 'map-outline'} size={48} color="#DDD" />
                <Text style={styles.emptyText}>暂无{activeTab === 'recipe' ? '菜谱' : '探店'}发布</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  activeTabItem: {
    backgroundColor: '#00C896',
  },
  tabText: {
    fontSize: 13,
    color: '#6F6F6F',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
    paddingTop: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  postCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  postImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  postContent: {
    padding: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
    height: 40, 
    fontStyle: 'italic',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: '#EEE',
  },
  userName: {
    fontSize: 11,
    color: '#6F6F6F',
    flex: 1,
  },
  likesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    fontSize: 11,
    color: '#9A9A9A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#9A9A9A',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default UserPostsScreen;
