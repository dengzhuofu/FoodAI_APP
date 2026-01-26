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
      <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
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
              <View style={[styles.cardIconBox, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="restaurant" size={32} color="#FF6B6B" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>New Recipe</Text>
                <Text style={styles.cardDesc}>Share your secret ingredients and cooking steps</Text>
              </View>
              <View style={styles.arrowIcon}>
                <Ionicons name="arrow-forward" size={20} color="#1A1A1A" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionCard} 
              onPress={handlePostStore}
              activeOpacity={0.9}
            >
              <View style={[styles.cardIconBox, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="location" size={32} color="#FFA502" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>New Review</Text>
                <Text style={styles.cardDesc}>Recommend a restaurant or a hidden gem</Text>
              </View>
              <View style={styles.arrowIcon}>
                <Ionicons name="arrow-forward" size={20} color="#1A1A1A" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.draftSection}>
            <View style={styles.draftHeader}>
              <Text style={styles.draftTitle}>DRAFTS</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.draftItem}>
              <View style={styles.draftIcon}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
              </View>
              <View style={styles.draftInfo}>
                <Text style={styles.draftName}>Untitled Recipe</Text>
                <Text style={styles.draftTime}>Edited 2 hours ago</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCC" />
            </TouchableOpacity>
          </View>
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
    fontSize: 48,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardsContainer: {
    gap: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  cardIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  draftSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    padding: 20,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  draftTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
  },
  draftIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  draftInfo: {
    flex: 1,
  },
  draftName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  draftTime: {
    fontSize: 11,
    color: '#999',
  },
});

export default PublishPage;
