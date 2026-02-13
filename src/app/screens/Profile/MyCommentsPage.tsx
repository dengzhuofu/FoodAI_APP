import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getUserComments } from '../../../api/users';
import { Comment } from '../../../api/content';
import { getMe } from '../../../api/auth';
import ScreenHeader from '../../components/ScreenHeader';

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
      <ScreenHeader title="我的评价" />

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
    backgroundColor: '#F6F7FB',
  },
  content: {
    padding: 16,
  },
  centerContent: {
    alignItems: 'center',
    padding: 18,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#8C8C8C',
    marginLeft: 4,
    fontWeight: '700',
  },
  commentText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 18,
  },
  emptyText: {
    color: '#9A9A9A',
    fontWeight: '600',
  },
});

export default MyCommentsPage;
