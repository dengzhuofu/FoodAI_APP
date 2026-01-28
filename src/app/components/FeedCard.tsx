import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { FeedItem } from '../../api/explore';

interface FeedCardProps {
  item: FeedItem;
  onPress: () => void;
  height?: number;
  style?: ViewStyle;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, onPress, height = 200, style }) => {
  const isRestaurant = item.type === 'restaurant';

  const displayImage = item.image || (item.images && item.images.length > 0 ? item.images[0] : null) || 'https://via.placeholder.com/300';

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: displayImage }} 
          style={[styles.image, { height }]} 
          resizeMode="cover"
        />
        
        {/* Floating Badges */}
        <View style={styles.badgesContainer}>
           {isRestaurant ? (
              <View style={[styles.badge, styles.restaurantBadge]}>
                 <Text style={styles.badgeText}>STORE</Text>
              </View>
           ) : (
             <View style={[styles.badge, styles.recipeBadge]}>
                <Ionicons name="flame" size={10} color="#1A1A1A" />
                <Text style={styles.badgeText}>RECIPE</Text>
             </View>
           )}
           
           <View style={styles.ratingBadge}>
              <Ionicons name="star" size={8} color="#FFD700" />
              <Text style={styles.ratingText}>4.8</Text>
           </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        
        {/* Title Overlay on Image for Magazine Feel */}
        <View style={styles.overlayContent}>
           <Text style={styles.overlayTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
          </View>
          <TouchableOpacity style={styles.likeBtn} onPress={(e) => { e.preventDefault(); /* TODO: Implement direct like on card */ }}>
            <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>
          {/* Add Collection Indicator/Button if needed, for now just keeping like consistent */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.surfaceVariant,
  },
  image: {
    width: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantBadge: {
    backgroundColor: '#FFF',
  },
  recipeBadge: {
    backgroundColor: '#FFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  overlayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 20,
  },
  content: {
    padding: 12,
    backgroundColor: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  authorName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  likeCount: {
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: '700',
  },
});

export default FeedCard;
