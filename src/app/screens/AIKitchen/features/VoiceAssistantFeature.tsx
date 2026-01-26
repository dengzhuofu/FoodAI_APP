import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>语音助手</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.chatArea}>
            <View style={styles.botMessage}>
              <View style={styles.botAvatar}>
                <Ionicons name="restaurant" size={20} color="white" />
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  你好！我是你的智能烹饪助手。
                  你可以问我："如何煮出完美的水煮蛋？" 或者 "番茄炒蛋先放什么？"
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.statusText}>
              {isListening ? '正在聆听...' : '点击麦克风开始提问'}
            </Text>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsListening(!isListening)}
              style={styles.micWrapper}
            >
              <Animated.View style={[
                styles.micRing, 
                { transform: [{ scale: scaleAnim }] },
                isListening ? { backgroundColor: 'rgba(26, 26, 26, 0.1)' } : { backgroundColor: 'transparent' }
              ]} />
              
              <View style={[styles.micButton, isListening && styles.micButtonActive]}>
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={32} color="white" />
              </View>
            </TouchableOpacity>
          </View>
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
    flex: 1,
    justifyContent: 'space-between',
  },
  chatArea: {
    padding: 20,
  },
  botMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageBubble: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  statusText: {
    marginBottom: 32,
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  micWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  micRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: '#FF5252',
  },
});

export default VoiceAssistantFeature;
