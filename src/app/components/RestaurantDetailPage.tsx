import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import VideoDisplay from './VideoDisplay';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/types';
import { getRestaurant, getComments, toggleCollection, Restaurant, Comment, toggleLike, recordView } from '../../api/content';
import { getMe } from '../../api/auth';
import CommentsSection from './CommentsSection';
import DetailBottomBar from './DetailBottomBar';
import { reverseGeocode } from '../../api/maps';
import AmapWebView from './AmapWebView';
import * as Location from 'expo-location';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

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
        setIsLiked(restaurantData.is_liked);
        setIsCollected(restaurantData.is_collected);
        
        if (userData) {
          setCurrentUserId(userData.id);
          setCurrentUser(userData);
        }
        
        // Initial comment fetch
        await fetchComments();
        // Record View
        await recordView(restaurantId, 'restaurant');
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        Alert.alert('错误', '加载餐厅失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!restaurant?.latitude || !restaurant?.longitude) return;
      try {
        const formatted = await reverseGeocode({ location: `${restaurant.longitude},${restaurant.latitude}` });
        setResolvedAddress(formatted);
      } catch (e) {
        setResolvedAddress(null);
      }
    };
    run();
  }, [restaurant?.latitude, restaurant?.longitude]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS !== 'android') return;
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (e) {
        // ignore
      }
    };
    requestLocationPermission();
  }, []);

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

  const handleNavigate = async () => {
    if (!restaurant.latitude || !restaurant.longitude) {
      Alert.alert('提示', '该餐厅暂无坐标信息，无法导航');
      return;
    }

    let currentLocation = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      }
    } catch (e) {
      console.log('Failed to get location before navigation', e);
    }

    (navigation as any).navigate('MapAssistant', {
      destination: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        name: restaurant.title,
        address: resolvedAddress || restaurant.address || '',
      },
      userLocation: currentLocation
    });
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

  const renderMapPreview = () => {
    if (Platform.OS === 'web') return null;
    if (!restaurant.latitude || !restaurant.longitude) return null;

    const destination = { latitude: restaurant.latitude, longitude: restaurant.longitude };

    const initialCenter = userLocation
      ? {
          latitude: (userLocation.latitude + destination.latitude) / 2,
          longitude: (userLocation.longitude + destination.longitude) / 2,
        }
      : destination;

    return (
      <View style={styles.mapContainer}>
        <AmapWebView
          mode="preview"
          initialCenter={initialCenter}
          destination={destination}
          onLocation={(p) => {
            setUserLocation((prev) => prev || { latitude: p.latitude, longitude: p.longitude });
          }}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.imageContainer}>
      {(() => {
        const displayImages = restaurant.images && restaurant.images.length > 0 ? restaurant.images : ['https://via.placeholder.com/400x300'];
        const displayMedia: Array<{ type: 'video' | 'image'; uri: string }> = [];
        if (restaurant.video) displayMedia.push({ type: 'video', uri: restaurant.video });
        for (const img of displayImages) displayMedia.push({ type: 'image', uri: img });
        return (
          <>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
          if (slide !== activeImageIndex) setActiveImageIndex(slide);
        }}
      >
        {displayMedia.map((item, index) =>
          item.type === 'video' ? (
            <View key={`video-${index}`} style={styles.heroImage}>
                <VideoDisplay
                  uri={item.uri}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.videoBadge}>
                    <Ionicons name="videocam" size={14} color="#FFF" />
                    <Text style={styles.videoBadgeText}>Video</Text>
                </View>
            </View>
          ) : (
            <Image 
              key={`img-${index}`}
              source={{ uri: item.uri }} 
              style={styles.heroImage} 
              contentFit="cover" 
            />
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
                activeImageIndex === index ? styles.paginationDotActive : styles.paginationDotInactive
              ]} 
            />
          ))}
        </View>
      )}
          </>
        );
      })()}
    </View>
  );

  const renderRestaurantInfo = () => (
    <View style={styles.headerContent}>
      <Text style={styles.title}>{restaurant.title}</Text>
      <View style={styles.tagContainer}>
        <View style={styles.tagChip}>
          <Ionicons name="star" size={14} color="#666" />
          <Text style={styles.tagChipText}>{restaurant.rating || '-'}</Text>
        </View>
        {restaurant.cuisine ? (
          <View style={styles.tagChip}>
            <Ionicons name="restaurant-outline" size={14} color="#666" />
            <Text style={styles.tagChipText}>{restaurant.cuisine}</Text>
          </View>
        ) : null}
        {restaurant.hours ? (
          <View style={styles.tagChip}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.tagChipText} numberOfLines={1}>{restaurant.hours}</Text>
          </View>
        ) : null}
      </View>
      {restaurant.content ? <Text style={styles.description}>{restaurant.content}</Text> : null}
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
          <Text style={styles.infoText}>{resolvedAddress || restaurant.address || '暂无地址信息'}</Text>
          <TouchableOpacity style={styles.navButton} onPress={handleNavigate} activeOpacity={0.8}>
            <Text style={styles.navButtonText}>地图助手</Text>
          </TouchableOpacity>
        </View>
        
        {renderMapPreview()}

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
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topBarAuthor}
          activeOpacity={0.85}
          onPress={() => {
            if (!restaurant?.author?.id) return;
            // @ts-ignore
            navigation.navigate('UserDetail', { userId: restaurant.author.id });
          }}
        >
          <Image 
            source={{ uri: restaurant?.author.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.topBarAvatar} 
            contentFit="cover"
          />
          <Text style={styles.topBarAuthorName} numberOfLines={1}>
            {restaurant?.author.username}
          </Text>
        </TouchableOpacity>

        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={[styles.followButton, isCollected && styles.followingButton]} 
            onPress={handleCollection}
          >
            <Text style={[styles.followButtonText, isCollected && styles.followingButtonText]}>
              {isCollected ? '已收藏' : '收藏'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, marginTop: insets.top + 60 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderRestaurantInfo()}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,17,0.08)',
  },
  backButton: {
    padding: 8,
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
    height: width, // 1:1
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    marginBottom: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 34,
  },
  content: {
    marginTop: -24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 500,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginRight: 0,
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
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 22,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 56,
  },
  mapContainer: {
    height: 150,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  mapFallbackText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  destinationMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userMarkerOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,122,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  webview: {
    flex: 1,
  },
});

export default RestaurantDetailPage;
