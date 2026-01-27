---
name: react-native-dev
description: Comprehensive guide and toolset for developing React Native applications. Use this skill when the user wants to build, refactor, debug, or optimize React Native apps (Expo or CLI). It covers component creation, navigation setup, state management, and best practices.
---

# React Native Developer

This skill helps you build high-quality React Native applications efficiently.

## Core Capabilities

### 1. Component Creation
Create functional components and screens using best practices.

**Functional Component Template:**
When asked to create a new UI component, use the template at `assets/templates/FunctionalComponent.tsx` as a base.
- Ensure proper typing with TypeScript.
- Use `StyleSheet` for styles.

**Screen Component Template:**
When asked to create a new screen, use the template at `assets/templates/ScreenComponent.tsx`.
- Includes `SafeAreaView` handling.
- Includes navigation hooks setup.

### 2. Project Structure & Best Practices
Follow the guidelines in `references/best-practices.md` for:
- Directory structure organization
- Performance optimization (Lists, Images, Memoization)
- Navigation type safety
- State management choices

### 3. Navigation Setup
When setting up navigation (React Navigation):
1. Install required dependencies (`@react-navigation/native`, `react-native-screens`, etc.).
2. Create a `navigation` directory.
3. Define types for your stack/tabs.
4. Wrap the app in `NavigationContainer`.

### 4. Common Tasks Workflow

**New Project Initialization:**
If the user asks to start a new project:
- Recommend **Expo** for most use cases: `npx create-expo-app@latest`.
- For specific native modules requirements, use CLI.

**Adding a Feature:**
1. Create a directory in `features/` (e.g., `features/auth`).
2. Create screens, components, and logic hooks within that directory.
3. Register screens in the main navigation stack.

**Debugging:**
- Use `console.log` for quick checks.
- Use React Native Debugger or Expo Go's shake menu for deeper inspection.
- Check `package.json` for available scripts (start, android, ios).

## Resources
- **Best Practices**: [best-practices.md](references/best-practices.md)
- **Component Template**: [FunctionalComponent.tsx](assets/templates/FunctionalComponent.tsx)
- **Screen Template**: [ScreenComponent.tsx](assets/templates/ScreenComponent.tsx)
