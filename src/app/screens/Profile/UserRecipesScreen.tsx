import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserRecipes } from '../../../api/users';
import FeedItemCard from '../../components/FeedCard';
import { theme } from '../../styles/theme';

const UserRecipesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { userId, title } = route.params;
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRecipes = async (pageNum: number) => {
    try {
      const data = await getUserRecipes(userId, pageNum);
      if (pageNum === 1) {
        setRecipes(data);
      } else {
        setRecipes(prev => [...prev, ...data]);
      }
      setHasMore(data.length >= 20);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, [userId]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setPage(prev => {
        const nextPage = prev + 1;
        fetchRecipes(nextPage);
        return nextPage;
      });
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{title || '帖子'}</Text>
          <View style={{ width: 28 }} />
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <FeedItemCard item={item} onPress={() => {}} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无发布内容</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    padding: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 15,
  },
});

export default UserRecipesScreen;
