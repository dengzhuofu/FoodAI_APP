import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getCollections, Recipe, Restaurant } from '../../../api/content';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

const CollectionsPage = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'recipes' | 'restaurants'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const fetchData = async () => {
    try {
      if (activeTab === 'recipes') {
        const data = await getCollections('recipe');
        setRecipes(data as Recipe[]);
      } else {
        const data = await getCollections('restaurant');
        setRestaurants(data as Restaurant[]);
      }
    } catch (error) {
      console.error("Failed to fetch collections", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
        onPress={() => setActiveTab('recipes')}
      >
        <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>菜谱</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
        onPress={() => setActiveTab('restaurants')}
      >
        <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>餐厅</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>我的收藏</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderTabs()}

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'recipes' ? (
          <View style={styles.masonryContainer}>
            {recipes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recipeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('RecipeDetail', { id: item.id.toString() })}
              >
                <Image source={{ uri: item.cover_image || item.images?.[0] || 'https://via.placeholder.com/300' }} style={styles.recipeImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardAuthor} numberOfLines={1}>
                      {item.author?.nickname || item.author?.username || '用户'}
                    </Text>
                    <View style={styles.likeInfo}>
                      <Ionicons name="heart" size={12} color={theme.colors.error} />
                      <Text style={styles.likeCount}>{item.likes_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {restaurants.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.restaurantCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('RestaurantDetail', { id: item.id.toString() })}
              >
                <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} style={styles.restaurantImage} />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>{item.title || item.name}</Text>
                  <Text style={styles.restaurantType} numberOfLines={1}>{item.cuisine || item.address || '餐厅'}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7} onPress={() => {}}>
                  <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 0,
    gap: 24,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    marginRight: 0,
    borderBottomWidth: 0,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 18,
    fontStyle: 'italic',
  },
  content: {
    padding: theme.spacing.lg,
  },
  masonryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: COLUMN_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  listContainer: {
    width: '100%',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  restaurantType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
});

export default CollectionsPage;
