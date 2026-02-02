import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { followUser, getUserPosts, getUserPublicProfile, unfollowUser, UserPublicProfile } from '../../../api/users';

const UserDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId: number = route.params?.userId;

  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'recipe' | 'restaurant'>('recipe');
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const genderText = useMemo(() => {
    const g = profile?.gender;
    if (!g) return '未知';
    if (g === 'male') return '男';
    if (g === 'female') return '女';
    return String(g);
  }, [profile?.gender]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserPublicProfile(userId);
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, [userId]);

  const fetchPosts = useCallback(
    async (pageNum: number, mode: 'reset' | 'append') => {
      if (!userId) return;
      if (mode === 'append') setLoadingMore(true);
      try {
        const data = await getUserPosts(userId, activeTab, pageNum);
        if (mode === 'reset') setPosts(data);
        else setPosts(prev => [...prev, ...data]);
        setHasMore(data.length >= 20);
        setPage(pageNum);
      } catch {
        if (mode === 'reset') setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, activeTab]
  );

  useEffect(() => {
    setLoading(true);
    fetchProfile().finally(() => {
      fetchPosts(1, 'reset');
    });
  }, [fetchProfile, activeTab, fetchPosts]);

  const toggleFollow = useCallback(async () => {
    if (!profile) return;
    const next = !profile.is_following;
    setProfile({ ...profile, is_following: next, followers_count: profile.followers_count + (next ? 1 : -1) });
    try {
      if (next) await followUser(profile.id);
      else await unfollowUser(profile.id);
    } catch {
      setProfile(profile);
    }
  }, [profile]);

  const goChat = useCallback(() => {
    if (!profile) return;
    navigation.navigate('Chat', {
      peerUserId: profile.id,
      peerNickname: profile.nickname,
      peerAvatar: profile.avatar,
    });
  }, [navigation, profile]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchPosts(page + 1, 'append');
  }, [hasMore, loadingMore, fetchPosts, page]);

  const header = (
    <View style={styles.headerWrap}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{profile?.nickname || '用户详情'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/120' }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.nickname} numberOfLines={1}>{profile?.nickname || '--'}</Text>
              <View style={styles.uidPill}>
                <Text style={styles.uidText}>UID {profile?.uid ?? '--'}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Ionicons name="male-female" size={12} color="#111" />
                <Text style={styles.metaText}>{genderText}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="at" size={12} color="#111" />
                <Text style={styles.metaText}>{profile?.username || '--'}</Text>
              </View>
            </View>
            <Text style={styles.bio} numberOfLines={3}>{profile?.bio || '这个人很神秘，什么都没留下。'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{profile?.following_count ?? 0}</Text>
            <Text style={styles.statLabel}>关注</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{profile?.followers_count ?? 0}</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{(profile?.recipes_count ?? 0) + (profile?.restaurants_count ?? 0)}</Text>
            <Text style={styles.statLabel}>发布</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={toggleFollow}
            style={[styles.primaryBtn, profile?.is_following ? styles.primaryBtnGhost : styles.primaryBtnSolid]}
            activeOpacity={0.9}
          >
            <Ionicons name={profile?.is_following ? 'checkmark' : 'add'} size={16} color={profile?.is_following ? '#111' : '#FFF'} />
            <Text style={[styles.primaryBtnText, profile?.is_following ? styles.primaryBtnTextGhost : styles.primaryBtnTextSolid]}>
              {profile?.is_following ? '已关注' : '关注'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goChat} style={styles.secondaryBtn} activeOpacity={0.9}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#111" />
            <Text style={styles.secondaryBtnText}>发私信</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('recipe')} style={[styles.tab, activeTab === 'recipe' && styles.tabActive]} activeOpacity={0.9}>
          <Text style={[styles.tabText, activeTab === 'recipe' && styles.tabTextActive]}>菜谱</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('restaurant')} style={[styles.tab, activeTab === 'restaurant' && styles.tabActive]} activeOpacity={0.9}>
          <Text style={[styles.tabText, activeTab === 'restaurant' && styles.tabTextActive]}>探店</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate(activeTab === 'recipe' ? 'RecipeDetail' : 'RestaurantDetail', { id: item.id.toString() })}
    >
      <Image
        source={{ uri: activeTab === 'recipe' ? (item.cover_image || item.images?.[0]) : (item.images?.[0] || 'https://via.placeholder.com/240') }}
        style={styles.postImage}
      />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>{item.title || item.name}</Text>
        <View style={styles.postMeta}>
          <Ionicons name="heart" size={12} color="#FF4D4F" />
          <Text style={styles.postMetaText}>{item.likes_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {loading && !profile ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.columnWrap}
            ListHeaderComponent={header}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={theme.colors.primary} /> : null}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name={activeTab === 'recipe' ? 'restaurant-outline' : 'map-outline'} size={46} color="#DDD" />
                  <Text style={styles.emptyText}>暂无发布</Text>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  safeArea: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerWrap: { backgroundColor: '#FFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#111' },
  profileCard: {
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...theme.shadows.sm,
  },
  profileRow: { flexDirection: 'row', gap: 12 },
  avatar: { width: 74, height: 74, borderRadius: 20, backgroundColor: '#EEE' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nickname: { flex: 1, fontSize: 18, fontWeight: '900', color: '#111' },
  uidPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F6F6F3' },
  uidText: { fontSize: 11, fontWeight: '800', color: '#111' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 10, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  metaText: { fontSize: 11, fontWeight: '700', color: '#111' },
  bio: { fontSize: 13, lineHeight: 18, color: '#6F6F6F' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 26, backgroundColor: 'rgba(0,0,0,0.06)' },
  statNum: { fontSize: 16, fontWeight: '900', color: '#111' },
  statLabel: { fontSize: 11, color: '#8A8A8A', marginTop: 4, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnSolid: { backgroundColor: '#111' },
  primaryBtnGhost: { backgroundColor: '#FFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  primaryBtnText: { fontSize: 13, fontWeight: '900' },
  primaryBtnTextSolid: { color: '#FFF' },
  primaryBtnTextGhost: { color: '#111' },
  secondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '900', color: '#111' },
  tabs: { flexDirection: 'row', marginTop: 14, marginHorizontal: 14, marginBottom: 8, gap: 8 },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: '#111', borderColor: '#111' },
  tabText: { fontSize: 13, fontWeight: '900', color: '#111' },
  tabTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 14, paddingBottom: 18 },
  columnWrap: { justifyContent: 'space-between' },
  postCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: { width: '100%', height: 170, backgroundColor: '#F5F5F5' },
  postInfo: { padding: 10 },
  postTitle: { fontSize: 13, fontWeight: '800', color: '#111', lineHeight: 18, height: 36 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  postMetaText: { fontSize: 11, color: '#999', fontWeight: '800' },
  emptyWrap: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 10, fontSize: 13, color: '#AAA', fontWeight: '700' },
});

export default UserDetailScreen;

