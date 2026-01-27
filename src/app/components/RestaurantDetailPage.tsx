import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';
import { getRestaurant, getComments, toggleCollection, Restaurant, Comment, toggleLike, recordView } from '../../api/content';
import { getMe } from '../../api/auth';
import CommentsSection from './CommentsSection';
import DetailBottomBar from './DetailBottomBar';

type RestaurantDetailRouteProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;

const { width } = Dimensions.get('window');

const RestaurantDetailPage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RestaurantDetailRouteProp>();
  const { id } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isCollected, setIsCollected] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const handleLike = async () => {
    try {
      await toggleLike(parseInt(id), 'restaurant');
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      // ignore
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
        const commentsData = await getComments(parseInt(id), 'restaurant');
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to fetch comments', error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantId = parseInt(id);
        const [restaurantData, userData] = await Promise.all([
          getRestaurant(restaurantId),
          getMe().catch(() => null)
        ]);
        setRestaurant(restaurantData);
        setLikesCount(restaurantData.likes_count || 0);
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUser(userData);
        }
        
        // Initial comment fetch
        await fetchComments();
        // Record View
        await recordView(restaurantId, 'restaurant');
        // TODO: Check if collected/liked status
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        Alert.alert('错误', '加载餐厅失败');
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

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={theme.typography.body}>未找到餐厅信息</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    } else {
      Alert.alert('提示', '暂无联系电话');
    }
  };

  const handleCollection = async () => {
    try {
      await toggleCollection(restaurant.id, 'restaurant');
      setIsCollected(!isCollected);
      Alert.alert(isCollected ? '已取消收藏' : '收藏成功');
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  const renderHeader = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: restaurant.images[0] || 'https://via.placeholder.com/400x300' }} style={styles.heroImage} resizeMode="cover" />
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
        <View style={styles.tagContainer}>
          <View style={styles.ratingTag}>
            <Ionicons name="star" size={12} color="#1A1A1A" />
            <Text style={styles.ratingText}>{restaurant.rating || '-'}</Text>
          </View>
          <View style={styles.statusTag}>
            <Text style={styles.statusText}>OPEN NOW</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{restaurant.title}</Text>
        
        <View style={styles.authorRow}>
          <Image source={{ uri: restaurant.author.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          <Text style={styles.authorName}>{restaurant.author.username}</Text>
        </View>
      </View>
    </View>
  );

  const renderInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>INFORMATION</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.infoText}>{restaurant.address || 'No address provided'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="time" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.infoText}>{restaurant.hours || 'No hours provided'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.infoRow} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.iconBox}>
            <Ionicons name="call" size={18} color="#1A1A1A" />
          </View>
          <Text style={styles.infoText}>{restaurant.phone || 'No phone number'}</Text>
          <View style={styles.actionIcon}>
             <Ionicons name="arrow-forward" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComments = () => (
    <CommentsSection 
      comments={comments} 
      targetId={parseInt(id)} 
      targetType="restaurant" 
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
          <Text style={styles.description}>{restaurant.description}</Text>
          {renderInfo()}
          {renderComments()}
        </View>
      </ScrollView>

      {restaurant && (
        <DetailBottomBar 
          targetId={parseInt(id)}
          targetType="restaurant"
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
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 400,
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
    height: 240,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    // backdropFilter: 'blur(10px)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  ratingTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '800',
  },
  statusTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
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
    marginTop: -32,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 32,
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
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    lineHeight: 24,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 56,
  },
});

export default RestaurantDetailPage;
