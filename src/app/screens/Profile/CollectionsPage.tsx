import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getCollections, Recipe, Restaurant } from '../../../api/content';
import ScreenHeader from '../../components/ScreenHeader';

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
      <ScreenHeader title="我的收藏" />

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
    backgroundColor: '#F6F7FB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00C896',
  },
  tabText: {
    fontSize: 13,
    color: '#6F6F6F',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
  },
  content: {
    padding: 16,
    paddingTop: 14,
  },
  masonryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: 10,
    color: '#8C8C8C',
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 10,
    color: '#8C8C8C',
    marginLeft: 2,
  },
  listContainer: {
    width: '100%',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  restaurantType: {
    fontSize: 12,
    color: '#8C8C8C',
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
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
  },
});

export default CollectionsPage;
