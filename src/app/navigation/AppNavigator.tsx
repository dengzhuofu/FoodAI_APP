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
import MealPlanFeature from '../screens/AIKitchen/features/MealPlanFeature';
import GeneratedRecipeResult from '../screens/AIKitchen/GeneratedRecipeResult';
import AIGenerationHistoryScreen from '../screens/AIKitchen/AIGenerationHistoryScreen';
import McDonaldsAssistantFeature from '../screens/AIKitchen/features/McDonaldsAssistantFeature';
import Fridge3DScreen from '../screens/AIKitchen/Fridge3DScreen';

import ToolResultScreen from '../screens/AIKitchen/ToolResultScreen';

// Profile Sub-pages
import CollectionsPage from '../screens/Profile/CollectionsPage';
import ShoppingListPage from '../screens/Profile/ShoppingListPage';
import MyCommentsPage from '../screens/Profile/MyCommentsPage';
import SettingsPage from '../screens/Profile/SettingsPage';
import FlavorProfilePage from '../screens/Profile/FlavorProfilePage';

import PublishRecipeScreen from '../screens/Publish/PublishRecipeScreen';
import PublishStoreScreen from '../screens/Publish/PublishStoreScreen';
import DraftBoxScreen from '../screens/Publish/DraftBoxScreen';

import MapSelectorScreen from '../screens/Map/MapSelectorScreen';
import RoutePlanScreen from '../screens/Map/RoutePlanScreen';

// Search Screen
import SearchScreen from '../screens/Search/SearchScreen';
import SearchResultScreen from '../screens/Search/SearchResultScreen';
import HealthProfileScreen from '../screens/Health/HealthProfileScreen';
import HealthCheckInScreen from '../screens/Health/HealthCheckInScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Placeholder for Publish Button functionality (handled in TabBar listener usually or as a modal)
const PublishPlaceholder = () => <View />;

import { useTranslation } from 'react-i18next';

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1A1A1A', // Active: Dark Bold
        tabBarInactiveTintColor: '#BDBDBD', // Inactive: Grey
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Recommend') {
            iconName = 'home'; // Classic & Clean
          } else if (route.name === 'Explore') {
            iconName = 'compass'; // Discovery
          } else if (route.name === 'AIKitchen') {
            iconName = 'sparkles'; // Keep this one
          } else if (route.name === 'Profile') {
            iconName = 'person-circle'; // Avatar style
          } else if (route.name === 'PublishTab') {
            // Special handling for Publish button, kept separate
            return (
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 28,
                backgroundColor: '#00C896', 
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 0,
                shadowColor: '#00C896',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name="add" size={32} color="#FFF" />
              </View>
            );
          }

          // Custom Icon Renderer for standard tabs
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
               {/* Decorative background for focused state */}
               {focused && (
                 <View style={{
                   position: 'absolute',
                   top: -2,
                   right: -6,
                   width: 6,
                   height: 6,
                   borderRadius: 3,
                   backgroundColor: '#00C896', // The "Green Dot" accent
                 }} />
               )}
               
               {/* Icon */}
               <Ionicons 
                 name={focused ? iconName as any : `${iconName}-outline` as any} 
                 size={24} 
                 color={focused ? '#1A1A1A' : '#BDBDBD'} 
               />
            </View>
          );
        },
        tabBarStyle: {
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 80, 
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          backgroundColor: '#FFFFFF',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700', // Bold text for that strong look
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Recommend" 
        component={RecommendScreen} 
        options={{ title: t('nav.home') }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ title: t('nav.explore') }}
      />
      <Tab.Screen 
        name="PublishTab" 
        component={PublishPlaceholder} 
        options={{ 
          title: 'Publish',
          tabBarLabel: () => null,
          // icon renderer is handled in screenOptions
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Publish');
          },
        })}
      />
      <Tab.Screen 
        name="AIKitchen" 
        component={AIKitchenScreen} 
        options={{ title: t('nav.kitchen') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage} 
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
};

import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native';
import UserListScreen from '../screens/Profile/UserListScreen';
import UserPostsScreen from '../screens/Profile/UserPostsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import UserDetailScreen from '../screens/User/UserDetailScreen';
import MapAssistantFeature from '../screens/AIKitchen/features/MapAssistantFeature';

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
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
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
            <Stack.Screen name="MealPlan" component={MealPlanFeature} options={{ title: '膳食计划', headerShown: false }} />
            <Stack.Screen name="Fridge3D" component={Fridge3DScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VoiceAssistant" component={VoiceAssistantFeature} options={{ title: '语音助手' }} />
            <Stack.Screen name="GeneratedRecipeResult" component={GeneratedRecipeResult} options={{ title: 'AI 生成结果', headerShown: false }} />
            <Stack.Screen name="AIGenerationHistory" component={AIGenerationHistoryScreen} options={{ title: '生成记录', headerShown: false }} />
            <Stack.Screen name="McDonaldsAssistant" component={McDonaldsAssistantFeature} options={{ title: '麦当劳助手', headerShown: false }} />
            <Stack.Screen name="MapAssistant" component={MapAssistantFeature} options={{ title: '地图助手', headerShown: false }} />
            <Stack.Screen name="ToolResult" component={ToolResultScreen} options={{ headerShown: false, presentation: 'modal' }} />
            
            {/* Profile Sub-pages */}
            <Stack.Screen name="Collections" component={CollectionsPage} options={{ title: '我的收藏' }} />
            <Stack.Screen name="ShoppingList" component={ShoppingListPage} options={{ title: '购物清单' }} />
            <Stack.Screen name="MyComments" component={MyCommentsPage} options={{ title: '我的评价' }} />
            <Stack.Screen name="Settings" component={SettingsPage} options={{ title: '设置' }} />
            <Stack.Screen name="FlavorProfile" component={FlavorProfilePage} options={{ title: '风味画像' }} />
            <Stack.Screen name="UserList" component={UserListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="UserPosts" component={UserPostsScreen} options={{ headerShown: false }} />
            
            {/* Other */}
            <Stack.Screen name="MyKitchen" component={MyKitchenPage} options={{ title: '我的冰箱' }} />
            <Stack.Screen name="Messages" component={MessagesPage} options={{ title: '消息' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ headerShown: false }} />
            
            <Stack.Screen name="PublishRecipe" component={PublishRecipeScreen} options={{ title: '发布菜谱', headerShown: false }} />
            <Stack.Screen name="PublishStore" component={PublishStoreScreen} options={{ title: '发布探店', headerShown: false }} />
            <Stack.Screen name="DraftBox" component={DraftBoxScreen} options={{ title: '草稿箱', headerShown: false }} />

            <Stack.Screen name="MapSelector" component={MapSelectorScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RoutePlan" component={RoutePlanScreen} options={{ headerShown: false }} />
            
            <Stack.Screen name="HealthProfile" component={HealthProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HealthCheckIn" component={HealthCheckInScreen} options={{ headerShown: false, presentation: 'modal' }} />

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
