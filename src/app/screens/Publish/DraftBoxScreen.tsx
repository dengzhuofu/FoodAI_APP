import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDraftStore, Draft } from '../../../store/useDraftStore';
import { theme } from '../../styles/theme';

const DraftBoxScreen = () => {
  const navigation = useNavigation<any>();
  const { drafts, removeDraft } = useDraftStore();

  const handlePress = (draft: Draft) => {
    if (draft.type === 'recipe') {
      navigation.navigate('PublishRecipe', { draftId: draft.id });
    } else {
      navigation.navigate('PublishStore', { draftId: draft.id });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      '删除草稿',
      '确定要删除这个草稿吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: () => removeDraft(id) 
        }
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: Draft }) => {
    const isRecipe = item.type === 'recipe';
    const title = item.title || (isRecipe ? '未命名菜谱' : '未命名探店');
    const coverImage = item.images && item.images.length > 0 
        ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].uri)
        : null;

    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
            {/* Thumbnail */}
            <View style={styles.thumbnail}>
                {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.image} />
                ) : (
                    <View style={[styles.placeholder, { backgroundColor: isRecipe ? '#E0F2F1' : '#E1F5FE' }]}>
                        <Ionicons 
                            name={isRecipe ? "restaurant" : "location"} 
                            size={24} 
                            color={isRecipe ? "#00C896" : "#29B6F6"} 
                        />
                    </View>
                )}
                <View style={[styles.typeBadge, { backgroundColor: isRecipe ? '#00C896' : '#29B6F6' }]}>
                    <Ionicons 
                        name={isRecipe ? "restaurant" : "location"} 
                        size={10} 
                        color="#FFF" 
                    />
                </View>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.time}>上次编辑: {formatTime(item.updatedAt)}</Text>
                <Text style={styles.desc} numberOfLines={1}>
                    {isRecipe 
                        ? (item.description || '暂无描述') 
                        : ((item as any).content || '暂无描述')
                    }
                </Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleDelete(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>草稿箱</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={drafts.sort((a, b) => b.updatedAt - a.updatedAt)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color="#DDD" />
                <Text style={styles.emptyText}>没有草稿</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#666',
  },
  deleteBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#BBB',
  },
});

export default DraftBoxScreen;
