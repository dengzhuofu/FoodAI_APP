import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { BlurView } from 'expo-blur';
import { useDraftStore } from '../../store/useDraftStore';

const PublishPage = () => {
  const navigation = useNavigation<any>();
  const drafts = useDraftStore((state) => state.drafts);

  // Get latest draft
  const latestDraft = drafts.length > 0 
    ? [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)[0] 
    : null;

  const handlePostRecipe = () => {
    navigation.navigate('PublishRecipe');
  };

  const handlePostStore = () => {
    navigation.navigate('PublishStore');
  };

  const handleOpenDraft = () => {
    if (!latestDraft) return;
    if (latestDraft.type === 'recipe') {
      navigation.navigate('PublishRecipe', { draftId: latestDraft.id });
    } else {
      navigation.navigate('PublishStore', { draftId: latestDraft.id });
    }
  };

  const handleSeeAll = () => {
    navigation.navigate('DraftBox');
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Light Blur Background */}
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>CREATE</Text>
            <Text style={styles.pageSubtitle}>Share your culinary journey</Text>
          </View>

          <View style={styles.cardsContainer}>
            <TouchableOpacity 
              style={styles.optionCard} 
              onPress={handlePostRecipe}
              activeOpacity={0.9}
            >
              <View style={[styles.cardIconBox, { backgroundColor: '#E0F2F1' }]}>
                <Ionicons name="restaurant" size={32} color="#00C896" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>New Recipe</Text>
                <Text style={styles.cardDesc}>Share your secret ingredients</Text>
              </View>
              <View style={styles.arrowIcon}>
                <Ionicons name="arrow-forward" size={20} color="#00C896" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionCard} 
              onPress={handlePostStore}
              activeOpacity={0.9}
            >
              <View style={[styles.cardIconBox, { backgroundColor: '#E1F5FE' }]}>
                <Ionicons name="location" size={32} color="#29B6F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>New Review</Text>
                <Text style={styles.cardDesc}>Recommend a hidden gem</Text>
              </View>
              <View style={styles.arrowIcon}>
                <Ionicons name="arrow-forward" size={20} color="#29B6F6" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          {latestDraft && (
            <View style={styles.draftSection}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftTitle}>DRAFTS</Text>
                <TouchableOpacity onPress={handleSeeAll}>
                  <Text style={styles.seeAllText}>See All ({drafts.length})</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.draftItem} 
                activeOpacity={0.7}
                onPress={handleOpenDraft}
              >
                <View style={[styles.draftIcon, { backgroundColor: latestDraft.type === 'recipe' ? '#E0F2F1' : '#E1F5FE' }]}>
                  <Ionicons 
                    name={latestDraft.type === 'recipe' ? "restaurant" : "location"} 
                    size={20} 
                    color={latestDraft.type === 'recipe' ? "#00C896" : "#29B6F6"} 
                  />
                </View>
                <View style={styles.draftInfo}>
                  <Text style={styles.draftName} numberOfLines={1}>
                    {latestDraft.title || (latestDraft.type === 'recipe' ? '未命名菜谱' : '未命名探店')}
                  </Text>
                  <Text style={styles.draftTime}>Edited {formatTime(latestDraft.updatedAt)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  mainContent: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    flex: 1,
    marginTop: -40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  pageTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardsContainer: {
    gap: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  cardDesc: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  arrowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    minHeight: 120, // Reserve space to avoid layout jump
    justifyContent: 'flex-end',
  },
  draftSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  draftTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#BBB',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C896',
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  draftIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  draftTime: {
    fontSize: 10,
    color: '#AAA',
  },
});

export default PublishPage;
