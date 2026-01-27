# React Native Best Practices

## Directory Structure
Organize your project by features or type. A common structure:
```
src/
  app/              # App entry, providers, navigation
  components/       # Reusable UI components
  features/         # Feature-based modules (screens, logic)
  hooks/            # Custom hooks
  services/         # API and external services
  utils/            # Helper functions
  theme/            # Colors, fonts, spacing
  assets/           # Images, fonts
```

## Performance
- **Lists**: Always use `FlatList` or `SectionList` for long lists. Avoid `ScrollView` for large datasets.
- **Images**: Use standard `Image` or `expo-image` for caching and performance.
- **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders, especially for list items.
- **Inline Styles**: Avoid complex inline styles; use `StyleSheet.create` or libraries like `NativeWind`.

## Navigation
- **Type Safety**: Define navigation stacks and route params in a types file.
- **Hooks**: Use `useNavigation` and `useRoute` hooks instead of props drilling.

## State Management
- **Local State**: `useState` for simple component state.
- **Global State**: Context API for themes/auth. Zustand or Redux Toolkit for complex app state.
- **Server State**: React Query (TanStack Query) for API data caching.

## Styling
- **Flexbox**: React Native uses Flexbox for layout. Defaults to `flexDirection: 'column'`.
- **Units**: Dimensions are unitless (logical pixels).
- **SafeArea**: Always handle safe areas using `SafeAreaView` or `react-native-safe-area-context`.
