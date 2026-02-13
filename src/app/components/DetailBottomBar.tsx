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
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    backgroundColor: theme.colors.surface,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  inputPlaceholder: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 20, // Full pill
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    includeFontPadding: false,
    fontWeight: '500',
  },
  placeholderIcons: {
    flexDirection: 'row',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputArea: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  replyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  replyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
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
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  realInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 16,
    textAlignVertical: 'center',
    color: theme.colors.text,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    includeFontPadding: false,
    fontStyle: 'italic',
  },
});

export default DetailBottomBar;
