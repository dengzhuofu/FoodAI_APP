import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Modal, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { getFridgeItems, addFridgeItem, updateFridgeItem, deleteFridgeItem, FridgeItem } from '../../api/inventory';

const { width } = Dimensions.get('window');

const MyKitchenPage = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [inventory, setInventory] = useState<FridgeItem[]>([]);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('蔬菜');
  const [itemAmount, setItemAmount] = useState('');
  const [itemDaysLeft, setItemDaysLeft] = useState('');

  const categories = ['全部', '蔬菜', '水果', '肉类', '海鲜', '乳蛋', '调料'];
  const formCategories = ['蔬菜', '水果', '肉类', '海鲜', '乳蛋', '调料'];

  const fetchInventory = async () => {
    try {
      const items = await getFridgeItems();
      // Calculate daysLeft if backend doesn't provide it directly, or assume backend provides it.
      // For now, assuming backend provides expiry_date, we might need to calc daysLeft.
      // But let's assume for simplicity we map it or backend sends it.
      // If backend sends expiry_date (YYYY-MM-DD), we calculate daysLeft.
      
      const mappedItems = items.map(item => {
        let daysLeft = 0;
        if (item.expiry_date) {
            const today = new Date();
            const expiry = new Date(item.expiry_date);
            const diffTime = expiry.getTime() - today.getTime();
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }
        return { ...item, daysLeft };
      });
      setInventory(mappedItems);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const filteredInventory = activeCategory === '全部' 
    ? inventory 
    : inventory.filter(item => item.category === activeCategory);

  const getStatusColor = (days: number) => {
    if (days <= 2) return theme.colors.error;
    if (days <= 5) return theme.colors.warning;
    return theme.colors.success;
  };

  const handleOpenModal = (item?: FridgeItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCategory(item.category || '蔬菜');
      setItemAmount(item.quantity || '');
      setItemDaysLeft(item.daysLeft?.toString() || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCategory('蔬菜');
      setItemAmount('');
      setItemDaysLeft('');
    }
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!itemName || !itemDaysLeft) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    // Calculate expiry date from daysLeft
    const days = parseInt(itemDaysLeft);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const expiry_date = date.toISOString().split('T')[0];

    try {
        // Currently only supporting Add, Edit logic would need a PUT endpoint which we didn't define in inventory.ts yet for Fridge.
        // Assuming we only add new items or delete for now as per previous implementation logic in frontend was simple.
        // But wait, frontend had edit logic. Let's stick to Add for new, and maybe skip Edit for now or implement Delete+Add.
        
        if (editingItem) {
             await updateFridgeItem(editingItem.id, {
                name: itemName,
                category: itemCategory,
                quantity: itemAmount || '1份',
                expiry_date: expiry_date,
                icon: '🥘' // Default icon
             });
        } else {
            await addFridgeItem({
                name: itemName,
                category: itemCategory,
                quantity: itemAmount || '1份',
                expiry_date: expiry_date,
                icon: '🥘' // Default icon
            });
        }
        
        await fetchInventory();
        setModalVisible(false);
    } catch (error) {
        Alert.alert('错误', '保存失败');
    }
  };

  const handleDeleteItem = () => {
    if (editingItem) {
      Alert.alert('确认删除', '确定要删除这个食材吗？', [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: async () => {
            try {
                await deleteFridgeItem(editingItem.id);
                await fetchInventory();
                setModalVisible(false);
            } catch (error) {
                Alert.alert('错误', '删除失败');
            }
          }
        }
      ]);
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[
        styles.categoryChip, 
        activeCategory === item && styles.categoryChipActive
      ]}
      onPress={() => setActiveCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        activeCategory === item && styles.categoryTextActive
      ]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>我的冰箱</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsGradient}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{inventory.length}</Text>
            <Text style={styles.statLabel}>总库存</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{inventory.filter(i => (i.daysLeft || 0) <= 3).length}</Text>
            <Text style={styles.statLabel}>即将过期</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statAction}
            onPress={() => (navigation as any).navigate('FridgeToRecipe')}
          >
            <Ionicons name="restaurant" size={24} color="white" />
            <Text style={styles.statActionText}>智能做菜</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <ScrollView contentContainerStyle={styles.inventoryList}>
        {filteredInventory.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.inventoryItem}
            onPress={() => handleOpenModal(item)}
          >
            <View style={styles.itemIconContainer}>
              <Text style={styles.itemIcon}>{item.icon || '🥘'}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemAmount}>{item.quantity} • {item.category}</Text>
            </View>
            <View style={styles.itemStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.daysLeft || 0) }]} />
              <Text style={[styles.daysLeft, { color: getStatusColor(item.daysLeft || 0) }]}>
                剩 {item.daysLeft} 天
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {filteredInventory.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无此类食材</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? '编辑食材' : '添加食材'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.imagePicker}>
                 <Ionicons name="camera" size={32} color={theme.colors.textSecondary} />
                 <Text style={styles.imagePickerText}>点击上传图片</Text>
              </View>

              <Text style={styles.label}>食材名称</Text>
              <TextInput
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
                placeholder="例如：鸡蛋"
              />

              <Text style={styles.label}>分类</Text>
              <View style={styles.categorySelect}>
                {formCategories.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catOption, itemCategory === cat && styles.catOptionActive]}
                    onPress={() => setItemCategory(cat)}
                  >
                    <Text style={[styles.catOptionText, itemCategory === cat && styles.catOptionTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>数量</Text>
                  <TextInput
                    style={styles.input}
                    value={itemAmount}
                    onChangeText={setItemAmount}
                    placeholder="例如：1个"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>保质期(天)</Text>
                  <TextInput
                    style={styles.input}
                    value={itemDaysLeft}
                    onChangeText={setItemDaysLeft}
                    placeholder="3"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingItem && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteItem}>
                  <Text style={styles.deleteButtonText}>删除</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: theme.spacing.sm,
  },
  statsCard: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  statsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  inventoryList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  imagePicker: {
    height: 150,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catOptionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  catOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
    paddingBottom: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 0.4,
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyKitchenPage;
