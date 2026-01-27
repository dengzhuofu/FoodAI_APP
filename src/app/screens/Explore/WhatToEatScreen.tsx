import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Easing, Alert, Dimensions, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, G, Text as SvgText, Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const RADIUS = WHEEL_SIZE / 2;
const BORDER_WIDTH = 20;

const DEFAULT_OPTIONS = ['火锅 🍲', '烧烤 🍢', '日料 🍣', '西餐 🍝', '川菜 🌶️', '奶茶 🧋', '汉堡 🍔', '披萨 🍕'];

// Pop / Carnival Palette
const PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#FF9F1C', // Orange
  '#9B5DE5', // Purple
  '#F15BB5', // Pink
];

const BackgroundPattern = () => (
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Defs>
      <Pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <Circle cx="2" cy="2" r="2" fill="rgba(0,0,0,0.05)" />
        <Circle cx="22" cy="22" r="2" fill="rgba(0,0,0,0.05)" />
      </Pattern>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="#F7F9FC" />
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
  </Svg>
);

const WhatToEatScreen = () => {
  const navigation = useNavigation();
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [newOption, setNewItem] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const lightsAnim = useRef(new Animated.Value(0)).current;

  // New State for AI and Presets
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const [aiCategories, setAiCategories] = useState('中餐, 西餐, 日料');
  const [aiQuantity, setAiQuantity] = useState('8');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const [presets, setPresets] = useState<WhatToEatPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(lightsAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const data = await getWhatToEatPresets();
      setPresets(data);
    } catch (error) {
      console.log('Error fetching presets:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiCategories.trim()) {
      Alert.alert('提示', '请输入食物种类');
      return;
    }
    const qty = parseInt(aiQuantity);
    if (isNaN(qty) || qty < 2 || qty > 20) {
      Alert.alert('提示', '数量请在 2 到 20 之间');
      return;
    }

    setIsLoadingAI(true);
    try {
      const categories = aiCategories.split(/[,，]/).map(c => c.trim()).filter(c => c);
      const generatedOptions = await generateWhatToEat(categories, qty);
      if (generatedOptions && generatedOptions.length > 0) {
        setOptions(generatedOptions);
        setShowAIModal(false);
        Alert.alert('成功', 'AI已为您生成新的转盘选项！');
      } else {
        Alert.alert('提示', 'AI未能生成选项，请重试');
      }
    } catch (error) {
      Alert.alert('错误', '生成失败，请稍后重试');
      console.error(error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert('提示', '请输入预设名称');
      return;
    }
    try {
      await createWhatToEatPreset(presetName, options);
      setShowSaveModal(false);
      setPresetName('');
      fetchPresets();
      Alert.alert('成功', '预设已保存');
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  const handleLoadPreset = (preset: WhatToEatPreset) => {
    setOptions(preset.options);
    setShowPresetModal(false);
    Alert.alert('提示', `已加载预设：${preset.name}`);
  };

  const handleDeletePreset = async (id: number) => {
    try {
      await deleteWhatToEatPreset(id);
      fetchPresets();
    } catch (error) {
      Alert.alert('错误', '删除失败');
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      Alert.alert('提示', '至少保留两个选项');
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const spin = () => {
    if (options.length < 2) {
      Alert.alert('提示', '至少需要两个选项才能开始转动哦');
      return;
    }

    setIsSpinning(true);
    setResult(null);
    spinValue.setValue(0);

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    const randomIndex = Math.floor(Math.random() * options.length);
    const sectorAngle = 360 / options.length;
    
    // Target calculation: Top is 270 degrees
    const targetAngle = 270 - (randomIndex * sectorAngle + sectorAngle / 2);
    const finalRotation = 360 * 10 + targetAngle; // More spins for excitement

    Animated.timing(spinValue, {
      toValue: finalRotation,
      duration: 5000,
      easing: Easing.bezier(0.2, 0, 0.1, 1), // "Spin up and slow down" curve
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsSpinning(false);
        setResult(options[randomIndex]);
      }
    });
  };

  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent) * RADIUS;
    const y = Math.sin(2 * Math.PI * percent) * RADIUS;
    return [x, y];
  };

  const renderWheel = () => {
    const total = options.length;
    let cumulativePercent = 0;

    return (
      <Svg height={WHEEL_SIZE} width={WHEEL_SIZE} viewBox={`-${RADIUS} -${RADIUS} ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
        <G>
          {options.map((option, index) => {
            const percent = 1 / total;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            // Text calculations
            const angle = (index * (360 / total) + (360 / total) / 2) * (Math.PI / 180);
            const textRadius = RADIUS * 0.65;
            const textX = Math.cos(angle) * textRadius;
            const textY = Math.sin(angle) * textRadius;
            
            const displayText = option.length > 6 ? option.substring(0, 5) + '...' : option;

            return (
              <G key={index}>
                <Path 
                  d={pathData} 
                  fill={PALETTE[index % PALETTE.length]} 
                  stroke="#FFF" 
                  strokeWidth="2" 
                />
                <SvgText
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${index * (360 / total) + (360 / total) / 2 + 90}, ${textX}, ${textY})`}
                >
                  {displayText}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  const renderLights = () => {
    const lights = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const r = RADIUS + BORDER_WIDTH / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      lights.push(
        <View 
          key={i} 
          style={[
            styles.lightBulb, 
            { 
              left: x + (WHEEL_SIZE + BORDER_WIDTH * 2) / 2 - 6, 
              top: y + (WHEEL_SIZE + BORDER_WIDTH * 2) / 2 - 6,
              backgroundColor: i % 2 === 0 ? '#FFE66D' : 'white' 
            }
          ]} 
        />
      );
    }
    return lights;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <BackgroundPattern />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>今天吃什么？</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity style={[styles.toolBtn, {backgroundColor: '#9B5DE5'}]} onPress={() => setShowAIModal(true)}>
                <Ionicons name="sparkles" size={18} color="white" />
                <Text style={styles.toolBtnText}>AI生成</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toolBtn, {backgroundColor: '#FF9F1C'}]} onPress={() => setShowSaveModal(true)}>
                <Ionicons name="save" size={18} color="white" />
                <Text style={styles.toolBtnText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toolBtn, {backgroundColor: '#4ECDC4'}]} onPress={() => setShowPresetModal(true)}>
                <Ionicons name="list" size={18} color="white" />
                <Text style={styles.toolBtnText}>预设</Text>
              </TouchableOpacity>
            </View>

            {/* Wheel Section */}
          <View style={styles.wheelSection}>
            <View style={styles.wheelBorder}>
              {renderLights()}
              <Animated.View 
                style={[
                  styles.wheelContainer, 
                  { transform: [{ rotate }] }
                ]}
              >
                {renderWheel()}
              </Animated.View>
            </View>

            {/* Pointer - Solid and Simple */}
            <View style={styles.pointerWrapper}>
              <View style={styles.pointerTriangle} />
            </View>

            {/* Center Hub */}
            <View style={styles.centerHub}>
              <View style={styles.centerHubInner}>
                <Ionicons name="fast-food" size={24} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Result Display */}
          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultPreTitle}>命运的安排是</Text>
              <Text style={styles.resultTitle}>{result}</Text>
              <View style={styles.confettiRow}>
                 <Text style={{fontSize: 20}}>🎉</Text>
                 <Text style={{fontSize: 20}}>✨</Text>
                 <Text style={{fontSize: 20}}>🍽️</Text>
              </View>
            </View>
          )}

          {/* Spin Button */}
          <Animated.View style={{ transform: [{ scale: scaleValue }], width: '100%', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
              onPress={spin}
              disabled={isSpinning}
              activeOpacity={1}
            >
              <View style={styles.spinButtonInner}>
                <Text style={styles.spinButtonText}>{isSpinning ? 'SPINNING...' : 'GO!'}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Options Management */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionInputRow}>
              <TextInput
                style={styles.optionInput}
                placeholder="添加新选项..."
                value={newOption}
                onChangeText={setNewItem}
                onSubmitEditing={handleAddOption}
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addOptionBtn} onPress={handleAddOption}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsWrapper}>
              {options.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.tag, { borderColor: PALETTE[index % PALETTE.length] }]}
                  onPress={() => handleRemoveOption(index)}
                >
                  <Text style={[styles.tagText, { color: theme.colors.text }]}>{item}</Text>
                  <Ionicons name="close-circle" size={16} color={PALETTE[index % PALETTE.length]} style={{marginLeft: 4}} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={{height: 40}} />
        </ScrollView>

        {/* AI Modal */}
        <Modal visible={showAIModal} animationType="fade" transparent={true} onRequestClose={() => setShowAIModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>AI 智能生成</Text>
              <Text style={styles.label}>想吃什么种类？(逗号分隔)</Text>
              <TextInput 
                style={styles.input} 
                value={aiCategories} 
                onChangeText={setAiCategories}
                placeholder="例如：中餐, 火锅, 奶茶"
              />
              <Text style={styles.label}>生成数量 (2-20)</Text>
              <TextInput 
                style={styles.input} 
                value={aiQuantity} 
                onChangeText={setAiQuantity}
                keyboardType="numeric"
                maxLength={2}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowAIModal(false)}>
                  <Text style={styles.modalBtnText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleGenerateAI} disabled={isLoadingAI}>
                  {isLoadingAI ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>生成</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Save Preset Modal */}
        <Modal visible={showSaveModal} animationType="fade" transparent={true} onRequestClose={() => setShowSaveModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>保存当前转盘</Text>
              <Text style={styles.label}>预设名称</Text>
              <TextInput 
                style={styles.input} 
                value={presetName} 
                onChangeText={setPresetName}
                placeholder="例如：周末大餐"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowSaveModal(false)}>
                  <Text style={styles.modalBtnText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleSavePreset}>
                  <Text style={styles.modalBtnText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Presets List Modal */}
        <Modal visible={showPresetModal} animationType="fade" transparent={true} onRequestClose={() => setShowPresetModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {maxHeight: '70%'}]}>
              <Text style={styles.modalTitle}>我的预设</Text>
              <ScrollView style={{width: '100%'}}>
                {presets.length === 0 ? (
                  <Text style={{textAlign: 'center', color: '#999', marginVertical: 20}}>暂无预设</Text>
                ) : (
                  presets.map(preset => (
                    <View key={preset.id} style={styles.presetItem}>
                      <TouchableOpacity style={styles.presetInfo} onPress={() => handleLoadPreset(preset)}>
                        <Text style={styles.presetName}>{preset.name}</Text>
                        <Text style={styles.presetCount}>{preset.options.length} 个选项</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeletePreset(preset.id)} style={{padding: 5}}>
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, {marginTop: 15, width: '100%'}]} onPress={() => setShowPresetModal(false)}>
                <Text style={[styles.modalBtnText, {color: '#333'}]}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  wheelSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    width: WHEEL_SIZE + BORDER_WIDTH * 2,
    height: WHEEL_SIZE + BORDER_WIDTH * 2,
  },
  wheelBorder: {
    width: WHEEL_SIZE + BORDER_WIDTH * 2,
    height: WHEEL_SIZE + BORDER_WIDTH * 2,
    borderRadius: (WHEEL_SIZE + BORDER_WIDTH * 2) / 2,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  lightBulb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  pointerWrapper: {
    position: 'absolute',
    top: -20, // Adjusted position
    alignItems: 'center',
    zIndex: 20,
    // Removed shadows to make it flat and solid
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF4757', // Solid Red, no transparency
  },
  centerHub: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  centerHubInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#FF9F1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FF9F1C',
    transform: [{ rotate: '-2deg' }],
  },
  resultPreTitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
  },
  confettiRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  spinButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    padding: 6,
    marginBottom: 30,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  spinButtonInner: {
    flex: 1,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  spinButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  optionsContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionInputRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  optionInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F7F9FC',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  addOptionBtn: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#333',
  },
  modalBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: '100%',
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  presetCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default WhatToEatScreen;
