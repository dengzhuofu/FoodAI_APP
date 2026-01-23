import { ViewStyle } from 'react-native';

export const theme = {
  colors: {
    primary: '#FF6B6B', // 温暖的橙粉色调
    secondary: '#FFA502', // 活力橙
    background: '#F8F9FA', // 浅灰背景
    card: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#DFE6E9',
    success: '#00B894',
    error: '#D63031',
    warning: '#FDCB6E',
    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    p10: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2D3436',
      lineHeight: 34,
    } as const,
    h2: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#2D3436',
      lineHeight: 28,
    } as const,
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2D3436',
      lineHeight: 24,
    } as const,
    body: {
      fontSize: 15,
      color: '#2D3436',
      lineHeight: 22,
    } as const,
    caption: {
      fontSize: 12,
      color: '#636E72',
      lineHeight: 16,
    } as const,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    } as ViewStyle,
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    } as ViewStyle,
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    } as ViewStyle,
  },
};
