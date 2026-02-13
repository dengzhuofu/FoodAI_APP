import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FridgeFoodNode } from './FridgeModel';

type FoodDetailSheetProps = {
  visible: boolean;
  food: FridgeFoodNode | null;
  onClose: () => void;
};

export default function FoodDetailSheet({ visible, food, onClose }: FoodDetailSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.dot} />
              <Text style={styles.title}>食材详情</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {food ? (
            <View style={styles.content}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMeta}>ID：{food.id}</Text>
              <Text style={styles.foodMeta}>节点：{food.nodeName}</Text>
              <View style={styles.divider} />
              <Text style={styles.tip}>
                可在这里接入库存/营养数据：数量、保质期、热量、建议菜谱等。
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={styles.tip}>未选中食材</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C896',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 6,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  foodMeta: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  tip: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
  },
});

