import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Fridge3DView from '../../components/Fridge3D/Fridge3DView';
import { FridgeFoodNode } from '../../components/Fridge3D/FridgeModel';
import FoodDetailSheet from '../../components/Fridge3D/FoodDetailSheet';
import { useFocusEffect } from '@react-navigation/native';
import { FridgeItem, getFridgeItems } from '../../../api/inventory';
import { Ionicons } from '@expo/vector-icons';

const SPORTS = {
  COLORS: {
    primary: '#00C896',
    primaryDeep: '#00A87E',
    neon: '#EBFF00',
    bg: '#121212',
    surface: '#252525',
    card: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
  },
} as const;

const DEFAULT_FOODS: FridgeFoodNode[] = [
  { id: 'apple', name: '苹果', nodeName: 'Food_apple' },
  { id: 'milk', name: '牛奶', nodeName: 'Food_milk' },
  { id: 'egg', name: '鸡蛋', nodeName: 'Food_egg' },
];

export default function Fridge3DScreen() {
  const [inventory, setInventory] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [filterShowSelected, setFilterShowSelected] = useState(false);
  const [filterSortMode, setFilterSortMode] = useState<'name' | 'expiry'>('name');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const items = await getFridgeItems();
          if (!mounted) return;
          setInventory(items);
        } catch {
          if (!mounted) return;
          setInventory([]);
          setError('库存加载失败，已使用示例数据');
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const foods = useMemo<FridgeFoodNode[]>(() => {
    if (!inventory.length) return DEFAULT_FOODS;
    return inventory.slice(0, 24).map((item) => ({
      id: String(item.id),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
    }));
  }, [inventory]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [visibleFoodIds, setVisibleFoodIds] = useState<string[]>(foods.map((f) => f.id));

  useEffect(() => {
    setVisibleFoodIds((prev) => {
      const nextAllowed = new Set(foods.map((f) => f.id));
      const kept = prev.filter((id) => nextAllowed.has(id));
      return kept.length ? kept : foods.map((f) => f.id);
    });
    setSelectedFoodId((prev) => {
      if (!prev) return null;
      return foods.some((f) => f.id === prev) ? prev : null;
    });
  }, [foods]);

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === selectedFoodId) ?? null,
    [foods, selectedFoodId]
  );

  const toggleFood = (foodId: string) => {
    setVisibleFoodIds((prev) => {
      const set = new Set(prev);
      if (set.has(foodId)) set.delete(foodId);
      else set.add(foodId);
      return Array.from(set);
    });
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => set.add(f.category?.trim() || '其他'));
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    const items = foods.filter((f) => {
      const cat = f.category?.trim() || '其他';
      if (filterCategory !== '全部' && cat !== filterCategory) return false;
      if (filterShowSelected && !visibleFoodIds.includes(f.id)) return false;
      if (!q) return true;
      return `${f.name} ${cat}`.toLowerCase().includes(q);
    });

    const parseExpiry = (value?: string) => {
      const t = Date.parse(value ?? '');
      return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
    };

    if (filterSortMode === 'expiry') {
      return [...items].sort((a, b) => parseExpiry(a.expiry_date) - parseExpiry(b.expiry_date));
    }

    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }, [foods, filterCategory, filterQuery, filterShowSelected, filterSortMode, visibleFoodIds]);

  const visibleCount = visibleFoodIds.length;
  const totalCount = foods.length;

  const modelUrl = undefined;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerOverlay} pointerEvents="box-none">
          <ScreenHeader
            title="3D 冰箱"
            transparent
            right={
              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75} onPress={() => setFilterVisible(true)}>
                <Ionicons name="options-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.viewer}>
          <Fridge3DView
            modelUrl={modelUrl}
            foods={foods}
            visibleFoodIds={visibleFoodIds}
            selectedFoodId={selectedFoodId}
            onSelectedFoodIdChange={setSelectedFoodId}
            fullBleed
          />
        </View>

        {loading ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color="#00C896" />
              <Text style={styles.loadingPillText}>正在加载冰箱库存…</Text>
            </View>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorOverlay} pointerEvents="none">
            <Text style={styles.errorOverlayText}>{error}</Text>
          </View>
        ) : null}

        <FoodDetailSheet visible={selectedFoodId != null} food={selectedFood} onClose={() => setSelectedFoodId(null)} />
      </SafeAreaView>

      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>筛选食材</Text>
                <Text style={styles.modalMeta}>
                  已显示 {visibleCount}/{totalCount}
                </Text>
              </View>
              <View style={styles.modalHeaderRight}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setFilterQuery('');
                    setFilterCategory('全部');
                    setFilterShowSelected(false);
                    setFilterSortMode('name');
                  }}
                >
                  <Ionicons name="refresh" size={16} color={SPORTS.COLORS.textPrimary} />
                  <Text style={styles.resetText}>重置</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={() => setFilterVisible(false)}>
                  <Ionicons name="close" size={18} color={SPORTS.COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={SPORTS.COLORS.textSecondary} />
              <TextInput
                value={filterQuery}
                onChangeText={setFilterQuery}
                placeholder="搜索食材名称"
                placeholderTextColor={SPORTS.COLORS.textSecondary}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {filterQuery ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setFilterQuery('')}>
                  <Ionicons name="close-circle" size={18} color={SPORTS.COLORS.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.quickRow}>
              <View style={styles.segment}>
                <TouchableOpacity
                  style={[styles.segmentBtn, !filterShowSelected ? styles.segmentBtnActive : null]}
                  activeOpacity={0.85}
                  onPress={() => setFilterShowSelected(false)}
                >
                  <Text style={[styles.segmentText, !filterShowSelected ? styles.segmentTextActive : null]}>全部</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, filterShowSelected ? styles.segmentBtnActive : null]}
                  activeOpacity={0.85}
                  onPress={() => setFilterShowSelected(true)}
                >
                  <Text style={[styles.segmentText, filterShowSelected ? styles.segmentTextActive : null]}>已选</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.segment}>
                <TouchableOpacity
                  style={[styles.segmentBtn, filterSortMode === 'name' ? styles.segmentBtnActive : null]}
                  activeOpacity={0.85}
                  onPress={() => setFilterSortMode('name')}
                >
                  <Text style={[styles.segmentText, filterSortMode === 'name' ? styles.segmentTextActive : null]}>名称</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, filterSortMode === 'expiry' ? styles.segmentBtnActive : null]}
                  activeOpacity={0.85}
                  onPress={() => setFilterSortMode('expiry')}
                >
                  <Text style={[styles.segmentText, filterSortMode === 'expiry' ? styles.segmentTextActive : null]}>到期</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryRow}>
              {categories.map((c) => {
                const active = filterCategory === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.categoryChip, active ? styles.categoryChipActive : styles.categoryChipInactive]}
                    activeOpacity={0.85}
                    onPress={() => setFilterCategory(c)}
                  >
                    <Text style={[styles.categoryChipText, active ? styles.categoryChipTextActive : styles.categoryChipTextInactive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.85}
                onPress={() => setVisibleFoodIds(filteredFoods.map((f) => f.id))}
              >
                <Ionicons name="checkmark-done" size={16} color={SPORTS.COLORS.primary} />
                <Text style={styles.actionText}>全选</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => setVisibleFoodIds([])}>
                <Ionicons name="remove" size={16} color={SPORTS.COLORS.primary} />
                <Text style={styles.actionText}>全不选</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.85}
                onPress={() =>
                  setVisibleFoodIds((prev) => {
                    const prevSet = new Set(prev);
                    const next: string[] = [];
                    foods.forEach((f) => {
                      if (!prevSet.has(f.id)) next.push(f.id);
                    });
                    return next;
                  })
                }
              >
                <Ionicons name="swap-horizontal" size={16} color={SPORTS.COLORS.primary} />
                <Text style={styles.actionText}>反选</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.foodList} contentContainerStyle={styles.foodListContent}>
              {filteredFoods.map((f) => {
                const active = visibleFoodIds.includes(f.id);
                const cat = f.category?.trim() || '其他';
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.foodRow}
                    onPress={() => toggleFood(f.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={active ? SPORTS.COLORS.primary : '#4A4F57'}
                    />
                    <View style={styles.foodRowMain}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {f.name}
                      </Text>
                      <View style={styles.foodMetaRow}>
                        <View style={styles.foodTag}>
                          <Text style={styles.foodTagText} numberOfLines={1}>
                            {cat}
                          </Text>
                        </View>
                        {f.quantity ? (
                          <Text style={styles.foodQty} numberOfLines={1}>
                            {f.quantity}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={SPORTS.COLORS.textSecondary} />
                  </TouchableOpacity>
                );
              })}
              {filteredFoods.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>没有匹配的食材</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.footerRow}>
              <Text style={styles.footerHint}>
                {Platform.OS === 'web'
                  ? '鼠标拖动旋转，滚轮缩放；点击上/下门开关；点击抽屉拉出；点击食材查看详情'
                  : '左右拖动旋转，双指缩放；点击上/下门开关；点击抽屉拉出；点击食材查看详情'}
              </Text>
              <TouchableOpacity style={styles.footerDone} activeOpacity={0.9} onPress={() => setFilterVisible(false)}>
                <Text style={styles.footerDoneText}>完成</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeArea: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#00C896',
    borderColor: '#00C896',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E6E6',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#1A1A1A',
  },
  hint: {
    fontSize: 11,
    color: '#666666',
    marginTop: 8,
    lineHeight: 16,
  },
  viewer: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 64,
    alignItems: 'center',
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(30,30,30,0.92)',
  },
  loadingPillText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 64,
  },
  errorOverlayText: {
    fontSize: 12,
    color: '#FF5252',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#252525',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    maxHeight: '82%',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#3A3A3A',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  modalMeta: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '700',
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginRight: 10,
  },
  resetText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2F2F2F',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentBtnActive: {
    backgroundColor: '#00C896',
  },
  segmentText: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: '#121212',
  },
  categoryScroll: {
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#00C896',
    marginRight: 8,
  },
  actionText: {
    color: '#00C896',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 0,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: '#00C896',
    borderColor: '#00C896',
  },
  categoryChipInactive: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2F2F2F',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  categoryChipTextActive: {
    color: '#121212',
  },
  categoryChipTextInactive: {
    color: '#A0A0A0',
  },
  foodList: {
    flexGrow: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
  },
  foodListContent: {
    paddingVertical: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  foodRowMain: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  foodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  foodTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#252525',
    marginRight: 8,
    maxWidth: 160,
  },
  foodTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0A0A0',
  },
  foodQty: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0A0A0',
  },
  emptyBox: {
    paddingHorizontal: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerHint: {
    flex: 1,
    fontSize: 11,
    color: '#A0A0A0',
    lineHeight: 16,
    marginRight: 12,
  },
  footerDone: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#00C896',
  },
  footerDoneText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '900',
  },
});
