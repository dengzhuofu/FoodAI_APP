import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getUserComments } from '../../../api/users';
import { Comment } from '../../../api/content';
import { getMe } from '../../../api/auth';

const MyCommentsPage = () => {
  const navigation = useNavigation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const user = await getMe();
      if (user) {
        const data = await getUserComments(user.id);
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch user comments", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>我的评价</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
           <View style={styles.centerContent}>
             <Text style={theme.typography.caption}>加载中...</Text>
           </View>
        ) : comments.length > 0 ? (
          comments.map((item) => (
            <View key={item.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                 <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                 {item.rating && (
                   <View style={styles.ratingContainer}>
                     <Ionicons name="star" size={12} color="#FFD700" />
                     <Text style={styles.ratingText}>{item.rating}</Text>
                   </View>
                 )}
              </View>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>还没有发表过评价</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centerContent: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  commentCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
});

export default MyCommentsPage;
