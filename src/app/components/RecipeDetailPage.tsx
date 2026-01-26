import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      {/* Top Bar */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleCollection}
        >
          <Ionicons name={isCollected ? "heart" : "heart-outline"} size={20} color={isCollected ? "#FF6B6B" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerContent}>
        <View style={styles.tagRow}>
          <View style={styles.difficultyTag}>
            <Text style={styles.tagText}>{recipe.difficulty}</Text>
          </View>
          <View style={styles.timeTag}>
            <Ionicons name="time" size={12} color="#FFF" />
            <Text style={styles.tagText}>{recipe.time}</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{recipe.title}</Text>
        
        <View style={styles.authorRow}>
          <Image source={{ uri: recipe.author.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          <Text style={styles.authorName}>{recipe.author.username}</Text>
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
        <Text style={styles.sectionTitle}>NUTRITION</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.calories || '-'}</Text>
            <Text style={styles.nutritionLabel}>CALORIES</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.protein || '-'}</Text>
            <Text style={styles.nutritionLabel}>PROTEIN</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fat || '-'}</Text>
            <Text style={styles.nutritionLabel}>FAT</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.carbs || '-'}</Text>
            <Text style={styles.nutritionLabel}>CARBS</Text>
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
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>Ingredients</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
        onPress={() => setActiveTab('steps')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>Instructions</Text>
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
            {checkedIngredients.has(index) && <Ionicons name="checkmark" size={12} color="#FFF" />}
          </View>
          <Text style={[
            styles.ingredientText,
            checkedIngredients.has(index) && styles.ingredientTextChecked
          ]}>{item}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addToShoppingList}>
        <Ionicons name="cart-outline" size={18} color="#FFF" />
        <Text style={styles.addButtonText}>Add to Shopping List</Text>
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
    backgroundColor: '#F9F9F9',
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
    height: 400, // Taller hero image
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
    height: 240, // Taller gradient for better text readability
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    marginTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', // Lighter, glassy background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)', // Note: This prop is for web, on native it might need expo-blur
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  difficultyTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100, // Fully rounded
  },
  timeTag: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36, // Larger title
    fontWeight: '900', // Black weight
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    lineHeight: 42,
    letterSpacing: -1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
    marginRight: 12,
  },
  authorName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 24,
    marginTop: -32, // More overlap
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 32, // Larger radius
    borderTopRightRadius: 32,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 36,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 20,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F0F0F0',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    color: '#1A1A1A',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0', // Lighter background
    padding: 6,
    borderRadius: 100, // Pill shape
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 100,
  },
  activeTab: {
    backgroundColor: '#1A1A1A', // Black active tab
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF', // White text on black
    fontWeight: '700',
  },
  listContainer: {
    gap: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  ingredientItemChecked: {
    backgroundColor: '#FAFAFA',
    borderColor: 'transparent',
    opacity: 0.5,
    shadowOpacity: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12, // Circle checkbox
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  ingredientText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    fontWeight: '600',
  },
  ingredientTextChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 24,
    marginTop: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    fontWeight: '500',
  },
});

export default RecipeDetailPage;
