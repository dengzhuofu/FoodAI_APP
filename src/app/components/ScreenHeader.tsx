import React from 'react';
import { StyleProp, View, ViewStyle, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title: string;
  right?: React.ReactNode;
  backIcon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenHeader({ title, right, backIcon = 'chevron-back', onBack, transparent = false, style }: Props) {
  const navigation = useNavigation<any>();
  const color = transparent ? '#FFFFFF' : '#1A1A1A';

  return (
    <View style={[styles.header, transparent ? styles.headerTransparent : null, style]}>
      <TouchableOpacity
        style={[styles.backButton, transparent ? styles.backButtonTransparent : null]}
        activeOpacity={0.75}
        onPress={onBack || navigation.goBack}
      >
        <Ionicons name={backIcon} size={22} color={color} />
      </TouchableOpacity>
      <Text style={[styles.title, transparent ? styles.titleTransparent : null]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonTransparent: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    marginHorizontal: 12,
    fontStyle: 'italic',
  },
  titleTransparent: {
    color: '#FFFFFF',
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
