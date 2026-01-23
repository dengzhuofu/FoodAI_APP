# React Native Project Migration Plan

## 1. Project Initialization & Configuration
Since the direct initialization in the current directory failed due to naming issues, we will use a temporary directory strategy.
- [ ] **Initialize Expo Project**: Create a new Expo project (SDK 54+) in a temporary folder `temp_rn_project`.
- [ ] **Migrate to Root**: Move all generated files from `temp_rn_project` to the root directory and clean up.
- [ ] **Install Dependencies**:
    - **Core**: `react-native-elements`, `react-native-vector-icons`, `react-native-safe-area-context`.
    - **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`.
    - **Utilities**: `expo-image`, `expo-linear-gradient`, `expo-status-bar`.

## 2. Project Structure Setup
Strictly follow `PROJECT_STRUCTURE.md` to recreate the directory hierarchy in `src/`.
- [ ] Create `src/app/screens` (Recommend, Explore, AIKitchen, Profile).
- [ ] Create `src/app/components` (Common components, Detail pages).
- [ ] Create `src/app/styles` (Global styles).

## 3. Navigation Implementation
Implement the navigation flow described in `PAGES_COMPLETE.md`.
- [ ] **App.tsx**: Setup `NavigationContainer`.
- [ ] **Tab Navigator**: Implement the 5-tab bottom layout (Recommend, Explore, Publish, AIKitchen, Profile).
- [ ] **Stack Navigator**: Handle transitions to Detail pages (RecipeDetail, RestaurantDetail) and Feature pages (AIKitchen features).

## 4. Screen & Feature Implementation
Migrate all 19 pages ensuring functional completeness.
- [ ] **Recommend Module**: `RecommendScreen` (Feed, Banner).
- [ ] **Explore Module**: `ExploreScreen`, `WhatToEatScreen` (Roulette logic).
- [ ] **AI Kitchen Module**:
    - `AIKitchenScreen` (Dashboard).
    - Features: `ImageToRecipe`, `ImageToCalorie`, `TextToImage`, `TextToRecipe`, `FridgeToRecipe`, `VoiceAssistant`.
- [ ] **Profile Module**:
    - `ProfilePage` (Dashboard).
    - Sub-pages: `Collections`, `ShoppingList`, `Settings`, `FlavorProfile`.
- [ ] **Core Components**: `MyKitchenPage` (Inventory), `RecipeDetailPage`, `RestaurantDetailPage`, `PublishPage`, `MessagesPage`.

## 5. UI & Styling
- [ ] **Styling**: Use `StyleSheet` with a nested structure approach to mimic Sass organization as requested.
- [ ] **Components**: Use `React Native Elements` for UI primitives (Buttons, Cards, Avatars).

## 6. Verification
- [ ] Verify all pages against `PAGES_COMPLETE.md`.
- [ ] Ensure strict TypeScript strictness is maintained.
