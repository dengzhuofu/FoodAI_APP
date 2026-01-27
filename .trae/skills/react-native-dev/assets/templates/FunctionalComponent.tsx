import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FunctionalComponentProps {
  title?: string;
}

export const FunctionalComponent: React.FC<FunctionalComponentProps> = ({ title = 'FunctionalComponent' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
