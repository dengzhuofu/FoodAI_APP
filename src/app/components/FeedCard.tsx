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

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
          style={[styles.image, { height }]} 
          resizeMode="cover"
        />
        {isRestaurant && (
          <View style={styles.typeTag}>
            <Ionicons name="restaurant" size={10} color="#FFF" />
            <Text style={styles.typeTagText}>餐厅</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageGradient}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <Text style={styles.authorName} numberOfLines={1}>{item.author}</Text>
          </View>
          <View style={styles.likeInfo}>
            <Ionicons name="heart" size={12} color={theme.colors.primary} />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.surfaceVariant,
  },
  image: {
    width: '100%',
  },
  typeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  content: {
    padding: 10,
  },
  title: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 20,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
  },
  authorName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  likeCount: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default FeedCard;
