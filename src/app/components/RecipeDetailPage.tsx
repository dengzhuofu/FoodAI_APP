import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VideoDisplay from './VideoDisplay';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';
import { getRecipe, getComments, toggleCollection, Recipe, Comment, toggleLike, recordView } from '../../api/content';
import { getMe } from '../../api/auth';
import { followUser, unfollowUser, addToShoppingList as apiAddToShoppingList } from '../../api/users';
import CommentsSection from './CommentsSection';
import DetailBottomBar from './DetailBottomBar';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const { width } = Dimensions.get('window');

const RecipeDetailPage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RecipeDetailRouteProp>();
  const { id } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [isCollected, setIsCollected] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleCollection = async () => {
    try {
      await toggleCollection(parseInt(id), 'recipe');
      setIsCollected(!isCollected);
      Alert.alert(isCollected ? '已取消收藏' : '收藏成功');
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  const handleLike = async () => {
    try {
      const res = await toggleLike(parseInt(id), 'recipe');
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      // Alert.alert('错误', '操作失败');
    }
  };

  const handleFollow = async () => {
    if (!recipe?.author?.id) return;
    try {
      if (isFollowing) {
        await unfollowUser(recipe.author.id);
        setIsFollowing(false);
      } else {
        await followUser(recipe.author.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('操作失败');
    }
  };

  const handleCommentSuccess = (newComment: Comment) => {
    fetchComments(newComment);
  };

  const fetchComments = async (newComment?: Comment) => {
    if (newComment) {
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
        setComments(prevComments => [newComment, ...prevComments]);
      }
    } else {
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
        setLikesCount(recipeData.likes_count || 0);
        setIsLiked(recipeData.is_liked);
        setIsCollected(recipeData.is_collected);
        
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUser(userData);
        }
        
        await fetchComments();
        await recordView(recipeId, 'recipe');
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

  const renderHeader = () => {
    // Determine images to show
    const displayImages =
      recipe?.images && recipe.images.length > 0
        ? recipe.images
        : [recipe?.cover_image || 'https://via.placeholder.com/400'];

    const displayMedia: Array<{ type: 'video' | 'image'; uri: string }> = [];
    if (recipe?.video) displayMedia.push({ type: 'video', uri: recipe.video });
    for (const img of displayImages) displayMedia.push({ type: 'image', uri: img });

    return (
      <View style={styles.imageContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
            if (slide !== activeSlide) setActiveSlide(slide);
          }}
        >
          {displayMedia.map((item, index) =>
            item.type === 'video' ? (
              <View key={`video-${index}`} style={styles.heroImage}>
                <VideoDisplay
                  uri={item.uri}
                  style={StyleSheet.absoluteFill}
                />
                 {/* Video Indicator Badge - Moved to bottom right to avoid overlap */}
                 <View style={styles.videoBadge}>
                     <Ionicons name="videocam" size={14} color="#FFF" />
                     <Text style={styles.videoBadgeText}>Video</Text>
                 </View>
              </View>
            ) : (
              <Image key={`img-${index}`} source={{ uri: item.uri }} style={styles.heroImage} resizeMode="cover" />
            )
          )}
        </ScrollView>
        
        {/* Pagination Dots */}
        {displayMedia.length > 1 && (
          <View style={styles.paginationContainer}>
            {displayMedia.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  activeSlide === index ? styles.paginationDotActive : styles.paginationDotInactive
                ]} 
              />
            ))}
          </View>
        )}
      </View>
    );
  };
  const renderRecipeInfo = () => (
    <View style={styles.headerContent}>
      <Text style={styles.title}>{recipe?.title}</Text>
      <Text style={styles.description}>{recipe?.description}</Text>
    </View>
  );
  const renderTags = () => (
    <View style={styles.tagsSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
        {recipe?.difficulty && (
          <View style={styles.tagChip}>
            <Ionicons name="speedometer-outline" size={14} color="#666" />
            <Text style={styles.tagChipText}>{recipe.difficulty}</Text>
          </View>
        )}
        {recipe?.cooking_time && (
          <View style={styles.tagChip}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.tagChipText}>{recipe.cooking_time}</Text>
          </View>
        )}
        {recipe?.category && (
          <View style={styles.tagChip}>
            <Ionicons name="restaurant-outline" size={14} color="#666" />
            <Text style={styles.tagChipText}>{recipe.category}</Text>
          </View>
        )}
        <View style={styles.tagChip}>
          <Ionicons name="flame-outline" size={14} color="#666" />
          <Text style={styles.tagChipText}>{recipe?.calories || '200'} kcal</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderNutrition = () => {
    if (!recipe?.nutrition) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>营养分析 (AI)</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.calories || '-'}</Text>
            <Text style={styles.nutritionLabel}>卡路里</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.protein || '-'}</Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fat || '-'}</Text>
            <Text style={styles.nutritionLabel}>脂肪</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.carbs || '-'}</Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderIngredients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>食材清单</Text>
      <View style={styles.listContainer}>
        {recipe?.ingredients.map((item: any, index: number) => {
          const name = typeof item === 'string' ? item : item.name;
          const amount = typeof item === 'string' ? '' : item.amount;
          
          return (
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
                {checkedIngredients.has(index) && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Text style={[
                styles.ingredientText,
                checkedIngredients.has(index) && styles.ingredientTextChecked
              ]}>{name}</Text>
              {amount ? (
                <Text style={[
                  styles.ingredientAmount,
                  checkedIngredients.has(index) && styles.ingredientTextChecked
                ]}>{amount}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addButton} onPress={addToShoppingList}>
          <Ionicons name="cart-outline" size={18} color="#FFF" />
          <Text style={styles.addButtonText}>加入购物清单</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSteps = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>烹饪步骤</Text>
      <View style={styles.listContainer}>
        {recipe?.steps.map((step: any, index: number) => {
          const desc = typeof step === 'string' ? step : step.description;
          const img = typeof step === 'string' ? null : step.image;

          return (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>{desc}</Text>
                {img && (
                  <Image source={{ uri: img }} style={styles.stepImage} resizeMode="cover" />
                )}
              </View>
            </View>
          );
        })}
      </View>
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
      {/* Fixed Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 20 }]} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        
        {/* Author info removed from left, kept in bottom or separate area if needed, 
            but for now user wants Follow/Share on right. 
            We can keep author here but maybe simplify or move Follow button to right explicitly.
            Actually user said "Top bar fixed, follow and share on right".
            Let's keep author on left but ensure Follow is on right. 
        */}
        <TouchableOpacity
          style={styles.topBarAuthor}
          activeOpacity={0.85}
          onPress={() => {
            if (!recipe?.author?.id) return;
            // @ts-ignore
            navigation.navigate('UserDetail', { userId: recipe.author.id });
          }}
        >
          <Image
            source={{ uri: recipe?.author.avatar || 'https://via.placeholder.com/150' }}
            style={styles.topBarAvatar}
          />
          <Text style={styles.topBarAuthorName} numberOfLines={1}>
            {recipe?.author.username}
          </Text>
        </TouchableOpacity>

        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]} 
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? '已关注' : '关注'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, marginTop: insets.top + 4 }} // Add margin to scrollview content so it starts below fixed header
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderRecipeInfo()}
          {renderTags()}
          {renderNutrition()}
          {renderIngredients()}
          {renderSteps()}
          {renderComments()}
        </View>
      </ScrollView>
      
      {recipe && (
        <DetailBottomBar 
          targetId={parseInt(id)}
          targetType="recipe"
          likesCount={likesCount}
          commentsCount={comments.length}
          isCollected={isCollected}
          onCollect={handleCollection}
          onCommentSuccess={handleCommentSuccess}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          currentUserAvatar={currentUser?.avatar}
          onLike={handleLike}
          isLiked={isLiked}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: width, // 1:1 Aspect Ratio
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    marginTop: 60, // Push below Top Bar (approx height)
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
    width: 16,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroImage: {
    width: width,
    height: width, // Match container
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 5,
  },
  videoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF', // Solid background
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarAuthor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 4,
    paddingRight: 12,
    borderRadius: 20,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  topBarAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  followingButton: {
    backgroundColor: '#E0E0E0',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  followingButtonText: {
    color: '#666',
  },
  shareButton: {
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 16, // Positive spacing
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 500,
  },
  headerContent: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsScroll: {
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // Soft rounded
    gap: 6,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ingredientItemChecked: {
    opacity: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11, // Circle
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ingredientText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  ingredientAmount: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
});

export default RecipeDetailPage;
