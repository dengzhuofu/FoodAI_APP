import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFollowers, getFollowing } from '../../../api/users';
import { theme } from '../../styles/theme';
import ScreenHeader from '../../components/ScreenHeader';

const UserListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { userId, type, title } = route.params; // type: 'followers' | 'following'
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      let data = [];
      if (type === 'followers') {
        data = await getFollowers(userId, page);
      } else {
        data = await getFollowing(userId, page);
      }
      
      // Assume data is list of users
      // Ideally we also want to know "is_following" status for each user to show button state
      // For now we just load users
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, type]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userItem}
      activeOpacity={0.85}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('UserDetail', { userId: item.id });
      }}
    >
      <Image source={{ uri: item.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.nickname || item.username}</Text>
        <Text style={styles.bio} numberOfLines={1}>{item.bio || 'No bio'}</Text>
      </View>
      <View style={styles.actionButton}>
        <Text style={styles.actionText}>查看</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={title} />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无用户</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  listContent: {
    padding: 16,
    paddingTop: 14,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  bio: {
    fontSize: 13,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
  },
  actionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#9A9A9A',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default UserListScreen;
