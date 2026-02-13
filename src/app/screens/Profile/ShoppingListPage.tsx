import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, ShoppingItem } from '../../../api/inventory';
import ScreenHeader from '../../components/ScreenHeader';

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
      <ScreenHeader title="购物清单" />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="添加需要购买的食材..."
          placeholderTextColor="#A0A0A0"
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
    backgroundColor: '#F6F7FB',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    marginRight: 12,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00C896',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.6,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  listCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#FAFAFA',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  checkbox: {
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
    fontWeight: '700',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#9A9A9A',
  },
  itemCategory: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
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

export default ShoppingListPage;
