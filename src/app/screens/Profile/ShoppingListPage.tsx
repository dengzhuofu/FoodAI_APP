import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, ShoppingItem } from '../../../api/inventory';

const ShoppingListPage = () => {
  const navigation = useNavigation();
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const fetchItems = async () => {
    try {
      const data = await getShoppingList();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch shopping list", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const toggleItem = async (item: ShoppingItem) => {
    try {
      // Optimistic update
      const updatedItems = items.map(i => 
        i.id === item.id ? { ...i, is_bought: !i.is_bought } : i
      );
      setItems(updatedItems);

      await updateShoppingItem(item.id, { is_bought: !item.is_bought });
    } catch (error) {
      console.error("Failed to update item", error);
      fetchItems(); // Revert on error
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      await addShoppingItem({ name: newItem, category: '未分类' });
      setNewItem('');
      fetchItems();
    } catch (error) {
      Alert.alert('错误', '添加失败');
    }
  };

  const deleteItem = async (id: number) => {
    try {
      setItems(items.filter(item => item.id !== id)); // Optimistic
      await deleteShoppingItem(id);
    } catch (error) {
      fetchItems(); // Revert
    }
  };

  const pendingItems = items.filter(i => !i.is_bought);
  const completedItems = items.filter(i => i.is_bought);

  const renderItem = (item: ShoppingItem) => (
    <View key={item.id} style={styles.itemRow}>
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={() => toggleItem(item)}
      >
        <Ionicons 
          name={item.is_bought ? "checkbox" : "square-outline"} 
          size={24} 
          color={item.is_bought ? theme.colors.textSecondary : theme.colors.primary} 
        />
      </TouchableOpacity>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.is_bought && styles.itemNameChecked]}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>购物清单</Text>
        <TouchableOpacity style={styles.clearButton} onPress={() => {}}>
          {/* Clear function could be implemented to delete all checked items */}
          <Text style={styles.clearText}></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="添加需要购买的食材..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>待购买 ({pendingItems.length})</Text>
          {pendingItems.length > 0 ? (
            <View style={styles.listCard}>
              {pendingItems.map(renderItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>没有待购物品</Text>
            </View>
          )}
        </View>

        {completedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>已购买 ({completedItems.length})</Text>
            <View style={[styles.listCard, styles.listCardCompleted]}>
              {completedItems.map(renderItem)}
            </View>
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
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  clearText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginRight: theme.spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  listCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  listCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#F8F9FA',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkbox: {
    marginRight: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  itemCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
});

export default ShoppingListPage;
