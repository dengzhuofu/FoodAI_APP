import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Comment } from '../../api/content';
import { BASE_URL } from '../../api/client';
import { formatDate } from '../../utils/date';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CommentsSectionProps {
  comments: Comment[];
  targetId: number;
  targetType: 'recipe' | 'restaurant';
  onRefresh: (newComment?: Comment) => void;
  currentUserId?: number;
  onReply: (comment: Comment) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, targetId, targetType, onRefresh, currentUserId, onReply }) => {
  const navigation = useNavigation<any>();
  
  const ReplyItem = ({ item, allReplies }: { item: Comment, allReplies: Comment[] }) => {
    let parentUser = null;
    if (item.level && item.level > 1 && item.parent_id) {
      const parentComment = allReplies.find(c => c.id === item.parent_id);
      if (parentComment) parentUser = parentComment.user;
    }

    return (
      <View style={styles.replyRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('UserDetail', { userId: item.user.id });
          }}
        >
          <Image 
            source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.replyAvatar} 
          />
        </TouchableOpacity>
        <View style={styles.contentColumn}>
           <View style={styles.usernameRow}>
             <Text style={styles.replyUsername}>{item.user.username}</Text>
             {parentUser && (
                <>
                  <Text style={styles.replyArrow}> 回复 </Text>
                  <Text style={styles.replyUsername}>{parentUser.username}</Text>
                </>
             )}
           </View>
           
           <Text style={styles.commentText}>{item.content}</Text>
           
           {item.images && item.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {item.images.map((img, index) => (
                <Image 
                  key={index}
                  source={{ uri: img.startsWith('http') ? img : `${BASE_URL}${img}` }} 
                  style={styles.replyImage} 
                />
              ))}
            </View>
           )}
           
           <View style={styles.footerRow}>
              <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
              <TouchableOpacity onPress={() => onReply(item)}>
                 <Text style={styles.actionText}>回复</Text>
              </TouchableOpacity>
           </View>
        </View>
        
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={14} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  const MainCommentItem = ({ item }: { item: Comment }) => {
    const [expanded, setExpanded] = useState(false);
    const replies = item.replies || [];
    const hasMore = replies.length > 2;
    const displayedReplies = expanded ? replies : replies.slice(0, 2);

    const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    };

    return (
      <View style={styles.commentRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('UserDetail', { userId: item.user.id });
          }}
        >
          <Image 
            source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <View style={styles.contentColumn}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.commentText}>{item.content}</Text>
          
          {item.images && item.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {item.images.map((img, index) => (
                <Image 
                  key={index}
                  source={{ uri: img.startsWith('http') ? img : `${BASE_URL}${img}` }} 
                  style={styles.commentImage} 
                />
              ))}
            </View>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.dateText}>
              {formatDate(item.created_at)}
            </Text>
            <TouchableOpacity onPress={() => onReply(item)}>
              <Text style={styles.actionText}>
                {currentUserId && item.user.id === currentUserId ? '追评' : '回复'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Replies Section */}
          {replies.length > 0 && (
            <View style={styles.repliesContainer}>
               {displayedReplies.map(r => (
                 <ReplyItem key={r.id} item={r} allReplies={replies} />
               ))}
               
               {hasMore && (
                 <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                    <Text style={styles.expandText}>
                      {expanded ? '收起回复' : `展开 ${replies.length - 2} 条回复`}
                    </Text>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={12} color={theme.colors.primary} />
                 </TouchableOpacity>
               )}
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>评论 ({comments.length})</Text>
      
      {comments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暂无评论，快来抢沙发吧！</Text>
        </View>
      ) : (
        comments.map(comment => <MainCommentItem key={comment.id} item={comment} />)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 24,
    paddingHorizontal: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  contentColumn: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 6,
  },
  commentText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  commentImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginRight: 16,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  likeButton: {
    paddingLeft: 16,
    paddingTop: 4,
  },
  // Replies
  repliesContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  replyRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  replyUsername: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  replyArrow: {
    fontSize: 10,
    color: '#999',
    marginHorizontal: 6,
  },
  replyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 12,
    color: '#1A1A1A',
    marginRight: 4,
    fontWeight: '700',
  },
});

export default CommentsSection;
