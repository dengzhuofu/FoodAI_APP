import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import VideoDisplay from '../../components/VideoDisplay';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { createRecipe, getCommonTags } from '../../../api/content';
import Toast from '../../components/Toast';
import { uploadFile } from '../../../api/upload';
import { useRoute } from '@react-navigation/native';
import { useDraftStore } from '../../../store/useDraftStore';

interface Ingredient {
  name: string;
  amount: string;
}

interface Step {
  description: string;
  image?: string;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const COOKING_TIMES = ['15 mins', '30 mins', '45 mins', '1 hour', '> 1 hour'];
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink'];

const PublishRecipe = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { draftId } = route.params || {};
  const { addDraft, getDraft, removeDraft } = useDraftStore();
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<Step[]>([{ description: '', image: undefined }]);
  
  // Metadata State
  const [difficulty, setDifficulty] = useState('Medium');
  const [cookingTime, setCookingTime] = useState('30 mins');
  const [category, setCategory] = useState('Lunch');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Modal State
  const [activeModal, setActiveModal] = useState<'difficulty' | 'time' | 'category' | 'tags' | null>(null);

  useEffect(() => {
    getCommonTags().then(setAvailableTags).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentDraftId) {
      const draft = getDraft(currentDraftId);
      if (draft && draft.type === 'recipe') {
        setTitle(draft.title);
        setDescription(draft.description || '');
        setImages(draft.images || []);
        setVideo(draft.video || null);
        setIngredients(draft.ingredients && draft.ingredients.length > 0 ? draft.ingredients : [{ name: '', amount: '' }]);
        setSteps(draft.steps && draft.steps.length > 0 ? draft.steps : [{ description: '', image: undefined }]);
        setDifficulty(draft.difficulty || 'Medium');
        setCookingTime(draft.cookingTime || '30 mins');
        setCategory(draft.category || 'Lunch');
        setSelectedTags(draft.tags || []);
      }
    }
  }, [currentDraftId]);

  // 1. Image Picker for Recipe Cover/Gallery
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('需要相册权限才能选择图片', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 9 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 1.5 Video Picker
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('需要相册权限才能选择视频', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
  };

  const removeVideo = () => {
    setVideo(null);
  };

  // 2. Ingredients Logic
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // 3. Steps Logic
  const addStep = () => {
    setSteps([...steps, { description: '', image: undefined }]);
  };

  const updateStepText = (index: number, text: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description: text };
    setSteps(newSteps);
  };

  const pickStepImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], image: result.assets[0].uri };
      setSteps(newSteps);
    }
  };
  
  const removeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      showToast('请输入标题以便保存草稿', 'error');
      return;
    }

    const draftIdToSave = currentDraftId || Date.now().toString(36) + Math.random().toString(36).substr(2);

    addDraft({
      id: draftIdToSave,
      type: 'recipe',
      title,
      description,
      images,
      video,
      ingredients,
      steps,
      difficulty,
      cookingTime,
      category,
      tags: selectedTags,
      updatedAt: Date.now()
    });

    setCurrentDraftId(draftIdToSave);
    showToast('草稿已保存', 'success');
  };

  // Submit
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('请填写菜谱名称和简介', 'error');
      return;
    }
    
    if (images.length === 0) {
      showToast('请至少上传一张菜品图片', 'error');
      return;
    }
    
    // Validate ingredients
    const validIngredients = ingredients.filter(i => i.name.trim() && i.amount.trim());
    if (validIngredients.length === 0) {
      showToast('请至少填写一项食材', 'error');
      return;
    }

    // Validate steps
    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length === 0) {
      showToast('请至少填写一个步骤', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images
      const uploadedImages: string[] = [];
      
      // Helper to upload with error handling
      const handleUpload = async (uri: string) => {
        try {
          return await uploadFile(uri);
        } catch (e) {
          console.error('Upload failed for', uri, e);
          throw new Error('Image upload failed');
        }
      };

      // Upload main images
      for (const img of images) {
        const url = await handleUpload(img.uri);
        uploadedImages.push(url);
      }

      // Upload video
      let uploadedVideo = null;
      if (video) {
        uploadedVideo = await handleUpload(video.uri);
      }

      // Upload step images
      const processedSteps = await Promise.all(validSteps.map(async (step) => {
        if (step.image) {
          const url = await handleUpload(step.image);
          return { ...step, image: url };
        }
        return step;
      }));

      const recipeData = {
        title,
        description,
        cover_image: uploadedImages[0], // Use first uploaded image as cover
        images: uploadedImages,
        video: uploadedVideo,
        ingredients: validIngredients,
        steps: processedSteps,
        cooking_time: cookingTime,
        difficulty: difficulty,
        category: category,
        tags: selectedTags,
        cuisine: "General" 
      };
      
      await createRecipe(recipeData);
      
      if (currentDraftId) {
        removeDraft(currentDraftId);
      }

      showToast('发布成功！', 'success');
      
      // Delay navigation to let toast show
      setTimeout(() => {
        navigation.navigate('Main', { 
          screen: 'Recommend'
        });
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      const detail = error?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : detail
            ? JSON.stringify(detail)
            : (typeof error?.message === 'string' ? error.message : null);
      showToast(message || '发布失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectionModal = () => {
    if (!activeModal) return null;

    let data: string[] = [];
    let onSelect: (val: string) => void = () => {};
    let title = '';
    let isMulti = false;

    switch (activeModal) {
      case 'difficulty':
        data = DIFFICULTIES;
        onSelect = setDifficulty;
        title = '选择难度';
        break;
      case 'time':
        data = COOKING_TIMES;
        onSelect = setCookingTime;
        title = '选择烹饪时间';
        break;
      case 'category':
        data = CATEGORIES;
        onSelect = setCategory;
        title = '选择分类';
        break;
      case 'tags':
        data = availableTags;
        isMulti = true;
        title = '选择标签';
        break;
    }

    const toggleTag = (tag: string) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    };

    return (
      <Modal
        visible={!!activeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = isMulti 
                  ? selectedTags.includes(item)
                  : (activeModal === 'difficulty' && difficulty === item ||
                     activeModal === 'time' && cookingTime === item ||
                     activeModal === 'category' && category === item);

                return (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => {
                      if (isMulti) {
                        toggleTag(item);
                      } else {
                        onSelect(item);
                        setActiveModal(null);
                      }
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && { color: theme.colors.primary, fontWeight: 'bold' }]}>{item}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            {isMulti && (
              <TouchableOpacity 
                style={[styles.addBtn, { marginTop: 16, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]} 
                onPress={() => setActiveModal(null)}
              >
                <Text style={[styles.addBtnText, { color: '#000' }]}>完成</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>发布菜谱</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={handleSaveDraft} style={styles.draftBtnHeader}>
              <Text style={styles.draftText}>存草稿</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.publishBtnHeader}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.publishText}>发布</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Images & Video */}
            <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
              {/* Video Preview */}
              {video && (
                <View style={styles.imageWrapper}>
                  <VideoDisplay
                    uri={video.uri}
                    style={styles.uploadedImage}
                    contentFit="cover"
                  />
                  <View style={styles.videoBadge}>
                    <Ionicons name="videocam" size={16} color="#fff" />
                  </View>
                  <TouchableOpacity style={styles.removeImageBtn} onPress={removeVideo}>
                    <Ionicons name="close-circle" size={20} color="#FF4D4D" />
                  </TouchableOpacity>
                </View>
              )}

              {images.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.uploadedImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF4D4D" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="camera" size={28} color="#00C896" />
                <Text style={styles.addImageText}>{images.length > 0 ? '加图' : '上传图片'}</Text>
              </TouchableOpacity>

              {!video && (
                <TouchableOpacity style={[styles.addImageBtn, { marginLeft: 12 }]} onPress={pickVideo}>
                  <Ionicons name="videocam-outline" size={28} color="#29B6F6" />
                  <Text style={[styles.addImageText, { color: '#29B6F6' }]}>上传视频</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* 2. Basic Info */}
            <View style={styles.section}>
              <TextInput
                style={styles.titleInput}
                placeholder="菜谱名称 (如: 爆炒嫩牛肉)"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                maxLength={30}
              />
              <TextInput
                style={styles.descInput}
                placeholder="分享这道菜背后的故事，或者它的独特风味..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              
              {/* Metadata Selectors */}
              <View style={styles.metaRow}>
                <TouchableOpacity style={styles.metaChip} onPress={() => setActiveModal('time')}>
                  <Ionicons name="time-outline" size={16} color="#555" />
                  <Text style={styles.metaText}>{cookingTime}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.metaChip} onPress={() => setActiveModal('difficulty')}>
                  <Ionicons name="speedometer-outline" size={16} color="#555" />
                  <Text style={styles.metaText}>{difficulty}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.metaChip} onPress={() => setActiveModal('category')}>
                  <Ionicons name="restaurant-outline" size={16} color="#555" />
                  <Text style={styles.metaText}>{category}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.metaChip} onPress={() => setActiveModal('tags')}>
                  <Ionicons name="pricetags-outline" size={16} color="#555" />
                  <Text style={styles.metaText}>{selectedTags.length > 0 ? selectedTags.join(', ') : '添加标签'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Ingredients */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.sectionTitle}>食材清单</Text>
              </View>
              
              {ingredients.map((item, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.ingInput}
                      placeholder="食材名"
                      placeholderTextColor="#BBB"
                      value={item.name}
                      onChangeText={(text) => updateIngredient(index, 'name', text)}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 0.6 }]}>
                    <TextInput
                      style={styles.ingInput}
                      placeholder="用量"
                      placeholderTextColor="#BBB"
                      value={item.amount}
                      onChangeText={(text) => updateIngredient(index, 'amount', text)}
                    />
                  </View>
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeIcon}>
                      <Ionicons name="remove-circle" size={24} color="#FF4D4D" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
                <Ionicons name="add" size={20} color="#00C896" />
                <Text style={styles.addBtnText}>添加食材</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Steps */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.sectionTitle}>烹饪步骤</Text>
              </View>

              {steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepIndex}>{index + 1}</Text>
                    </View>
                    {steps.length > 1 && (
                      <TouchableOpacity onPress={() => removeStep(index)}>
                        <Text style={styles.deleteText}>删除</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <TextInput
                      style={styles.stepInput}
                      placeholder={`步骤 ${index + 1} 说明...`}
                      placeholderTextColor="#BBB"
                      multiline
                      value={step.description}
                      onChangeText={(text) => updateStepText(index, text)}
                    />
                    <TouchableOpacity style={styles.stepImageBtn} onPress={() => pickStepImage(index)}>
                      {step.image ? (
                        <Image source={{ uri: step.image }} style={styles.stepImage} />
                      ) : (
                        <View style={styles.stepImagePlaceholder}>
                          <Ionicons name="image-outline" size={24} color="#CCC" />
                          <Text style={styles.stepImageText}>添加图</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addStep}>
                <Ionicons name="add" size={20} color="#00C896" />
                <Text style={styles.addBtnText}>添加步骤</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
        
        {renderSelectionModal()}
        <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type}
          onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  draftBtnHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  draftText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  publishBtnHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#00C896',
    borderRadius: 20,
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  publishText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  imageScroll: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 4,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 11,
    color: '#00C896',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#FAFAFA',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  descInput: {
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 24,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionDecor: {
    width: 4,
    height: 18,
    backgroundColor: '#00C896',
    marginRight: 10,
    transform: [{ skewX: '-12deg' }],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ingInput: {
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  removeIcon: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderStyle: 'dashed',
  },
  addBtnText: {
    color: '#00C896',
    fontWeight: '700',
    fontSize: 14,
  },
  stepContainer: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#00C896',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ skewX: '-10deg' }],
  },
  stepIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    transform: [{ skewX: '10deg' }],
  },
  deleteText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  stepContent: {
    flexDirection: 'row',
    gap: 12,
  },
  stepInput: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    height: 100,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  stepImageBtn: {
    width: 100,
    height: 100,
  },
  stepImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  stepImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  stepImageText: {
    fontSize: 10,
    color: '#BBB',
    marginTop: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});

export default PublishRecipe;