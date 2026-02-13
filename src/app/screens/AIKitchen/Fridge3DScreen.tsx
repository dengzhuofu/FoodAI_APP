import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Fridge3DView from '../../components/Fridge3D/Fridge3DView';
import { FridgeFoodNode } from '../../components/Fridge3D/FridgeModel';
import FoodDetailSheet from '../../components/Fridge3D/FoodDetailSheet';

const DEFAULT_FOODS: FridgeFoodNode[] = [
  { id: 'apple', name: '苹果', nodeName: 'Food_apple' },
  { id: 'milk', name: '牛奶', nodeName: 'Food_milk' },
  { id: 'egg', name: '鸡蛋', nodeName: 'Food_egg' },
];

export default function Fridge3DScreen() {
  const foods = DEFAULT_FOODS;
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [visibleFoodIds, setVisibleFoodIds] = useState<string[]>(foods.map((f) => f.id));

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

  const modelUrl = undefined;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="3D 冰箱" />

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={styles.label}>食材显示</Text>
            <View style={styles.chips}>
              {foods.map((f) => {
                const active = visibleFoodIds.includes(f.id);
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    onPress={() => toggleFood(f.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.hint}>
            {Platform.OS === 'web'
              ? '鼠标拖动旋转，滚轮缩放；点击门开/关；点击食材查看详情'
              : '左右拖动旋转，双指缩放；点击门开/关；点击食材查看详情'}
          </Text>
        </View>

        <View style={styles.viewer}>
          <Fridge3DView
            modelUrl={modelUrl}
            foods={foods}
            visibleFoodIds={visibleFoodIds}
            selectedFoodId={selectedFoodId}
            onSelectedFoodIdChange={setSelectedFoodId}
          />
        </View>

        <FoodDetailSheet visible={selectedFoodId != null} food={selectedFood} onClose={() => setSelectedFoodId(null)} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
    marginRight: 12,
    letterSpacing: 0.5,
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginTop: 2,
    lineHeight: 16,
  },
  viewer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

