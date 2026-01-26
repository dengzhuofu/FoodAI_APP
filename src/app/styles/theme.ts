import { ViewStyle, TextStyle, Platform } from 'react-native';

export const theme = {
  colors: {
    // 品牌色 - 更加鲜活且具有食欲的颜色
    primary: '#FF5E57', // 珊瑚红，比之前的 #FF6B6B 更具活力
    primaryLight: '#FF8A84',
    primaryDark: '#D93B3B',
    
    secondary: '#FFC048', // 暖阳黄，用于强调
    secondaryLight: '#FFD480',
    
    accent: '#0BE881', // 薄荷绿，用于健康/素食标签
    
    // 背景色体系
    background: '#F9F9F9', // 温暖、明亮的灰白
    surface: '#FFFFFF',
    surfaceVariant: '#F2F3F5', // 用于次级容器
    
    // 文本色体系
    text: '#1E272E', // 深炭灰，比纯黑柔和
    textSecondary: '#57606F', // 次级文本
    textTertiary: '#A4B0BE', // 辅助文本/占位符
    textInvert: '#FFFFFF',
    
    // 功能色
    border: '#E2E7EA',
    success: '#05C46B',
    error: '#FF3F34',
    warning: '#FFA801',
    info: '#0FB9B1',
    
    white: '#FFFFFF',
    overlay: 'rgba(30, 39, 46, 0.4)', // 偏蓝的遮罩层
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    p10: 10, // 兼容旧代码
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    // 增加一些特定的间距常量
    screenHorizontal: 20, // 屏幕两侧统一间距
    cardInner: 16, // 卡片内部间距
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12, // 稍微减小中等圆角，显得更精致
    lg: 20, // 大圆角用于卡片
    xl: 32,
    round: 9999,
  },
  
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '800',
      color: '#1E272E',
      lineHeight: 40,
      letterSpacing: -0.5,
    } as TextStyle,
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1E272E',
      lineHeight: 32,
      letterSpacing: -0.2,
    } as TextStyle,
    h2: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E272E',
      lineHeight: 28,
    } as TextStyle,
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1E272E',
      lineHeight: 24,
    } as TextStyle,
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1E272E',
      lineHeight: 24,
    } as TextStyle,
    body: {
      fontSize: 15,
      color: '#57606F',
      lineHeight: 24, // 增加行高提升可读性
    } as TextStyle,
    bodySmall: {
      fontSize: 14,
      color: '#57606F',
      lineHeight: 20,
    } as TextStyle,
    caption: {
      fontSize: 12,
      color: '#A4B0BE',
      lineHeight: 16,
      fontWeight: '500',
    } as TextStyle,
    button: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    } as TextStyle,
  },
  
  shadows: {
    sm: {
      shadowColor: '#1E272E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: '#1E272E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
    lg: {
      shadowColor: '#1E272E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,
    // 特殊阴影：彩色发光效果（主要在 iOS 上有效）
    primaryGlow: {
      shadowColor: '#FF5E57',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    } as ViewStyle,
  },
  
  layout: {
    headerHeight: Platform.OS === 'ios' ? 44 : 56,
    tabBarHeight: 60,
  }
};
