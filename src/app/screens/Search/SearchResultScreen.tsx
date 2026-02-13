import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { searchContent } from '../../../api/search';
import { FeedItem } from '../../../api/explore';
import FeedCard from '../../components/FeedCard';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type SearchResultRouteProp = RouteProp<RootStackParamList, 'SearchResult'>;

const SearchResultScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchResultRouteProp>();
  const { keyword } = route.params;

  const [results, setResults] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchContent(keyword);
        // Merge recipes and restaurants into FeedItem format
        const items: FeedItem[] = [];
        
        if (data.recipes) {
          data.recipes.forEach(r => items.push({
            id: r.id,
            type: 'recipe',
            title: r.title,
            image: r.cover_image || r.images?.[0] || '',
            author: r.author?.nickname || r.author?.username || '用户',
            author_id: r.author?.id,
            author_avatar: r.author?.avatar,
            author_username: r.author?.username,
            likes: r.likes_count || 0,
            created_at: r.created_at,
          }));
        }
        
        if (data.restaurants) {
          data.restaurants.forEach(r => items.push({
            id: r.id,
            type: 'restaurant',
            title: r.name,
            image: r.images?.[0] || '',
            author: r.author?.nickname || r.author?.username || '用户',
            author_id: r.author?.id,
            author_avatar: r.author?.avatar,
            author_username: r.author?.username,
            likes: r.rating ? Math.floor(r.rating * 10) : 0,
            created_at: r.created_at,
          }));
        }
        
        setResults(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword]);

  const renderWaterfallFlow = () => {
    if (results.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>没有找到关于 "{keyword}" 的结果</Text>
        </View>
      );
    }

    return (
      <View style={styles.masonryContainer}>
        <View style={styles.column}>
          {results.filter((_, i) => i % 2 === 0).map((item, index) => (
            <FeedCard
              key={`${item.type}-${item.id}`}
              item={item}
              height={200 + (item.id % 5) * 20}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
            />
          ))}
        </View>
        <View style={styles.column}>
          {results.filter((_, i) => i % 2 === 1).map((item, index) => (
            <FeedCard
              key={`${item.type}-${item.id}`}
              item={item}
              height={200 + ((item.id + 2) % 5) * 20}
              onPress={() => navigation.navigate(item.type === 'restaurant' ? 'RestaurantDetail' : 'RecipeDetail', { id: item.id.toString() })}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => navigation.goBack()} // Go back to search input
        >
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.searchText}>{keyword}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderWaterfallFlow()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    height: 44, // Taller pill
    borderRadius: 22,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  scrollContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: (Dimensions.get('window').width - theme.spacing.screenHorizontal * 2 - 12) / 2,
    gap: 12,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default SearchResultScreen;
