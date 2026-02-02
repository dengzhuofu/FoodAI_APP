import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, 
  ActivityIndicator, Image as RNImage 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { theme } from '../../styles/theme';
import { createRestaurant } from '../../../api/content';
import { uploadFile } from '../../../api/upload';
import { LocationPOI } from '../../../api/maps';

const PublishStoreScreen = () => {
  const navigation = useNavigation<any>();
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<LocationPOI | null>(null);
  const [hours, setHours] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

      // 2. Create Restaurant
      await createRestaurant({
        name: title,
        title: title, // Backend expects both? Schema has both.
        content,
        address: address || (location ? location.address : '未知地点'),
        rating: rating,
        images: uploadedUrls,
        cuisine: '其他', // Could add a picker for this
        hours: hours,
        phone: phone,
        latitude: location ? parseFloat(location.location.split(',')[1]) : undefined,
        longitude: location ? parseFloat(location.location.split(',')[0]) : undefined,
      });
      
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
              size={24} 
              color={theme.colors.secondary} 
              style={{ marginRight: 4 }}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>{rating}.0 分</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={theme.typography.h2}>发布探店</Text>
        <TouchableOpacity 
          onPress={handlePublish} 
          style={[styles.publishButton, isSubmitting && styles.disabledButton]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.publishButtonText}>发布</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Upload Area */}
        <View style={styles.imageSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imageThumbnail} contentFit="cover" />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 9 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="camera-outline" size={32} color={theme.colors.textTertiary} />
                <Text style={styles.addImageText}>添加照片</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={styles.imageHint}>{images.length}/9 张</Text>
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>店名</Text>
        <TextInput 
          style={styles.input} 
          placeholder="请输入店铺名称" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>评分</Text>
        {renderStars()}

        <Text style={styles.label}>探店心得</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="分享你的探店体验，推荐菜品、环境、服务等..." 
          multiline 
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        {/* Metadata */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.optionRow} 
            onPress={handleOpenMap}
          >
            <Ionicons name="location-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.optionText, !address && { color: theme.colors.textTertiary }]}>
              {address || '添加地点'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.optionRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.text} />
            <TextInput 
              style={styles.optionInput} 
              placeholder="营业时间 (选填)" 
              value={hours}
              onChangeText={setHours}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.optionRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.text} />
            <TextInput 
              style={styles.optionInput} 
              placeholder="联系电话 (选填)" 
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  publishButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.md,
  },
  imageSection: {
    marginBottom: theme.spacing.lg,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  addImageText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  imageHint: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'right',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 120,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    height: 56,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  optionInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceVariant,
    marginLeft: 48, 
  },
});

export default PublishStoreScreen;
