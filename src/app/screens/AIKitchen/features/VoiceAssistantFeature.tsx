import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../styles/theme';

const VoiceAssistantFeature = () => {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>语音助手</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.chatContainer}>
          <View style={styles.messageBot}>
            <Text style={styles.messageText}>你好！我是你的烹饪助手。你可以问我："如何煮出完美的水煮蛋？" 或者 "番茄炒蛋先放什么？"</Text>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <Text style={styles.statusText}>
            {isListening ? '正在聆听...' : '点击麦克风开始提问'}
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setIsListening(!isListening)}
            style={styles.micButtonContainer}
          >
            <Animated.View style={[
              styles.micButtonRing, 
              { transform: [{ scale: scaleAnim }] },
              isListening ? { backgroundColor: 'rgba(67, 233, 123, 0.3)' } : { backgroundColor: 'transparent' }
            ]} />
            <LinearGradient
              colors={isListening ? ['#43E97B', '#38F9D7'] : ['#e0e0e0', '#bdbdbd']}
              style={styles.micButton}
            >
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={40} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'space-between',
  },
  chatContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  messageBot: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    ...theme.shadows.sm,
    maxWidth: '80%',
  },
  messageText: {
    ...theme.typography.body,
    lineHeight: 24,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  statusText: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  micButtonContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});

export default VoiceAssistantFeature;
