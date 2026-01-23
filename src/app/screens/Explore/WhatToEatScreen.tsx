import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Easing, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = 300;
const RADIUS = WHEEL_SIZE / 2;

const DEFAULT_OPTIONS = ['火锅', '烧烤', '日料', '西餐', '川菜', '奶茶', '汉堡', '披萨'];
const COLORS = ['#FF6B6B', '#FFA502', '#FFD700', '#2ECC71', '#3498DB', '#9B59B6', '#E0C3FC', '#FF9A9E'];

const WhatToEatScreen = () => {
  const navigation = useNavigation();
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [newOption, setNewItem] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

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

    const randomIndex = Math.floor(Math.random() * options.length);
    const sectorAngle = 360 / options.length;
    
    // We want the selected index to be at the TOP (270 degrees in SVG coordinates, or -90)
    // Our pointer is at the TOP center.
    // SVG starts drawing at 0 degrees (3 o'clock).
    // Sector i starts at `i * sectorAngle`.
    // We want the CENTER of sector i to align with 270 degrees (Top).
    // Center of sector i is `i * sectorAngle + sectorAngle / 2`.
    // Rotation needed: `270 - (i * sectorAngle + sectorAngle / 2)`.
    
    const targetAngle = 270 - (randomIndex * sectorAngle + sectorAngle / 2);
    const finalRotation = 360 * 5 + targetAngle; // 5 full spins + target

    Animated.timing(spinValue, {
      toValue: finalRotation,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
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
      <Svg height={WHEEL_SIZE} width={WHEEL_SIZE} viewBox={`-150 -150 300 300`}>
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

            // Calculate text position
            const angle = (index * (360 / total) + (360 / total) / 2) * (Math.PI / 180);
            const textRadius = RADIUS * 0.65;
            const textX = Math.cos(angle) * textRadius;
            const textY = Math.sin(angle) * textRadius;
            
            return (
              <G key={index}>
                <Path d={pathData} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />
                <SvgText
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${index * (360 / total) + (360 / total) / 2}, ${textX}, ${textY})`}
                >
                  {option}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>今天吃什么</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.wheelWrapper}>
          <View style={styles.pointerContainer}>
            <Ionicons name="caret-down" size={40} color={theme.colors.text} />
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            {renderWheel()}
          </Animated.View>
          <View style={styles.centerDot} />
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>决定就是：</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]} 
          onPress={spin}
          disabled={isSpinning}
        >
          <Text style={styles.spinButtonText}>{isSpinning ? '转动中...' : '开始转动'}</Text>
        </TouchableOpacity>

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>选项列表 ({options.length})</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="添加新选项..."
              value={newOption}
              onChangeText={setNewItem}
              onSubmitEditing={handleAddOption}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {options.map((item, index) => (
              <View key={index} style={[styles.tag, { borderColor: COLORS[index % COLORS.length] }]}>
                <Text style={styles.tagText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveOption(index)}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
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
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -25,
    zIndex: 10,
    // Shadow for visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    zIndex: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  resultLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  spinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  spinButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  spinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsSection: {
    width: '100%',
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
  },
  tagText: {
    marginRight: 6,
    color: theme.colors.text,
  },
});

export default WhatToEatScreen;
