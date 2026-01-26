import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { RootStackParamList } from '../../navigation/types';
import { generateRecipeImage, getHistory, AILog } from '../../../api/ai';

type GeneratedRecipeResultRouteProp = RouteProp<RootStackParamList, 'GeneratedRecipeResult'>;

const { width } = Dimensions.get('window');

const GeneratedRecipeResult = () => {
  const navigation = useNavigation();
  const route = useRoute<GeneratedRecipeResultRouteProp>();
  const { recipe } = route.params;
  
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<Array<{step_index: number, image_url: string, text: string}>>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [history, setHistory] = useState<AILog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getHistory(5);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerateImage = async (type: 'final' | 'steps') => {
    setIsGeneratingImage(true);
    setLoadingText(type === 'steps' ? 'Generating step images (this may take a while)...' : 'Creating final dish...');
    try {
      const data = await generateRecipeImage(recipe, type);
      
      if (type === 'final' && data.image_url) {
        setGeneratedImage(data.image_url);
        // Clear step images if switching to final view, or keep both? 
        // Let's keep specific view logic simple: showing one overrides/hides others or we show based on what exists.
        // For now, let's just set the data.
      } else if (type === 'steps' && data.images) {
        setStepImages(data.images);
        setGeneratedImage(null); // Clear final image to show steps carousel
      }
      
      Alert.alert('Success', 'Images generated successfully!');
      fetchHistory();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate images. Please try again.');
    } finally {
      setIsGeneratingImage(false);
      setLoadingText('');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
      </TouchableOpacity>
      
      <View style={styles.headerTitleContainer}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color="#1A1A1A" />
          <Text style={styles.aiBadgeText}>AI GENERATED</Text>
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
        
        <View style={styles.metaRow}>
          {recipe.difficulty && (
            <View style={styles.metaTag}>
              <Ionicons name="bar-chart-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          )}
          {recipe.cooking_time && (
            <View style={styles.metaTag}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{recipe.cooking_time}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderNutrition = () => {
    if (!recipe.nutrition) return null;
    
    // Calculate total for percentages (simplified)
    const total = (Number(recipe.nutrition.protein) || 0) + 
                  (Number(recipe.nutrition.fat) || 0) + 
                  (Number(recipe.nutrition.carbs) || 0);
    
    const getPercentage = (val: string | number) => {
      if (!total) return 0;
      return Math.round((Number(val) / total) * 100);
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NUTRITION BREAKDOWN</Text>
        <View style={styles.nutritionCard}>
          <View style={styles.caloriesCircle}>
            <Text style={styles.caloriesValue}>{recipe.nutrition.calories || '-'}</Text>
            <Text style={styles.caloriesLabel}>KCAL</Text>
          </View>
          
          <View style={styles.nutritionBars}>
            <View style={styles.nutritionBarRow}>
              <View style={styles.nutritionLabelRow}>
                <Text style={styles.nutritionName}>Protein</Text>
                <Text style={styles.nutritionWeight}>{recipe.nutrition.protein}g</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${getPercentage(recipe.nutrition.protein)}%`, backgroundColor: '#4ECDC4' }]} />
              </View>
            </View>
            
            <View style={styles.nutritionBarRow}>
              <View style={styles.nutritionLabelRow}>
                <Text style={styles.nutritionName}>Fat</Text>
                <Text style={styles.nutritionWeight}>{recipe.nutrition.fat}g</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${getPercentage(recipe.nutrition.fat)}%`, backgroundColor: '#FF6B6B' }]} />
              </View>
            </View>
            
            <View style={styles.nutritionBarRow}>
              <View style={styles.nutritionLabelRow}>
                <Text style={styles.nutritionName}>Carbs</Text>
                <Text style={styles.nutritionWeight}>{recipe.nutrition.carbs}g</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${getPercentage(recipe.nutrition.carbs)}%`, backgroundColor: '#FFE66D' }]} />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
        onPress={() => setActiveTab('ingredients')}
      >
        <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>所需食材</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
        onPress={() => setActiveTab('steps')}
      >
        <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>制作步骤</Text>
      </TouchableOpacity>
    </View>
  );

  const renderIngredients = () => (
    <View style={styles.listContainer}>
      {recipe.ingredients.map((item, index) => (
        <View key={index} style={styles.ingredientItem}>
          <Text style={styles.ingredientText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderSteps = () => (
    <View style={styles.listContainer}>
      {recipe.steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const handleHistoryPress = (item: AILog) => {
    if (item.feature === 'text-to-recipe' || item.feature === 'image-to-recipe' || item.feature === 'fridge-to-recipe') {
      navigation.push('GeneratedRecipeResult', { recipe: item.output_result });
    } else {
      // For image generation or others, we might just show an alert or handle differently
      Alert.alert('History Item', 'This is an image generation record.');
    }
  };

  const renderHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Generation History</Text>
      {isLoadingHistory ? (
        <ActivityIndicator color="#1A1A1A" />
      ) : (
        <View style={styles.historyList}>
          {history.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => handleHistoryPress(item)}
            >
              <View style={styles.historyIcon}>
                <Ionicons 
                  name={item.feature.includes('image') ? 'image-outline' : 'restaurant-outline'} 
                  size={18} 
                  color="#666" 
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.input_summary || 'AI Generated Content'}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.created_at).toLocaleDateString()} · {item.feature.replace(/-/g, ' ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCC" />
            </TouchableOpacity>
          ))}
          {history.length === 0 && (
             <Text style={styles.emptyHistoryText}>No history yet</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        <View style={styles.content}>
          {renderNutrition()}
          
          <View style={styles.section}>
            {renderTabs()}
            {activeTab === 'ingredients' ? renderIngredients() : renderSteps()}
          </View>

          <View style={styles.generationSection}>
            <View style={styles.generationHeader}>
              <Ionicons name="image-outline" size={20} color="#1A1A1A" />
              <Text style={styles.generationTitle}>Generate Recipe Images</Text>
            </View>
            <Text style={styles.generationDesc}>
              Create professional food photography for your recipe.
            </Text>
            
            <View style={styles.generationButtons}>
              <TouchableOpacity 
                style={[styles.genButton, isGeneratingImage && styles.disabledButton]} 
                onPress={() => handleGenerateImage('final')}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                   <ActivityIndicator color="#1A1A1A" size="small" />
                ) : (
                  <>
                    <Ionicons name="camera" size={18} color="#1A1A1A" />
                    <Text style={styles.genButtonText}>Final Dish</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.genButton, styles.secondaryGenButton, isGeneratingImage && styles.disabledButton]} 
                onPress={() => handleGenerateImage('steps')}
                disabled={isGeneratingImage}
              >
                 {isGeneratingImage ? (
                   <ActivityIndicator color="#FFFFFF" size="small" />
                 ) : (
                   <>
                     <Ionicons name="list" size={18} color="#FFFFFF" />
                     <Text style={styles.secondaryGenButtonText}>Steps</Text>
                   </>
                 )}
              </TouchableOpacity>
            </View>

            {isGeneratingImage && (
                <Text style={styles.loadingStatusText}>{loadingText}</Text>
            )}
            
            {generatedImage && (
              <View style={styles.generatedImageContainer}>
                <Image source={{ uri: generatedImage }} style={styles.generatedImage} />
                <View style={styles.generatedLabel}>
                  <Text style={styles.generatedLabelText}>FINAL DISH</Text>
                </View>
              </View>
            )}

            {stepImages.length > 0 && !generatedImage && (
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                             const contentOffsetX = e.nativeEvent.contentOffset.x;
                             const viewWidth = width - 40 - 48; // Screen width - outer padding - inner padding
                             const index = Math.round(contentOffsetX / viewWidth);
                             setActiveStepIndex(index);
                        }}
                    >
                        {stepImages.map((item, index) => {
                            const viewWidth = width - 40 - 48;
                            return (
                                <View key={index} style={{ width: viewWidth }}>
                                    <View style={styles.stepImageWrapper}>
                                        <Image source={{ uri: item.image_url }} style={styles.stepImage} />
                                    </View>
                                    <View style={styles.stepCaption}>
                                        <Text style={styles.stepCaptionTitle}>STEP {item.step_index + 1}</Text>
                                        <Text style={styles.stepCaptionText}>{item.text}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                    
                    <View style={styles.paginationDots}>
                        {stepImages.map((_, index) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.dot, 
                                    activeStepIndex === index && styles.activeDot
                                ]} 
                            />
                        ))}
                    </View>
                </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert('Saved', 'Recipe saved to history!')}>
             <Ionicons name="bookmark" size={20} color="#1A1A1A" />
             <Text style={styles.saveButtonText}>Save to Collection</Text>
          </TouchableOpacity>

          {renderHistory()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    paddingRight: 20,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#999',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nutritionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  caloriesCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  caloriesValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  caloriesLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    marginTop: 2,
  },
  nutritionBars: {
    flex: 1,
    gap: 12,
  },
  nutritionBarRow: {
    width: '100%',
  },
  nutritionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutritionName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  nutritionWeight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1A1A1A',
    fontWeight: '800',
  },
  listContainer: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
  },
  ingredientText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  generationSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
  },
  generationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  generationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  generationDesc: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
    lineHeight: 20,
  },
  generationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  genButtonText: {
    color: '#1A1A1A',
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryGenButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryGenButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  generatedImageContainer: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 240,
  },
  generatedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  generatedLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  generatedLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 10,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    gap: 16,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginTop: 20,
  },
  loadingStatusText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  carouselContainer: {
    marginTop: 24,
  },
  stepImageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  stepImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stepCaption: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  stepCaptionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1,
  },
  stepCaptionText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 22,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 20,
  },
});

export default GeneratedRecipeResult;
