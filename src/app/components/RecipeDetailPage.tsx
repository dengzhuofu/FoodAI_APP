import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';
import { getRecipe, getComments, toggleCollection, Recipe, Comment } from '../../api/content';
import { getMe } from '../../api/auth';
import CommentsSection from './CommentsSection';
import DetailBottomBar from './DetailBottomBar';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const { width } = Dimensions.get('window');

const RecipeDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<RecipeDetailRouteProp>();
  const { id } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [isCollected, setIsCollected] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const handleCollection = async () => {
    try {
      await toggleCollection(parseInt(id), 'recipe');
      setIsCollected(!isCollected);
      Alert.alert(isCollected ? '已取消收藏' : '收藏成功');
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  const handleCommentSuccess = (newComment: Comment) => {
    fetchComments(newComment);
  };

  const fetchComments = async (newComment?: Comment) => {
    if (newComment) {
      // If we have a new comment, manually add it to the list to avoid network request
      // Check if it's a reply (has root_parent_id)
      if (newComment.root_parent_id) {
        setComments(prevComments => 
          prevComments.map(c => {
            if (c.id === newComment.root_parent_id) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment]
              };
            }
            return c;
          })
        );
      } else {
        // If it's a top-level comment, add to the beginning of the list
        setComments(prevComments => [newComment, ...prevComments]);
      }
    } else {
      // Fallback to full refresh
      try {
        const commentsData = await getComments(parseInt(id), 'recipe');
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to fetch comments', error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeId = parseInt(id);
        const [recipeData, userData] = await Promise.all([
          getRecipe(recipeId),
          getMe().catch(() => null)
        ]);
        setRecipe(recipeData);
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUser(userData);
        }
        
        await fetchComments();
        // TODO: Check if collected
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        Alert.alert('错误', '加载菜谱失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const addToShoppingList = () => {
    const count = checkedIngredients.size;
    if (count === 0) {
      Alert.alert('提示', '请先勾选需要购买的食材');
      return;
    }
    Alert.alert('成功', `已将 ${count} 个食材加入购物清单`);
  };

  const renderHeader = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: recipe.image }} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <TouchableOpacity 
        style={styles.backButtonAbsolute} 
        onPress={() => navigation.goBack()}
      >
        <View style={styles.blurButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{recipe.difficulty}</Text>
          </View>
          <View style={[styles.tag, styles.timeTag]}>
            <Ionicons name="time-outline" size={12} color="#FFF" />
            <Text style={styles.tagText}>{recipe.time}</Text>
          </View>
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.authorRow}>
          <Image source={{ uri: recipe.author.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          <Text style={styles.authorName}>{recipe.author.username}</Text>
          <View style={styles.likesContainer}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.likesText}>{recipe.likes_count}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNutrition = () => {
    if (!recipe.nutrition) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>营养成分</Text>
        <View style={styles.nutritionGrid}>
          <View style={[styles.nutritionItem, { backgroundColor: '#FFF5E6' }]}>
            <Text style={[styles.nutritionValue, { color: '#FF9F43' }]}>{recipe.nutrition.calories || '-'}</Text>
            <Text style={styles.nutritionLabel}>热量(卡)</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.nutritionValue, { color: '#2ECC71' }]}>{recipe.nutrition.protein || '-'}</Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.nutritionValue, { color: '#3498DB' }]}>{recipe.nutrition.fat || '-'}</Text>
            <Text style={styles.nutritionLabel}>脂肪</Text>
          </View>
          <View style={[styles.nutritionItem, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.nutritionValue, { color: '#9B59B6' }]}>{recipe.nutrition.carbs || '-'}</Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
        onPress={() => setActiveTab('ingredients')}
      >
        <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>所需食材</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
        onPress={() => setActiveTab('steps')}
      >
        <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>制作步骤</Text>
      </TouchableOpacity>
    </View>
  );

  const renderIngredients = () => (
    <View style={styles.listContainer}>
      {recipe.ingredients.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.ingredientItem,
            checkedIngredients.has(index) && styles.ingredientItemChecked
          ]}
          onPress={() => toggleIngredient(index)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            checkedIngredients.has(index) && styles.checkboxChecked
          ]}>
            {checkedIngredients.has(index) && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
          <Text style={[
            styles.ingredientText,
            checkedIngredients.has(index) && styles.ingredientTextChecked
          ]}>{item}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addToShoppingList}>
        <Ionicons name="cart-outline" size={20} color="#FFF" />
        <Text style={styles.addButtonText}>加入购物清单</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSteps = () => (
    <View style={styles.listContainer}>
      {recipe.steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderComments = () => (
    <CommentsSection 
      comments={comments} 
      targetId={parseInt(id)} 
      targetType="recipe" 
      onRefresh={fetchComments}
      currentUserId={currentUserId}
      onReply={setReplyTo}
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={styles.content}>
          <Text style={styles.description}>{recipe.description}</Text>
          {renderNutrition()}
          <View style={styles.section}>
            {renderTabs()}
            {activeTab === 'ingredients' ? renderIngredients() : renderSteps()}
          </View>
          {renderComments()}
        </View>
      </ScrollView>
      
      {recipe && (
        <DetailBottomBar 
          targetId={parseInt(id)}
          targetType="recipe"
          likesCount={recipe.likes_count || 0}
          commentsCount={comments.length}
          isCollected={isCollected}
          onCollect={handleCollection}
          onCommentSuccess={handleCommentSuccess}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          currentUserAvatar={currentUser?.avatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    padding: 4,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  collectButtonAbsolute: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  timeTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF',
    marginRight: 8,
  },
  authorName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likesText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
    marginTop: -20,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  nutritionItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ingredientItemChecked: {
    backgroundColor: '#F9F9F9',
    borderColor: 'transparent',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ingredientText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  ingredientTextChecked: {
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    ...theme.shadows.sm,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    ...theme.shadows.sm,
  },
  stepText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 24,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  commentDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default RecipeDetailPage;
