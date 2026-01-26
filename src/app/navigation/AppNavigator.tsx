import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator,CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text,Platform } from 'react-native';

import { RootStackParamList, MainTabParamList } from './types';
import { theme } from '../styles/theme';

// Import Screens
import RecommendScreen from '../screens/Recommend/RecommendScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import AIKitchenScreen from '../screens/AIKitchen/AIKitchenScreen';
import ProfilePage from '../components/ProfilePage';
import PublishPage from '../components/PublishPage';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

import WhatToEatScreen from '../screens/Explore/WhatToEatScreen';
import RecipeDetailPage from '../components/RecipeDetailPage';
import RestaurantDetailPage from '../components/RestaurantDetailPage';
import MyKitchenPage from '../components/MyKitchenPage';
import MessagesPage from '../components/MessagesPage';

// AI Features
import ImageToRecipeFeature from '../screens/AIKitchen/features/ImageToRecipeFeature';
import ImageToCalorieFeature from '../screens/AIKitchen/features/ImageToCalorieFeature';
import TextToImageFeature from '../screens/AIKitchen/features/TextToImageFeature';
import TextToRecipeFeature from '../screens/AIKitchen/features/TextToRecipeFeature';
import FridgeToRecipeFeature from '../screens/AIKitchen/features/FridgeToRecipeFeature';
import VoiceAssistantFeature from '../screens/AIKitchen/features/VoiceAssistantFeature';
import GeneratedRecipeResult from '../screens/AIKitchen/GeneratedRecipeResult';

// Profile Sub-pages
import CollectionsPage from '../screens/Profile/CollectionsPage';
import ShoppingListPage from '../screens/Profile/ShoppingListPage';
import MyCommentsPage from '../screens/Profile/MyCommentsPage';
import SettingsPage from '../screens/Profile/SettingsPage';
import FlavorProfilePage from '../screens/Profile/FlavorProfilePage';

import PublishRecipeScreen from '../screens/Publish/PublishRecipeScreen';
import PublishStoreScreen from '../screens/Publish/PublishStoreScreen';

// Search Screen
import SearchScreen from '../screens/Search/SearchScreen';
import SearchResultScreen from '../screens/Search/SearchResultScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Placeholder for Publish Button functionality (handled in TabBar listener usually or as a modal)
const PublishPlaceholder = () => <View />;

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Recommend') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'AIKitchen') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'PublishTab') {
            iconName = 'add-circle';
            size = 55;
            color = theme.colors.primary;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Recommend" 
        component={RecommendScreen} 
        options={{ title: '推荐' }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ title: '探索' }}
      />
      <Tab.Screen 
        name="PublishTab" 
        component={PublishPlaceholder} 
        options={{ 
          title: '发布',
          tabBarLabel: () => null, // Hide label for center button
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Publish');
          },
        })}
      />
      <Tab.Screen 
        name="AIKitchen" 
        component={AIKitchenScreen} 
        options={{ title: 'AI厨房' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage} 
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
};

import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native';

const AppNavigator = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false, 
          headerBackTitleVisible: false,
          animationEnabled: Platform.OS !== 'web',
          cardStyleInterpolator: Platform.OS === 'web' ? CardStyleInterpolators.forNoAnimation : undefined,
        }}
      >
        {userToken == null ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            
            {/* Explore */}
            <Stack.Screen name="WhatToEat" component={WhatToEatScreen} options={{ title: '今天吃什么' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false, animationEnabled: false }} />
            <Stack.Screen name="SearchResult" component={SearchResultScreen} options={{ headerShown: false }} />
            
            {/* Details */}
            <Stack.Screen name="RecipeDetail" component={RecipeDetailPage} options={{ title: '菜谱详情' }} />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailPage} options={{ title: '餐厅详情' }} />
            
            {/* AI Features */}
            <Stack.Screen name="ImageToRecipe" component={ImageToRecipeFeature} options={{ title: '图 → 菜谱' }} />
            <Stack.Screen name="ImageToCalorie" component={ImageToCalorieFeature} options={{ title: '图 → 卡路里' }} />
            <Stack.Screen name="TextToImage" component={TextToImageFeature} options={{ title: '文 → 图' }} />
            <Stack.Screen name="TextToRecipe" component={TextToRecipeFeature} options={{ title: '文 → 菜谱' }} />
            <Stack.Screen name="FridgeToRecipe" component={FridgeToRecipeFeature} options={{ title: '冰箱 → 菜谱' }} />
            <Stack.Screen name="VoiceAssistant" component={VoiceAssistantFeature} options={{ title: '语音助手' }} />
            <Stack.Screen name="GeneratedRecipeResult" component={GeneratedRecipeResult} options={{ title: 'AI 生成结果', headerShown: false }} />
            
            {/* Profile Sub-pages */}
            <Stack.Screen name="Collections" component={CollectionsPage} options={{ title: '我的收藏' }} />
            <Stack.Screen name="ShoppingList" component={ShoppingListPage} options={{ title: '购物清单' }} />
            <Stack.Screen name="MyComments" component={MyCommentsPage} options={{ title: '我的评价' }} />
            <Stack.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
            <Stack.Screen name="FlavorProfile" component={FlavorProfilePage} options={{ title: '风味画像' }} />
            
            {/* Other */}
            <Stack.Screen name="MyKitchen" component={MyKitchenPage} options={{ title: '我的冰箱' }} />
            <Stack.Screen name="Messages" component={MessagesPage} options={{ title: '消息' }} />
            
            <Stack.Screen name="PublishRecipe" component={PublishRecipeScreen} options={{ title: '发布菜谱', headerShown: false }} />
            <Stack.Screen name="PublishStore" component={PublishStoreScreen} options={{ title: '发布探店', headerShown: false }} />
            
            {/* Modals */}
            <Stack.Screen 
              name="Publish" 
              component={PublishPage} 
              options={{ 
                presentation: 'modal', 
                headerShown: false 
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
