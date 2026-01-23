import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { BlurView } from 'expo-blur';

const PublishPage = () => {
  const navigation = useNavigation();

  const handlePostRecipe = () => {
    navigation.navigate('PublishRecipe');
  };

  const handlePostStore = () => {
    navigation.navigate('PublishStore');
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={32} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.titleContainer}>
            <Text style={theme.typography.h1}>发布内容</Text>
            <Text style={styles.subtitle}>记录美食，分享生活</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.optionButton} onPress={handlePostRecipe}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
                <Ionicons name="restaurant" size={32} color="white" />
              </View>
              <Text style={styles.optionTitle}>发菜谱</Text>
              <Text style={styles.optionDesc}>分享烹饪心得</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handlePostStore}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFA502' }]}>
                <Ionicons name="location" size={32} color="white" />
              </View>
              <Text style={styles.optionTitle}>发探店</Text>
              <Text style={styles.optionDesc}>记录美味足迹</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.draftsContainer}>
          <View style={styles.draftHeader}>
            <Text style={styles.draftTitle}>草稿箱</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </View>
          <TouchableOpacity style={styles.draftItem}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' }} 
              style={styles.draftImage} 
            />
            <View style={styles.draftInfo}>
              <Text style={styles.draftName}>未命名的菜谱草稿</Text>
              <Text style={styles.draftTime}>上次编辑：2小时前</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-end',
    zIndex: 10,
  },
  closeButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  optionButton: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  draftsContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  draftTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.md,
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  draftTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default PublishPage;
