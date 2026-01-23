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
  // TODO: Fetch from backend API (inventory.ts)
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>冰箱 → 菜谱</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          勾选冰箱里现有的食材，AI帮您解决"今晚吃什么"的难题，同时减少浪费。
        </Text>

        <View style={styles.inventoryContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>冰箱库存</Text>
            <TouchableOpacity onPress={() => setSelectedItems(inventory.map(i => i.id))}>
              <Text style={styles.selectAllText}>全选</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.grid}>
            {inventory.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>{item.name}</Text>
                  <View style={[styles.daysTag, item.daysLeft < 3 && styles.daysTagUrgent]}>
                    <Text style={[styles.daysText, item.daysLeft < 3 && styles.daysTextUrgent]}>
                      剩{item.daysLeft}天
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.buttonDisabled]} 
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>智能推荐 ({selectedItems.length})</Text>
            </>
          )}
        </TouchableOpacity>

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
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  inventoryContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  selectAllText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '31%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  itemCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF0F0',
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  itemNameSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  daysTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  daysTagUrgent: {
    backgroundColor: '#FFEBEE',
  },
  daysText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  daysTextUrgent: {
    color: theme.colors.error,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#E0C3FC',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default FridgeToRecipeFeature;
