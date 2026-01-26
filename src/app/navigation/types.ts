export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;

  // Tabs
  Main: undefined;
  
  // Explore
  WhatToEat: undefined;
  Search: undefined;
  SearchResult: { keyword: string };
  
  // Details
  RecipeDetail: { id: string };
  RestaurantDetail: { id: string };
  
  // AI Kitchen Features
  ImageToRecipe: undefined;
  ImageToCalorie: undefined;
  TextToImage: undefined;
  TextToRecipe: undefined;
  FridgeToRecipe: undefined;
  VoiceAssistant: undefined;
  
  // Profile Sub-pages
  Collections: undefined;
  ShoppingList: undefined;
  MyComments: undefined;
  Settings: undefined;
  FlavorProfile: undefined;
  
  // Core Components
  MyKitchen: undefined;
  Publish: undefined;
  Messages: undefined;
  
  // Publish
  PublishRecipe: undefined;
  PublishStore: undefined;
};

export type MainTabParamList = {
  Recommend: undefined;
  Explore: undefined;
  PublishTab: undefined; // Placeholder for the middle button
  AIKitchen: undefined;
  Profile: undefined;
};
