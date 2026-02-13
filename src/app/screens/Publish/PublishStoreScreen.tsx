import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, 
  ActivityIndicator, Image as RNImage, Platform, KeyboardAvoidingView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import VideoDisplay from '../../components/VideoDisplay';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { createRestaurant } from '../../../api/content';
import { uploadFile } from '../../../api/upload';
import { LocationPOI } from '../../../api/maps';
import { useRoute } from '@react-navigation/native';
import { useDraftStore } from '../../../store/useDraftStore';

const PublishStoreScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { draftId } = route.params || {};
  const { addDraft, getDraft, removeDraft } = useDraftStore();
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<LocationPOI | null>(null);
  const [hours, setHours] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentDraftId) {
        const draft = getDraft(currentDraftId);
        if (draft && draft.type === 'store') {
            setTitle(draft.title);
            setContent(draft.content || '');
            setRating(draft.rating || 5);
            setImages(draft.images || []);
            setVideo(draft.video || null);
            setAddress(draft.address || '');
            setLocation(draft.location || null);
            setHours(draft.hours || '');
            setPhone(draft.phone || '');
        }
    }
  }, [currentDraftId]);

  const handleSaveDraft = () => {
    if (!title.trim()) {
        Alert.alert('提示', '请输入店名以便保存草稿');
        return;
    }

    const draftIdToSave = currentDraftId || Date.now().toString(36) + Math.random().toString(36).substr(2);

    addDraft({
        id: draftIdToSave,
        type: 'store',
        title,
        content,
        rating,
        images,
        video,
        address,
        location,
        hours,
        phone,
        updatedAt: Date.now()
    });

    setCurrentDraftId(draftIdToSave);
    Alert.alert('提示', '草稿已保存');
  };
  
  // --- Image Picker ---
  const pickImages = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择照片');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 9 - images.length, // Limit to 9 images total
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

  // --- Video Picker ---
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择视频');
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

  // --- Location Selection ---
  const handleOpenMap = () => {
    let initialLocation;
    if (location && location.location) {
      const [lng, lat] = location.location.split(',').map(Number);
      initialLocation = { latitude: lat, longitude: lng };
    }

    navigation.navigate('MapSelector', {
      initialLocation,
      onSelect: (selectedLocation: LocationPOI) => {
        setLocation(selectedLocation);
        setAddress(selectedLocation.address || selectedLocation.name);
      }
    } as any);
  };

  // --- Submit ---
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('提示', '请填写店名和介绍');
      return;
    }
    if (images.length === 0) {
      Alert.alert('提示', '请至少上传一张图片');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Images
      const uploadedUrls: string[] = [];
      for (const img of images) {
        const url = await uploadFile(img.uri);
        uploadedUrls.push(url);
      }

      // Upload Video
      let uploadedVideo = null;
      if (video) {
        uploadedVideo = await uploadFile(video.uri);
      }

      // 2. Create Restaurant
      await createRestaurant({
        name: title,
        title: title, // Backend expects both? Schema has both.
        content,
        address: address || (location ? location.address : '未知地点'),
        rating: rating,
        images: uploadedUrls,
        video: uploadedVideo,
        cuisine: '其他', // Could add a picker for this
        hours: hours,
        phone: phone,
        latitude: location ? parseFloat(location.location.split(',')[1]) : undefined,
        longitude: location ? parseFloat(location.location.split(',')[0]) : undefined,
      });
      
      if (currentDraftId) {
        removeDraft(currentDraftId);
      }

      Alert.alert('发布成功', '您的探店笔记已发布！', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('发布失败', '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Components ---
  const renderStars = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons 
              name={star <= rating ? "star" : "star-outline"} 
              size={28} 
              color={star <= rating ? theme.colors.primary : 'rgba(255,255,255,0.3)'} 
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>{rating}.0 分</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>发布探店</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={handleSaveDraft} style={styles.draftBtnHeader}>
              <Text style={styles.draftText}>存草稿</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handlePublish} 
              style={[styles.publishButton, isSubmitting && styles.disabledButton]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.publishButtonText}>发布</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Upload Area */}
            <View style={styles.imageSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {/* Video Preview */}
                {video && (
                  <View style={styles.imageWrapper}>
                    <VideoDisplay
                      uri={video.uri}
                      style={styles.imageThumbnail}
                      contentFit="cover"
                    />
                    <View style={styles.videoBadge}>
                      <Ionicons name="videocam" size={16} color="#fff" />
                    </View>
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={removeVideo}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                )}

                {images.map((img, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumbnail} contentFit="cover" />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {images.length < 9 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                    <Ionicons name="camera-outline" size={28} color="#00C896" />
                    <Text style={styles.addImageText}>添加照片</Text>
                  </TouchableOpacity>
                )}

                {!video && (
                  <TouchableOpacity style={[styles.addImageButton, { marginLeft: 10 }]} onPress={pickVideo}>
                    <Ionicons name="videocam-outline" size={28} color="#29B6F6" />
                    <Text style={[styles.addImageText, { color: '#29B6F6' }]}>添加视频</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <Text style={styles.imageHint}>{images.length}/9 张图 {video ? '+ 1 视频' : ''}</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.label}>店名</Text>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="请输入店铺名称" 
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.label}>评分</Text>
              </View>
              {renderStars()}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDecor} />
                <Text style={styles.label}>探店心得</Text>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="分享你的探店体验，推荐菜品、环境、服务等..." 
                placeholderTextColor="#999"
                multiline 
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
              />
            </View>

            {/* Metadata */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.optionRow} 
                onPress={handleOpenMap}
              >
                <View style={styles.iconBox}>
                  <Ionicons name="location-outline" size={20} color="#00C896" />
                </View>
                <Text style={[styles.optionText, !address && { color: '#999' }]}>
                  {address || '添加地点'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.optionRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="time-outline" size={20} color="#00C896" />
                </View>
                <TextInput 
                  style={styles.optionInput} 
                  placeholder="营业时间 (选填)" 
                  placeholderTextColor="#999"
                  value={hours}
                  onChangeText={setHours}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.optionRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="call-outline" size={20} color="#00C896" />
                </View>
                <TextInput 
                  style={styles.optionInput} 
                  placeholder="联系电话 (选填)" 
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={{ height: 100 }} />

          </ScrollView>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  publishButton: {
    backgroundColor: '#00C896',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageScroll: {
    paddingBottom: 8,
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
  imageThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  removeImageButton: {
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
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addImageText: {
    marginTop: 4,
    fontSize: 11,
    color: '#00C896',
    fontWeight: '600',
  },
  imageHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#AAA',
    textAlign: 'right',
  },
  formGroup: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionDecor: {
    width: 4,
    height: 16,
    backgroundColor: '#00C896',
    marginRight: 8,
    transform: [{ skewX: '-12deg' }],
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#FFA502',
    fontWeight: '800',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: 60,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  optionInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 60, 
  },
});

export default PublishStoreScreen;