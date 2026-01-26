import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import { fridgeToRecipe, getHistory, AILog } from '../../../../api/ai';
import { getFridgeItems, FridgeItem } from '../../../../api/inventory';

const FridgeToRecipeFeature = () => {
  const navigation = useNavigation<any>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AILog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inventory, setInventory] = useState<FridgeItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchInventory();
    }, [])
  );

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
        const items = await getFridgeItems();
        // Calculate daysLeft for each item if backend doesn't provide it
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
        console.error('Failed to fetch inventory', error);
    } finally {
        setLoadingInventory(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory(5, 0, 'fridge-to-recipe');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleSelection = (name: string) => {
    if (selectedItems.includes(name)) {
      setSelectedItems(selectedItems.filter(item => item !== name));
    } else {
      setSelectedItems([...selectedItems, name]);
    }
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('请选择食材', '请至少选择一种冰箱中的食材');
      return;
    }

    setLoading(true);
    try {
      const data = await fridgeToRecipe(selectedItems);
      navigation.navigate('GeneratedRecipeResult', { recipe: data.result, logId: data.log_id });
      fetchHistory(); // Refresh history
    } catch (error) {
      Alert.alert('生成失败', '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (item: AILog) => {
    if (item.output_result) {
      navigation.navigate('GeneratedRecipeResult', { recipe: item.output_result, logId: item.id });
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
            <TouchableOpacity onPress={() => setSelectedItems(inventory.map(i => i.name))}>
              <Text style={styles.actionText}>全选</Text>
            </TouchableOpacity>
          </View>
          
          {loadingInventory ? (
             <ActivityIndicator color="#1A1A1A" style={{ marginVertical: 20 }} />
          ) : inventory.length === 0 ? (
             <View style={styles.emptyState}>
                 <Ionicons name="cube-outline" size={48} color="#CCC" />
                 <Text style={styles.emptyStateText}>冰箱空空如也，快去添加食材吧</Text>
                 <TouchableOpacity 
                    style={styles.goToFridgeButton}
                    onPress={() => navigation.navigate('MyKitchen')}
                 >
                     <Text style={styles.goToFridgeText}>去管理冰箱</Text>
                 </TouchableOpacity>
             </View>
          ) : (
            <View style={styles.grid}>
                {inventory.map((item) => {
                const isSelected = selectedItems.includes(item.name);
                const isUrgent = (item.daysLeft || 0) <= 3;
                
                return (
                    <TouchableOpacity 
                    key={item.id} 
                    style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                    onPress={() => toggleSelection(item.name)}
                    activeOpacity={0.8}
                    >
                    <Text style={styles.itemIcon}>{item.icon || '🥘'}</Text>
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
          )}

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>推荐记录</Text>
            {loadingHistory ? (
              <ActivityIndicator color="#1A1A1A" style={{ marginTop: 20 }} />
            ) : history.length > 0 ? (
              <View style={styles.historyList}>
                {history.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyItem}
                    onPress={() => handleHistoryPress(item)}
                  >
                    <View style={styles.historyIcon}>
                      {item.output_result?.image_url ? (
                        <Image source={{ uri: item.output_result.image_url }} style={styles.historyImage} />
                      ) : (
                        <Ionicons name="nutrition-outline" size={20} color="#666" />
                      )}
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.output_result?.title || item.input_summary || '未命名推荐'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CCC" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHistoryText}>暂无推荐记录</Text>
            )}
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
  historySection: {
    marginTop: 24,
    marginBottom: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  historyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#999',
    fontSize: 14,
  },
  goToFridgeButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goToFridgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FridgeToRecipeFeature;
