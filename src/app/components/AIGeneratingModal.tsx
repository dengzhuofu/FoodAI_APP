import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AIGeneratingModalProps {
  visible: boolean;
  text?: string;
}

const AIGeneratingModal: React.FC<AIGeneratingModalProps> = ({ visible, text = "AI 正在生成中..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (visible) {
      spinValue.setValue(0);
      
      // Start fade in
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start spinning
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500, // Slightly faster
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      // Start fade out
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeValue }]}>
            <View style={styles.iconContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sparkles" size={48} color="#00C896" />
                </Animated.View>
            </View>
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AIGeneratingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 200,
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  centerIcon: {
    position: 'absolute',
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
    fontStyle: 'italic',
  },
});
