import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Comment } from '../../api/content';
import { BASE_URL } from '../../api/client';

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
  
  const ReplyItem = ({ item, allReplies }: { item: Comment, allReplies: Comment[] }) => {
    let parentUser = null;
    if (item.level && item.level > 1 && item.parent_id) {
      const parentComment = allReplies.find(c => c.id === item.parent_id);
      if (parentComment) parentUser = parentComment.user;
    }

    return (
      <View style={styles.replyRow}>
        <Image 
          source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} 
          style={styles.replyAvatar} 
        />
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
              <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
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
        <Image 
          source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
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
              {new Date(item.created_at).toLocaleDateString()}
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  contentColumn: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  commentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#CCC',
    marginRight: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  likeButton: {
    paddingLeft: 12,
    paddingTop: 4,
  },
  // Replies
  repliesContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  replyRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  replyUsername: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  replyArrow: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 4,
  },
  replyImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expandText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginRight: 4,
    fontWeight: '500',
  },
});

export default CommentsSection;
