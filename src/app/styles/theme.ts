import { ViewStyle, TextStyle, Platform } from 'react-native';

export const theme = {
  colors: {
    // 品牌色 - 运动/竞技风格
    primary: '#00C896', // 活力青 - 主色调
    primaryLight: '#5FE8C2',
    primaryDark: '#00A87E', // 深青色 - 点击态
    
    secondary: '#EBFF00', // 霓虹黄 - 高亮/强调
    secondaryLight: '#F5FF7A',
    
    accent: '#2DCCFF', // 电光蓝 - 辅助色
    
    // 背景色体系
    background: '#F5F7FA', // 冷调灰白背景，更具科技/运动感
    surface: '#FFFFFF', // 卡片背景
    surfaceVariant: '#E8ECEF', // 次级容器
    surfaceDark: '#1E1E1E', // 深色模式/深色卡片背景
    
    // 文本色体系
    text: '#121212', // 纯黑，高对比度
    textSecondary: '#57606F', // 次级文本
    textTertiary: '#A4B0BE', // 辅助文本/占位符
    textInvert: '#FFFFFF', // 反色文本
    
    // 功能色
    border: '#E2E7EA',
    success: '#00C896', // 与主色一致
    error: '#FF3F34',
    warning: '#FFA801',
    info: '#2DCCFF',
    
    white: '#FFFFFF',
    overlay: 'rgba(18, 18, 18, 0.6)', // 深色遮罩
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    p10: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    screenHorizontal: 20,
    cardInner: 16,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20, // 大圆角，符合新风格
    xl: 32,
    round: 9999,
  },
  
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '800',
      color: '#121212',
      lineHeight: 40,
      letterSpacing: -1, // 更紧凑的字间距，体现速度感
      fontStyle: 'italic', // 标题斜体，增强动感
    } as TextStyle,
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#121212',
      lineHeight: 32,
      letterSpacing: -0.5,
    } as TextStyle,
    h2: {
      fontSize: 20,
      fontWeight: '700',
      color: '#121212',
      lineHeight: 28,
    } as TextStyle,
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#121212',
      lineHeight: 24,
    } as TextStyle,
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#121212',
      lineHeight: 24,
    } as TextStyle,
    body: {
      fontSize: 15,
      color: '#57606F',
      lineHeight: 24,
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
      textTransform: 'uppercase', // 标签大写，增加力量感
    } as TextStyle,
    button: {
      fontSize: 16,
      fontWeight: '700', // 按钮文字加粗
      color: '#FFFFFF',
    } as TextStyle,
  },
  
  shadows: {
    sm: {
      shadowColor: '#121212',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: '#121212',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    } as ViewStyle,
    lg: {
      shadowColor: '#121212',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    } as ViewStyle,
    // 特殊阴影：霓虹发光效果
    primaryGlow: {
      shadowColor: '#00C896',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,
  },
  
  layout: {
    headerHeight: Platform.OS === 'ios' ? 44 : 56,
    tabBarHeight: 60,
  }
};
