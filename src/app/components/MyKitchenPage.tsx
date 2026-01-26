import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Modal, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { getFridgeItems, addFridgeItem, updateFridgeItem, deleteFridgeItem, FridgeItem } from '../../api/inventory';
import { uploadFile } from '../../api/upload';
import { recognizeFridge, RecognizedItem } from '../../api/ai';

const { width } = Dimensions.get('window');

const MyKitchenPage = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [inventory, setInventory] = useState<FridgeItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  
  // Edit/Add Item State
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('蔬菜');
  const [itemAmount, setItemAmount] = useState('');
  const [itemDaysLeft, setItemDaysLeft] = useState('');

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<RecognizedItem[]>([]);
  const [scanImage, setScanImage] = useState<string | null>(null);

  const categories = ['全部', '蔬菜', '水果', '肉类', '海鲜', '蛋奶', '速冻', '调料', '饮品', '其他'];
  const itemCategories = categories.filter(c => c !== '全部');

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const fetchInventory = async () => {
    try {
        const items = await getFridgeItems();
        // Calculate daysLeft
        const processedItems = items.map(item => {
            let daysLeft = 0;
            if (item.expiry_date) {
                const today = new Date();
                const expiry = new Date(item.expiry_date);
                const diffTime = expiry.getTime() - today.getTime();
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            }
            return { ...item, daysLeft };
        });
        setInventory(processedItems);
    } catch (error) {
        console.error(error);
    }
  };

  const filteredInventory = activeCategory === '全部' 
    ? inventory 
    : inventory.filter(item => item.category === activeCategory);

  const getStatusColor = (days: number) => {
    if (days <= 2) return '#FF5252';
    if (days <= 5) return '#FFB74D';
    return '#4CAF50';
  };

  const handleOpenModal = (item?: FridgeItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCategory(item.category || '蔬菜');
      setItemAmount(item.quantity || '');
      setItemDaysLeft(item.daysLeft ? item.daysLeft.toString() : '7');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCategory('蔬菜');
      setItemAmount('');
      setItemDaysLeft('7');
    }
    setModalVisible(true);
  };

  const handleDeleteItem = async (id: number) => {
    Alert.alert('确认删除', '确定要删除这个食材吗？', [
        { text: '取消', style: 'cancel' },
        { 
            text: '删除', 
            style: 'destructive', 
            onPress: async () => {
                try {
                    await deleteFridgeItem(id);
                    fetchInventory();
                    setModalVisible(false);
                } catch (error) {
                    Alert.alert('错误', '删除失败');
                }
            }
        }
    ]);
  };

  const handleSaveItem = async () => {
    if (!itemName || !itemDaysLeft) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    const days = parseInt(itemDaysLeft);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const expiry_date = date.toISOString().split('T')[0];

    try {
        if (editingItem) {
             await updateFridgeItem(editingItem.id, {
                name: itemName,
                category: itemCategory,
                quantity: itemAmount || '1份',
                expiry_date: expiry_date,
                icon: getIconForCategory(itemCategory)
             });
        } else {
            await addFridgeItem({
                name: itemName,
                category: itemCategory,
                quantity: itemAmount || '1份',
                expiry_date: expiry_date,
                icon: getIconForCategory(itemCategory)
            });
        }
        
        await fetchInventory();
        setModalVisible(false);
    } catch (error) {
        Alert.alert('错误', '保存失败');
    }
  };

  const getIconForCategory = (cat: string) => {
      switch(cat) {
          case '蔬菜': return '🥬';
          case '水果': return '🍎';
          case '肉类': return '🥩';
          case '海鲜': return '🍤';
          case '蛋奶': return '🥚';
          case '速冻': return '🧊';
          case '调料': return '🧂';
          case '饮品': return '🥤';
          default: return '🥘';
      }
  };

  // Scanning Logic
  const handleScanFridge = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert('需要权限', '请允许访问相册以选择图片');
          return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
          setScanImage(result.assets[0].uri);
          setScanModalVisible(true);
          performRecognition(result.assets[0].uri);
      }
  };

  const performRecognition = async (uri: string) => {
      setIsScanning(true);
      try {
          const imageUrl = await uploadFile(uri);
          const items = await recognizeFridge(imageUrl);
          setScannedItems(items);
      } catch (error) {
          Alert.alert('识别失败', '请稍后再试');
          setScanModalVisible(false);
      } finally {
          setIsScanning(false);
      }
  };

  const handleAddScannedItems = async () => {
      // Add all scanned items to inventory
      // In a real app, user should be able to edit them before adding
      // For now, we just add them all
      try {
          for (const item of scannedItems) {
              const date = new Date();
              date.setDate(date.getDate() + (item.expiry_days || 7));
              const expiry_date = date.toISOString().split('T')[0];
              
              await addFridgeItem({
                  name: item.name,
                  category: '其他', // AI currently doesn't return category, maybe default or guess
                  quantity: item.quantity,
                  expiry_date: expiry_date,
                  icon: item.icon || '🥘'
              });
          }
          await fetchInventory();
          setScanModalVisible(false);
          Alert.alert('成功', `已添加 ${scannedItems.length} 个食材`);
      } catch (error) {
          Alert.alert('错误', '添加食材失败');
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
        <Text style={styles.headerTitle}>我的冰箱</Text>
        <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleScanFridge}>
                <Ionicons name="scan" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.addButton]} onPress={() => handleOpenModal()}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsCard}>
        <LinearGradient
          colors={['#1A1A1A', '#333333']}
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
            <Text style={[styles.statNumber, {color: '#FF5252'}]}>{inventory.filter(i => (i.daysLeft || 0) <= 3).length}</Text>
            <Text style={styles.statLabel}>即将过期</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statAction}
            onPress={() => (navigation as any).navigate('FridgeToRecipe')}
          >
            <Ionicons name="restaurant" size={20} color="white" />
            <Text style={styles.statActionText}>智能做菜</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
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
        {filteredInventory.length > 0 ? (
            <View style={styles.grid}>
                {filteredInventory.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.inventoryItem}
                    onPress={() => handleOpenModal(item)}
                >
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemIcon}>{item.icon || '🥘'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.daysLeft || 0) }]}>
                            <Text style={styles.statusText}>{item.daysLeft}天</Text>
                        </View>
                    </View>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemDetail}>{item.quantity} · {item.category}</Text>
                </TouchableOpacity>
                ))}
            </View>
        ) : (
            <View style={styles.emptyState}>
                <Ionicons name="file-tray-outline" size={48} color="#EEE" />
                <Text style={styles.emptyText}>暂无食材，快去添加吧</Text>
            </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? '编辑食材' : '添加食材'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formItem}>
              <Text style={styles.label}>名称</Text>
              <TextInput 
                style={styles.input} 
                value={itemName} 
                onChangeText={setItemName}
                placeholder="例如：西红柿"
              />
            </View>

            <View style={styles.formRow}>
                <View style={[styles.formItem, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>数量</Text>
                    <TextInput 
                        style={styles.input} 
                        value={itemAmount} 
                        onChangeText={setItemAmount}
                        placeholder="例如：3个"
                    />
                </View>
                <View style={[styles.formItem, { flex: 1 }]}>
                    <Text style={styles.label}>保质期(天)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={itemDaysLeft} 
                        onChangeText={setItemDaysLeft}
                        keyboardType="numeric"
                        placeholder="7"
                    />
                </View>
            </View>

            <View style={styles.formItem}>
                <Text style={styles.label}>分类</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelect}>
                    {itemCategories.map(cat => (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.categoryOption, itemCategory === cat && styles.categoryOptionActive]}
                            onPress={() => setItemCategory(cat)}
                        >
                            <Text style={[styles.categoryOptionText, itemCategory === cat && styles.categoryOptionTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.modalFooter}>
                {editingItem && (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(editingItem.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF5252" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                    <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Scan Modal */}
      <Modal
        animationType="slide"
        visible={scanModalVisible}
        onRequestClose={() => setScanModalVisible(false)}
      >
          <SafeAreaView style={styles.scanModalContainer}>
              <View style={styles.scanHeader}>
                  <TouchableOpacity onPress={() => setScanModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#1A1A1A" />
                  </TouchableOpacity>
                  <Text style={styles.scanTitle}>AI 识别结果</Text>
                  <View style={{ width: 24 }} />
              </View>

              {isScanning ? (
                  <View style={styles.scanningContainer}>
                      <Image source={{ uri: scanImage! }} style={styles.scanningImage} />
                      <View style={styles.scanningOverlay}>
                          <ActivityIndicator size="large" color="#FFF" />
                          <Text style={styles.scanningText}>正在识别冰箱食材...</Text>
                      </View>
                  </View>
              ) : (
                  <View style={styles.scanResultContainer}>
                      <View style={styles.scanImagePreview}>
                         <Image source={{ uri: scanImage! }} style={styles.scanImageSmall} />
                         <Text style={styles.scanSummary}>识别到 {scannedItems.length} 个物品</Text>
                      </View>

                      <ScrollView style={styles.scanList}>
                          {scannedItems.map((item, index) => (
                              <View key={index} style={styles.scanItem}>
                                  <Text style={styles.scanItemIcon}>{item.icon || '🥘'}</Text>
                                  <View style={styles.scanItemInfo}>
                                      <Text style={styles.scanItemName}>{item.name}</Text>
                                      <Text style={styles.scanItemDetail}>{item.quantity} · 约{item.expiry_days}天过期</Text>
                                  </View>
                                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                              </View>
                          ))}
                      </ScrollView>

                      <TouchableOpacity style={styles.confirmScanButton} onPress={handleAddScannedItems}>
                          <Text style={styles.confirmScanText}>确认添加全部</Text>
                      </TouchableOpacity>
                  </View>
              )}
          </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#EEE',
  },
  addButton: {
      backgroundColor: '#1A1A1A',
      borderColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statAction: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 10,
    gap: 6,
  },
  statActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  inventoryList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
  },
  statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
  },
  statusText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '700',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
      alignItems: 'center',
      paddingTop: 40,
  },
  emptyText: {
      marginTop: 16,
      color: '#CCC',
      fontSize: 14,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  formItem: {
      marginBottom: 20,
  },
  formRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      marginBottom: 8,
  },
  input: {
      backgroundColor: '#F9F9F9',
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
      color: '#1A1A1A',
  },
  categorySelect: {
      flexDirection: 'row',
  },
  categoryOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: '#F5F5F5',
      marginRight: 10,
  },
  categoryOptionActive: {
      backgroundColor: '#1A1A1A',
  },
  categoryOptionText: {
      color: '#666',
      fontWeight: '600',
  },
  categoryOptionTextActive: {
      color: 'white',
  },
  modalFooter: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 12,
  },
  deleteButton: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#FFEBEE',
      justifyContent: 'center',
      alignItems: 'center',
  },
  saveButton: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#1A1A1A',
      justifyContent: 'center',
      alignItems: 'center',
  },
  saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
  },

  // Scan Modal
  scanModalContainer: {
      flex: 1,
      backgroundColor: '#FFF',
  },
  scanHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
  },
  scanTitle: {
      fontSize: 18,
      fontWeight: '700',
  },
  scanningContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
  },
  scanningImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      opacity: 0.5,
  },
  scanningOverlay: {
      position: 'absolute',
      alignItems: 'center',
  },
  scanningText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  scanResultContainer: {
      flex: 1,
      padding: 20,
  },
  scanImagePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#F9F9F9',
      padding: 12,
      borderRadius: 12,
  },
  scanImageSmall: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
  },
  scanSummary: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
  },
  scanList: {
      flex: 1,
  },
  scanItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FFF',
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#EEE',
  },
  scanItemIcon: {
      fontSize: 24,
      marginRight: 16,
  },
  scanItemInfo: {
      flex: 1,
  },
  scanItemName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1A1A1A',
      marginBottom: 4,
  },
  scanItemDetail: {
      fontSize: 14,
      color: '#999',
  },
  confirmScanButton: {
      backgroundColor: '#1A1A1A',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 20,
  },
  confirmScanText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
  },
});

export default MyKitchenPage;