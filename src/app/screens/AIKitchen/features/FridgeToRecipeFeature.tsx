import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../styles/theme';
import { fridgeToRecipe, getHistory, AILog } from '../../../../api/ai';
import { getFridgeItems, FridgeItem } from '../../../../api/inventory';
import AIGeneratingModal from '../../../components/AIGeneratingModal';

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
            <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionDecor} />
                <Text style={styles.sectionTitle}>选择库存食材</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedItems(inventory.map(i => i.name))}>
              <Text style={styles.actionText}>全选</Text>
            </TouchableOpacity>
          </View>
          
          {loadingInventory ? (
             <ActivityIndicator color="#00C896" style={{ marginVertical: 20 }} />
          ) : inventory.length === 0 ? (
             <View style={styles.emptyState}>
                 <Ionicons name="cube-outline" size={48} color="#999" />
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
                        <Ionicons name="checkmark-circle" size={20} color="#00C896" />
                        </View>
                    )}
                    </TouchableOpacity>
                );
                })}
            </View>
          )}

          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionDecor} />
                <Text style={styles.historySectionTitle}>推荐记录</Text>
            </View>
            {loadingHistory ? (
              <ActivityIndicator color="#00C896" style={{ marginTop: 20 }} />
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
                        <Ionicons name="nutrition-outline" size={20} color="#999" />
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
                    <Ionicons name="chevron-forward" size={16} color="#999" />
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
             <View style={styles.buttonContent}>
               <Text style={styles.buttonText}>生成推荐 ({selectedItems.length})</Text>
               <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
             </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <AIGeneratingModal visible={loading} />
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
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDecor: {
    width: 4,
    height: 16,
    backgroundColor: '#00C896',
    marginRight: 8,
    transform: [{ skewX: '-12deg' }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  actionText: {
    color: '#00C896',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCardSelected: {
    borderColor: '#00C896',
    backgroundColor: 'rgba(0,200,150,0.05)',
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemNameSelected: {
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  urgentBadge: {
    backgroundColor: 'rgba(255,77,77,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)',
  },
  urgentText: {
    color: '#FF4D4D',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  generateButton: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#00C896',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  historySection: {
    marginTop: 24,
    marginBottom: 20,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  historyList: {
    gap: 12,
    marginTop: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    marginBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#999',
    fontSize: 14,
  },
  goToFridgeButton: {
    backgroundColor: 'rgba(0,200,150,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00C896',
  },
  goToFridgeText: {
    color: '#00C896',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FridgeToRecipeFeature;
