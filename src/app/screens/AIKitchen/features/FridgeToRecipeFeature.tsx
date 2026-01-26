import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { fridgeToRecipe } from '../../../../api/ai';

const FridgeToRecipeFeature = () => {
  const navigation = useNavigation<any>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock fridge inventory
  const inventory = [
    { id: '鸡蛋', name: '鸡蛋', daysLeft: 5, icon: '🥚' },
    { id: '西红柿', name: '西红柿', daysLeft: 3, icon: '🍅' },
    { id: '洋葱', name: '洋葱', daysLeft: 7, icon: '🧅' },
    { id: '土豆', name: '土豆', daysLeft: 10, icon: '🥔' },
    { id: '牛肉', name: '牛肉', daysLeft: 2, icon: '🥩' },
    { id: '青椒', name: '青椒', daysLeft: 4, icon: '🫑' },
  ];

  const toggleSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('请选择食材', '请至少选择一种冰箱中的食材');
      return;
    }

    setLoading(true);
    try {
      const result = await fridgeToRecipe(selectedItems);
      navigation.navigate('GeneratedRecipeResult', { recipe: result });
    } catch (error) {
      Alert.alert('生成失败', '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>冰箱管家</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>选择库存食材</Text>
            <TouchableOpacity onPress={() => setSelectedItems(inventory.map(i => i.id))}>
              <Text style={styles.actionText}>全选</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.grid}>
            {inventory.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const isUrgent = item.daysLeft <= 3;
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => toggleSelection(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>{item.name}</Text>
                  
                  {isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>即将过期</Text>
                    </View>
                  )}
                  
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#1A1A1A" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.buttonDisabled]} 
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>生成推荐 ({selectedItems.length})</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  actionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  itemCardSelected: {
    borderColor: '#1A1A1A',
    backgroundColor: '#FFF',
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemNameSelected: {
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  urgentBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  urgentText: {
    color: '#FF5252',
    fontSize: 10,
    fontWeight: '700',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  generateButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default FridgeToRecipeFeature;
