import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, Modal, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Comment, createComment } from '../../api/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

interface DetailBottomBarProps {
  targetId: number;
  targetType: 'recipe' | 'restaurant';
  likesCount: number;
  commentsCount: number;
  isCollected: boolean;
  onCollect: () => void;
  onCommentSuccess: (newComment: Comment) => void;
  replyTo: Comment | null;
  onCancelReply: () => void;
  currentUserAvatar?: string;
  onLike?: () => void;
  isLiked?: boolean;
}

const DetailBottomBar: React.FC<DetailBottomBarProps> = ({ 
  targetId, 
  targetType, 
  likesCount, 
  commentsCount, 
  isCollected, 
  onCollect, 
  onCommentSuccess,
  replyTo,
  onCancelReply,
  currentUserAvatar,
  onLike,
  isLiked
}) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (replyTo) {
      setIsInputVisible(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [replyTo]);

  const pickImage = async () => {
    if (selectedImages.length >= 9) {
      Alert.alert('提示', '最多只能上传9张图片');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('权限不足', '需要访问相册权限才能上传图片');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 9 - selectedImages.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) return;

    setIsSubmitting(true);
    try {
      const newComment = await createComment({
        content: content.trim(),
        target_id: targetId,
        target_type: targetType,
        parent_id: replyTo?.id,
        images: selectedImages
      });
      
      setContent('');
      setSelectedImages([]);
      setIsInputVisible(false);
      onCancelReply();
      onCommentSuccess(newComment);
    } catch (error) {
      console.error('Failed to post comment', error);
      Alert.alert('发送失败', '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseInput = () => {
    setIsInputVisible(false);
    onCancelReply();
    Keyboard.dismiss();
  };

  return (
    <>
      {/* Fixed Bottom Bar */}
      <View style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.barContent}>
            {/* User Avatar */}
            <Image 
              source={{ uri: currentUserAvatar || 'https://via.placeholder.com/40' }} 
              style={styles.userAvatarSmall} 
            />
            
            <TouchableOpacity 
              style={styles.inputPlaceholder}
              onPress={() => {
                setIsInputVisible(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              <Text style={styles.placeholderText}>爱评论的人运气都不差</Text>
              <View style={styles.placeholderIcons}>
                <Ionicons name="mic-outline" size={20} color="#999" style={{ marginRight: 8 }} />
                <Ionicons name="image-outline" size={20} color="#999" />
              </View>
            </TouchableOpacity>
            
            {/* Right Actions (Only show when not typing, or always show? Design says bottom bar has input)
                The screenshot shows input taking most space, and right side has icons.
                Wait, the user screenshot shows: Input bar (taking full width mostly), then icons on the right.
                Let's keep the icons.
            */}
            <View style={styles.actionsRow}>
              {/* Like Button */}
              <TouchableOpacity style={styles.actionItem} onPress={onLike}>
                 <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#FF6B6B" : "#333"} />
                 <Text style={styles.actionText}>{likesCount}</Text>
              </TouchableOpacity>

              {/* Collection Button */}
              <TouchableOpacity style={styles.actionItem} onPress={onCollect}>
                 <Ionicons name={isCollected ? "star" : "star-outline"} size={24} color={isCollected ? "#FFD700" : "#333"} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem}>
                 <Ionicons name="chatbubble-outline" size={24} color="#333" />
                 <Text style={styles.actionText}>{commentsCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Input Modal/Overlay */}
      <Modal
        visible={isInputVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseInput}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseInput}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'web' ? undefined : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.keyboardAvoidingView}
          >
            <TouchableOpacity activeOpacity={1} style={styles.inputArea}>
              {replyTo && (
                <View style={styles.replyBar}>
                  <Text style={styles.replyText}>回复 @{replyTo.user.username}</Text>
                  <TouchableOpacity onPress={onCancelReply}>
                    <Ionicons name="close" size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((img, index) => (
                    <View key={index} style={styles.previewImageWrapper}>
                      <Image source={{ uri: img.uri }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton} 
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={18} color="rgba(0,0,0,0.6)" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.realInput}
                  placeholder={replyTo ? `回复 @${replyTo.user.username}` : "爱评论的人运气都不差"}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={500}
                />
                
                <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sendButton, (!content.trim() && selectedImages.length === 0) && styles.sendButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.sendButtonText}>发送</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...theme.shadows.sm,
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  inputPlaceholder: {
    flex: 1,
    height: 36,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 13,
    color: '#999',
    includeFontPadding: false, // Android fix
  },
  placeholderIcons: {
    flexDirection: 'row',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputArea: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
  },
  replyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  replyText: {
    fontSize: 12,
    color: '#666',
  },
  imagePreviewContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  previewImageWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  realInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    textAlignVertical: 'center', // Android fix
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    includeFontPadding: false, // Android fix
  },
});

export default DetailBottomBar;
